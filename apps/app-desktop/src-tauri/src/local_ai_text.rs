// Pure pieces of the mobile engine (src/local_ai_engine.rs), kept apart
// from llama.cpp so the desktop build runs their tests.
#![cfg_attr(not(mobile), allow(dead_code))]

/// Memory a model needs beyond its file: the KV cache of a 4096-token
/// context, llama.cpp's compute buffers and the app itself. The same figures
/// are in packages/alice-ai/src/local-model-memory.ts, which labels the
/// catalog before a download; this check runs again before the load, on the
/// memory left at that moment.
const MODEL_MEMORY_FILE_SHARE: u64 = 8;
const MODEL_MEMORY_OVERHEAD_BYTES: u64 = 640 << 20;

pub fn model_memory_need(size_bytes: u64) -> u64 {
    size_bytes + size_bytes / MODEL_MEMORY_FILE_SHARE + MODEL_MEMORY_OVERHEAD_BYTES
}

pub fn common_prefix<T: PartialEq>(a: &[T], b: &[T]) -> usize {
    a.iter().zip(b).take_while(|(x, y)| x == y).count()
}

/// Turns token pieces into text, holding back the bytes of a character cut
/// across two tokens until the rest arrives.
#[derive(Default)]
pub struct Utf8Pieces {
    pending: Vec<u8>,
}

impl Utf8Pieces {
    pub fn push(&mut self, bytes: &[u8]) -> Option<String> {
        self.pending.extend_from_slice(bytes);
        let complete = match std::str::from_utf8(&self.pending) {
            Ok(_) => self.pending.len(),
            Err(e) => match e.error_len() {
                // An invalid sequence: it is replaced and the rest waits.
                Some(bad) => e.valid_up_to() + bad,
                // A character cut short at the end: it waits.
                None => e.valid_up_to(),
            },
        };
        if complete == 0 {
            return None;
        }
        let text = String::from_utf8_lossy(&self.pending[..complete]).into_owned();
        self.pending.drain(..complete);
        Some(text)
    }
}

/// Keeps a leading `<think>…</think>` block out of the answer, as
/// llama-server does on the desktop with its reasoning format: the webview
/// shows the answer only. A block never closed (the budget ran out inside
/// it) leaves an empty answer marked truncated.
#[derive(Default)]
pub struct ThinkFilter {
    state: ThinkState,
    buffer: String,
    pub content: String,
}

#[derive(Default, PartialEq)]
enum ThinkState {
    #[default]
    Start,
    Thinking,
    /// The block is closed; the blank lines after it are dropped.
    AfterThink,
    Answer,
}

const THINK_OPEN: &str = "<think>";
const THINK_CLOSE: &str = "</think>";

impl ThinkFilter {
    pub fn push(&mut self, text: &str) -> Option<String> {
        match self.state {
            ThinkState::Answer => self.emit(text.to_owned()),
            ThinkState::AfterThink => {
                let trimmed = text.trim_start();
                if trimmed.is_empty() {
                    return None;
                }
                self.state = ThinkState::Answer;
                self.emit(trimmed.to_owned())
            }
            ThinkState::Thinking => {
                self.buffer.push_str(text);
                self.drain_thinking()
            }
            ThinkState::Start => {
                self.buffer.push_str(text);
                let trimmed = self.buffer.trim_start();
                if let Some(rest) = trimmed.strip_prefix(THINK_OPEN) {
                    self.buffer = rest.to_owned();
                    self.state = ThinkState::Thinking;
                    self.drain_thinking()
                } else if THINK_OPEN.starts_with(trimmed) {
                    // Still possibly the start of a think tag.
                    None
                } else {
                    self.state = ThinkState::Answer;
                    let out = std::mem::take(&mut self.buffer);
                    self.emit(out)
                }
            }
        }
    }

    fn drain_thinking(&mut self) -> Option<String> {
        let end = self.buffer.find(THINK_CLOSE)?;
        let rest = self.buffer[end + THINK_CLOSE.len()..].trim_start().to_owned();
        self.buffer.clear();
        self.state = ThinkState::AfterThink;
        if rest.is_empty() {
            None
        } else {
            self.state = ThinkState::Answer;
            self.emit(rest)
        }
    }

    pub fn finish(&mut self) -> Option<String> {
        if self.state == ThinkState::Start && !self.buffer.is_empty() {
            let out = std::mem::take(&mut self.buffer);
            return self.emit(out);
        }
        None
    }

    fn emit(&mut self, text: String) -> Option<String> {
        if text.is_empty() {
            return None;
        }
        self.content.push_str(&text);
        Some(text)
    }
}

#[cfg(test)]
mod tests {
    use super::{common_prefix, model_memory_need, ThinkFilter, Utf8Pieces};

    fn run(filter: &mut ThinkFilter, pieces: &[&str]) -> Vec<String> {
        let mut out: Vec<String> = pieces.iter().filter_map(|p| filter.push(p)).collect();
        out.extend(filter.finish());
        out
    }

    #[test]
    fn a_leading_think_block_is_kept_out_of_the_answer() {
        let mut filter = ThinkFilter::default();
        let out = run(&mut filter, &["<th", "ink>", "let me", " see</think>", "\n\nBitcoin", " is"]);
        assert_eq!(out, vec!["Bitcoin", " is"]);
        assert_eq!(filter.content, "Bitcoin is");
    }

    #[test]
    fn an_answer_without_a_think_block_streams_as_it_comes() {
        let mut filter = ThinkFilter::default();
        let out = run(&mut filter, &["<", "b>bold", "</b>"]);
        assert_eq!(out, vec!["<b>bold", "</b>"]);
        let mut filter = ThinkFilter::default();
        assert_eq!(run(&mut filter, &["Hello", ", world"]), vec!["Hello", ", world"]);
        let mut filter = ThinkFilter::default();
        assert_eq!(run(&mut filter, &["<"]), vec!["<"]);
    }

    #[test]
    fn a_think_block_never_closed_leaves_an_empty_answer() {
        let mut filter = ThinkFilter::default();
        assert!(run(&mut filter, &["<think>", "still thinking"]).is_empty());
        assert_eq!(filter.content, "");
    }

    #[test]
    fn a_character_split_across_tokens_waits_for_its_end() {
        let mut pieces = Utf8Pieces::default();
        // "é" is c3 a9.
        assert_eq!(pieces.push(b"caf\xc3"), Some("caf".to_owned()));
        assert_eq!(pieces.push(b"\xa9!"), Some("\u{e9}!".to_owned()));
        assert_eq!(pieces.push(b"\xff"), Some("\u{fffd}".to_owned()));
    }

    #[test]
    fn the_common_start_of_two_prompts_is_counted() {
        let a = [1, 2, 3, 4];
        let b = [1, 2, 9];
        assert_eq!(common_prefix(&a, &b), 2);
        assert_eq!(common_prefix(&a, &a), 4);
        assert_eq!(common_prefix(&[], &a), 0);
    }

    #[test]
    fn the_memory_need_matches_the_webview_figures() {
        // packages/alice-ai/src/local-model-memory.test.ts checks the same.
        assert_eq!(model_memory_need(2_740_937_888), 2_740_937_888 + 342_617_236 + (640 << 20));
    }
}
