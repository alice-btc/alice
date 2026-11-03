// A failure a local or custom backend reports while sending, named by a code.
//
// These backends used to throw a bare `Error` with an English sentence, and
// the chat could only show that sentence. The code lets the chat say what
// happened in its own language and words; the message stays what it was, for
// logs and for the technical line of the message menu.

export type AIBackendErrorCode =
  /** Alice Local has no model loaded, or is still starting. */
  | 'local_not_ready'
  /** The local inference server answered with an HTTP error. */
  | 'local_server_error'
  /** This build has no local engine at all (the browser). */
  | 'local_unavailable'
  /** Custom mode is selected but no server address was saved. */
  | 'custom_not_configured'
  /** The custom server answered with an HTTP error. */
  | 'custom_server_error';

export class AIBackendError extends Error {
  readonly code: AIBackendErrorCode;
  readonly status?: number;

  constructor(code: AIBackendErrorCode, message: string, status?: number) {
    super(message);
    this.name = 'AIBackendError';
    this.code = code;
    this.status = status;
  }
}
