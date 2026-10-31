import { Platform } from 'react-native';
import type { AIBackend, AIBackendType } from './ai-backend';
import { CloudAIBackend } from './ai-backend-cloud';
import { CustomAIBackend } from './ai-backend-custom';
import { LocalAIBackend, isLocalAvailable } from './ai-backend-local';
import { LocalDesktopAIBackend } from './ai-backend-local-desktop';
import { LocalMobileAIBackend } from './ai-backend-local-mobile';
import { hasLocalEngine, isTauriDesktop, isTauriMobile } from './tauri-runtime';

export { hasKeychainCipher, hasLocalEngine, isTauriApp, isTauriDesktop, isTauriMobile, tauriShell } from './tauri-runtime';

export function createBackend(type: AIBackendType): AIBackend {
  if (type === 'local') {
    // The desktop talks to llama-server; Android and iOS to the engine
    // inside the app; the browser gets the backend that says so.
    if (isTauriDesktop()) return new LocalDesktopAIBackend();
    if (isTauriMobile()) return new LocalMobileAIBackend();
    return new LocalAIBackend();
  }
  if (type === 'custom') return new CustomAIBackend();
  return new CloudAIBackend();
}

export function canUseLocal(): boolean {
  return hasLocalEngine() || (Platform.OS !== 'web' && isLocalAvailable());
}
