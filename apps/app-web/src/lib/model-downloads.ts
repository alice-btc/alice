import {
  installDesktopModel,
  notifyLocalModelInstalled,
  setActiveModelId,
  type LocalModelId,
} from '@alice-wallet/alice-ai';

// Module-level download manager: a model download belongs to the app, not to
// the settings page that happened to start it. Leaving settings (or closing
// the dialog) no longer loses the progress display, and completion is
// announced by a toast wherever the user is. State is in-memory: an app
// restart drops it, and the desktop shell removes the partial file of a
// failed download.

export type ModelDownload =
  | { status: 'downloading'; progress: number }
  // The whole file is on disk and the shell is checking its size and SHA-256;
  // `progress` is the share of the file hashed so far.
  | { status: 'verifying'; progress: number }
  | { status: 'installed'; progress: 1 }
  | { status: 'error'; progress: 0; error: string };

export const MODEL_DOWNLOAD_EVENT = 'alice-model-download';

const downloads = new Map<LocalModelId, ModelDownload>();

function emit(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(MODEL_DOWNLOAD_EVENT));
}

export function getModelDownloads(): ReadonlyMap<LocalModelId, ModelDownload> {
  return downloads;
}

type RunningModelDownload = Extract<ModelDownload, { status: 'downloading' | 'verifying' }>;

export function isModelDownloadRunning(download: ModelDownload | undefined): download is RunningModelDownload {
  return download?.status === 'downloading' || download?.status === 'verifying';
}

export function startModelDownload(id: LocalModelId): void {
  if (isModelDownloadRunning(downloads.get(id))) return;
  downloads.set(id, { status: 'downloading', progress: 0 });
  emit();
  void installDesktopModel(id, (progress, phase) => {
    downloads.set(id, { status: phase === 'verifying' ? 'verifying' : 'downloading', progress });
    emit();
  })
    .then(async () => {
      downloads.set(id, { status: 'installed', progress: 1 });
      // The freshly installed model becomes the active local model, matching
      // the previous install flow; switching the chat backend stays a user
      // gesture. The chat is told afterwards so an engine already on Local
      // reloads with this model instead of waiting for a restart.
      await setActiveModelId(id).catch(() => {});
      emit();
      notifyLocalModelInstalled(id);
    })
    .catch((error: unknown) => {
      downloads.set(id, {
        status: 'error',
        progress: 0,
        error: error instanceof Error ? error.message : String(error),
      });
      emit();
    });
}

/** Acknowledge a finished (installed or error) download, e.g. from the toast. */
export function clearModelDownload(id: LocalModelId): void {
  const state = downloads.get(id);
  if (state && !isModelDownloadRunning(state)) {
    downloads.delete(id);
    emit();
  }
}
