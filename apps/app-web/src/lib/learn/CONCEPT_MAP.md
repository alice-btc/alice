# Learn retrieval map

This is an inspectable retrieval vocabulary, not a second factual corpus or a
model-generated graph. `concept-map.ts` declares concept IDs, French/English
aliases and one-hop subject relations. These links say which teaching subjects
are adjacent; they do not claim equivalence and are never quoted as evidence.

Each document edge is derived from a literal alias in a named field of the
Plan B catalog. The edge records the document ID, concept ID, field
and alias. Theory courses `explain`, practical courses and tutorials `apply`,
and dictionary entries `define`. These roles describe catalog format, not an
assertion that every passage in that document answers every related question.

`learn-candidates.ts` combines word matching with direct concept
matches and purpose. Nearby concepts can refine an already relevant candidate,
but cannot qualify an otherwise unrelated resource. The UI recommendation
scorer and its once-per-chat policy are separate from retrieval. Retrieval ranks a separate
list capped at three resources, fetched concurrently with a 1.2 second ceiling
inside the 1.5 second Learn provider budget. Candidates are consumed
in rank order; failed, stalled and rejected passages permit the next candidate,
and unused fetches are aborted. The dictionary lookup also has a 1.2 second caller wait bound so it cannot discard an available course at the outer bridge deadline; its shared cached request is neither aborted nor evicted. Unrelated text is never substituted on failure.

The passage needs title/body evidence. A theory chapter can explain
a named concept through a one-hop neighbour (for example payment channels for
Lightning), but its emitted text must name the requested concepts and meet the
question coverage gate. Two-sided comparisons keep their stricter
checks. Tutorials use the strict excerpt filter. Definition and course
ordering uses their actual excerpt tags and purpose, with the original
definition-first order for unknown subjects or ties. Source links and author
attributions are preserved. A secondary citation uses its exact source label
on a dedicated line attached to the first nonempty excerpt paragraph, so
paragraph trimming removes the citation together with its evidence.

The seed map covers Lightning, invoices, routing, liquidity, transactions,
UTXOs, inputs, outputs, fees, issuance, mining, consensus, nodes, wallets,
backup and privacy. It is not exhaustive, does not infer a user profile, does
not replace semantic E5 retrieval of the curated notes and does not introduce
semantic embeddings of the whole Learn library. Any additions must preserve
literal metadata evidence, explicit bounded relationships and off-topic tests.

The `learn-candidates.test.ts` cases cover ranking, purpose, evidence,
multilingual aliases, bounded neighbours, rejected/failed/stalled candidates
and the three-request ceiling without a model.
