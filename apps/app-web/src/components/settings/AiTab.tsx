'use client';

import { useEffect, useState } from 'react';
import {
  DEFAULT_LOCAL_MODEL_ID,
  type CustomServerConfig,
  CLOUD_MODELS,
  setPreset,
  getAliceInstructions,
  setAliceInstructions,
  setResponseLanguagePreference,
  setActiveModelId,
  setActiveCloudModelId,
  getCustomServer,
  setCustomServer,
  probeCustomServer,
  isTauriDesktop,
  useChat,
} from '@alice-wallet/alice-ai';
import { SvgIcon } from '@/components/SvgIcon';
import { CHEVRON_RIGHT_ICON } from '@/lib/atelier-icons';
import { LocalModelsSection } from './LocalModelsSection';
import { SemanticSearchSection } from './SemanticSearchSection';
import { AliceMemoryPanel } from './AliceMemoryPanel';
import { useT } from '@/i18n';
import {
  ConfirmDialog,
  inputStyle,
  PixelSwitch,
  SectionHint,
  SectionLabel,
  sectionStyle,
} from './ui';

export function AiTab() {
  // The AI tab hosts a sub-screen: the memory panel replaces the tab body in
  // place, staying inside the settings frame instead of navigating away.
  const t = useT();
  const [screen, setScreen] = useState<'main' | 'memory'>('main');
  const chat = useChat();
  const desktopLocalFirst = isTauriDesktop();

  const [instructions, setInstructions] = useState('');
  const [savedInstructions, setSavedInstructions] = useState('');

  const [customUrl, setCustomUrl] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [customApiKey, setCustomApiKey] = useState('');
  // "Connected" is said only once the server answered: a saved address is
  // not a reachable server, and the chat would otherwise say "Cannot reach"
  // under a Settings page saying the opposite.
  const [customConnected, setCustomConnected] = useState(false);
  const [customReach, setCustomReach] = useState<'unknown' | 'checking' | 'ok' | 'unreachable'>('unknown');

  const [confirmReset, setConfirmReset] = useState(false);

  const checkCustomServer = async (config: CustomServerConfig) => {
    setCustomReach('checking');
    const answered = await probeCustomServer(config);
    setCustomReach(answered ? 'ok' : 'unreachable');
  };

  useEffect(() => {
    (async () => {
      try {
        const [ci, cs] = await Promise.all([getAliceInstructions(), getCustomServer()]);
        setInstructions(ci);
        setSavedInstructions(ci);
        if (cs) {
          setCustomUrl(cs.url);
          setCustomModel(cs.model);
          setCustomApiKey(cs.apiKey ?? '');
          if (chat.backendType === 'custom') {
            setCustomConnected(true);
            void checkCustomServer(cs);
          }
        }
      } catch {
        /* ignore */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveInstructions = async () => {
    await setAliceInstructions(instructions);
    setSavedInstructions(instructions);
    chat.clearMessages();
  };

  const handleClearInstructions = async () => {
    setInstructions('');
    await setAliceInstructions('');
    setSavedInstructions('');
  };

  const handleCustomConnect = async () => {
    const config: CustomServerConfig = {
      url: customUrl.trim(),
      model: customModel.trim(),
      apiKey: customApiKey.trim() || undefined,
    };
    await setCustomServer(config);
    chat.setBackendType('custom');
    setCustomConnected(true);
    await checkCustomServer(config);
  };

  const handleCustomDisconnect = async () => {
    await setCustomServer(null);
    setCustomConnected(false);
    setCustomReach('unknown');
    chat.setBackendType(desktopLocalFirst ? 'local' : 'cloud');
  };

  const handleResetDefaults = async () => {
    await Promise.all([
      setPreset('local', 'balanced'),
      setPreset('cloud', 'balanced'),
      setAliceInstructions(''),
      setResponseLanguagePreference('app'),
      setActiveCloudModelId('alice-cloud'),
      setActiveModelId(DEFAULT_LOCAL_MODEL_ID),
      setCustomServer(null),
    ]);
    setInstructions('');
    setSavedInstructions('');
    setCustomUrl('');
    setCustomModel('');
    setCustomApiKey('');
    setCustomConnected(false);
    setCustomReach('unknown');
    chat.setAiEnabled(true);
    chat.setBackendEnabled('local', true);
    chat.setBackendEnabled('cloud', true);
    chat.setBackendEnabled('custom', true);
    chat.setBackendType(desktopLocalFirst ? 'local' : 'cloud');
    chat.clearMessages();
    setConfirmReset(false);
  };

  const instructionsChanged = instructions !== savedInstructions;
  const customReady = !!customUrl.trim() && !!customModel.trim();

  if (screen === 'memory') {
    return <AliceMemoryPanel onBack={() => setScreen('main')} />;
  }

  return (
    <>
      <div style={sectionStyle}>
        <div className="flex items-center justify-between gap-4">
          <SectionLabel>{t('settings.ai.localAi')}</SectionLabel>
          <PixelSwitch
            label={t('settings.ai.localAiSwitch')}
            enabled={chat.localAvailable && chat.backendEnabled.local}
            onChange={enabled => chat.setBackendEnabled('local', enabled)}
            disabled={!chat.localAvailable}
          />
        </div>
        {!chat.localAvailable && (
          <p className="font-numbers m-0 mt-2" style={{ fontSize: 13, color: 'var(--alice-muted)' }}>
            {/* A switch that can never be turned on is a question with no
                answer. Say where the answer lives instead. */}
            {t('settings.ai.localAiUnavailable')}{' '}
            <a
              href="https://alicebtc.com/"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--alice-primary)', textDecoration: 'underline' }}
            >
              {t('settings.ai.getTheApp')}
            </a>
            .
          </p>
        )}
        <div style={{ height: 12 }} />
        <div className="flex items-center justify-between gap-4">
          <SectionLabel>{t('settings.ai.privateCloud')}</SectionLabel>
          <PixelSwitch
            label={t('settings.ai.privateCloudSwitch')}
            enabled={chat.backendEnabled.cloud}
            onChange={enabled => chat.setBackendEnabled('cloud', enabled)}
          />
        </div>
      </div>

      <div style={sectionStyle}>
        <SectionLabel>{t('settings.ai.personalization')}</SectionLabel>
        {/* The page has existed all along; no screen led to it, which is why
            the memory read as a wallet-only feature. Same entry and words as
            the mobile app, so the two describe one feature. */}
        <button
          type="button"
          onClick={() => setScreen('memory')}
          className="alice-control alice-control--quiet font-numbers mt-2 flex w-full items-center justify-between gap-4 cursor-pointer text-left"
        >
          <span className="flex flex-col gap-1">
            <span className="font-numbers" style={{ fontSize: 13, color: 'var(--alice-primary)' }}>{t('settings.ai.memoryEntry')}</span>
            <span className="font-numbers" style={{ fontSize: 13, color: 'var(--alice-muted)' }}>
              {t('settings.ai.memoryEntryHint')}
            </span>
          </span>
          <SvgIcon svg={CHEVRON_RIGHT_ICON} size={16} color="currentColor" />
        </button>
      </div>

      <div style={sectionStyle}>
        <SectionLabel>{t('settings.ai.instructions')}</SectionLabel>
        <label className="alice-field-label mt-3" htmlFor="alice-instructions">{t('settings.ai.instructionsLabel')}</label>
        <textarea
          id="alice-instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={4}
          className="alice-field w-full font-numbers resize-vertical outline-none mt-2"
          style={{ ...inputStyle, padding: 12 }}
          placeholder={t('settings.ai.instructionsPlaceholder')}
        />
        <p className="font-numbers text-sm mt-2" role="status" style={{ color: 'var(--alice-muted)' }}>{instructionsChanged ? t('settings.ai.instructionsUnsaved') : t('settings.ai.instructionsSaved')}</p>
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleSaveInstructions}
            className="alice-control alice-control--primary font-numbers"
            disabled={!instructionsChanged}
          >
            {t('settings.ai.saveInstructions')}
          </button>
          {instructions.length > 0 && (
            <button
              onClick={handleClearInstructions}
              className="alice-control alice-control--danger font-numbers"
            >
              {t('settings.ai.clear')}
            </button>
          )}
        </div>
      </div>

      <LocalModelsSection />

      <SemanticSearchSection />

      <div style={sectionStyle}>
        <SectionLabel>{t('settings.ai.privateCloud')}</SectionLabel>
        <p className="font-numbers m-0 mt-1" style={{ fontSize: 14, opacity: 1 }}>
          {t('settings.ai.privateCloudBody')}
        </p>

        <details className="mt-3">
          <summary
            className="font-numbers  cursor-pointer"
            style={{ fontSize: 13, opacity: 1, listStyle: 'revert' }}
          >
            {t('settings.ai.technicalDetails')}
          </summary>
          {/* Read-only on purpose: Private Cloud has one provider model, while
              Light, Normal, and High adjust its reasoning budget. */}
          <div
            className="font-numbers mt-2"
            style={{
              fontSize: 14,
              opacity: 1,
              padding: '10px 12px',
              borderLeft: '2px solid var(--alice-border)',
            }}
          >
            <div>{t('settings.ai.standardAnswers', { model: CLOUD_MODELS[0].veniceId })}</div>
            <div className="mt-1">{t('settings.ai.provider')}</div>
            <p className="m-0 mt-2" style={{ opacity: 1 }}>
              {t('settings.ai.modelsMayChange')}
            </p>
          </div>
        </details>
      </div>

      <div style={sectionStyle}>
        <div className="flex items-start justify-between gap-4">
          <SectionLabel>{t('settings.ai.customServer')}</SectionLabel>
          <PixelSwitch
            label={t('settings.ai.customServerSwitch')}
            enabled={chat.backendEnabled.custom}
            onChange={enabled => chat.setBackendEnabled('custom', enabled)}
          />
        </div>
        <SectionHint>{t('settings.ai.customServerHint')}</SectionHint>
        <div className="flex flex-col gap-2">
          <label className="alice-field-label" htmlFor="alice-customUrl">{t('settings.ai.serverUrl')}</label>
          <input
            type="url"
            id="alice-customUrl"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder={t('settings.ai.serverUrlPlaceholder')}
            className="alice-field font-numbers outline-none w-full"
            style={inputStyle}
          />
          <label className="alice-field-label" htmlFor="alice-customModel">{t('settings.ai.modelName')}</label>
          <input
            type="text"
            id="alice-customModel"
            value={customModel}
            onChange={(e) => setCustomModel(e.target.value)}
            placeholder={t('settings.ai.modelNamePlaceholder')}
            className="alice-field font-numbers outline-none w-full"
            style={inputStyle}
          />
          <label className="alice-field-label" htmlFor="alice-customApiKey">{t('settings.ai.apiKey')}</label>
          <input
            type="password"
            id="alice-customApiKey"
            value={customApiKey}
            onChange={(e) => setCustomApiKey(e.target.value)}
            placeholder={t('settings.ai.apiKey')}
            className="alice-field font-numbers outline-none w-full"
            style={inputStyle}
          />
        </div>
        <p className="font-numbers text-sm mt-3" role="status">
          {!customConnected ? t('settings.ai.customNotConnected')
            : customReach === 'unreachable' ? t('settings.ai.customUnreachable')
              : customReach === 'ok' ? t('settings.ai.customConnected')
                : t('settings.ai.customChecking')}
        </p>
        <div className="flex gap-2 mt-3">
          {!customConnected ? (
            <button
              onClick={handleCustomConnect}
              className="alice-control alice-control--primary font-numbers"
              disabled={!customReady}
            >
              {t('settings.ai.saveAndConnect')}
            </button>
          ) : (
            <button
              onClick={handleCustomDisconnect}
              className="alice-control alice-control--danger font-numbers"
            >
              {t('settings.ai.disconnect')}
            </button>
          )}
        </div>
      </div>

      <button
        onClick={() => setConfirmReset(true)}
        className="alice-control alice-control--danger font-numbers w-full mb-4"
      >
        {t('settings.ai.resetToDefault')}
      </button>

      {confirmReset && (
        <ConfirmDialog
          title={t('settings.ai.resetToDefault')}
          body={t('settings.ai.resetBody')}
          confirmLabel={t('settings.ai.reset')}
          onCancel={() => setConfirmReset(false)}
          onConfirm={() => void handleResetDefaults()}
        />
      )}
    </>
  );
}
