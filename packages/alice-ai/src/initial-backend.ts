import type { AIBackendType } from './ai-backend';

export interface InitialBackendInput {
  /** The stored choice (alice_ai_backend), or null on a first launch. */
  stored: string | null;
  /** Whether this device can run the local model at all. */
  localAvailable: boolean;
  /** Which backends the user left enabled. */
  enabled: Record<AIBackendType, boolean>;
  privateCloudEnabled: boolean;
}

/**
 * The backend the chat opens on. A stored choice wins while that backend is
 * still enabled. Without one, every surface, Alice Desktop included, opens on
 * Private Cloud: no model ships with the app, so the local model is something
 * the user picks once it is downloaded, never a first-launch default. Null
 * when the user disabled every backend: none is selected rather than a
 * disabled one.
 */
export function chooseInitialBackend({ stored, localAvailable, enabled, privateCloudEnabled }: InitialBackendInput): AIBackendType | null {
  if (stored === 'local' && localAvailable && enabled.local) return 'local';
  if (stored === 'custom' && enabled.custom) return 'custom';
  if (stored === 'cloud' && privateCloudEnabled && enabled.cloud) return 'cloud';
  if (privateCloudEnabled && enabled.cloud) return 'cloud';
  if (localAvailable && enabled.local) return 'local';
  if (enabled.custom) return 'custom';
  return null;
}
