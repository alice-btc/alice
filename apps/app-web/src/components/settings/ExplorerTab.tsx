'use client';

import { useEffect, useState } from 'react';
import { SvgIcon } from '@/components/SvgIcon';
import { CHECK_ICON } from '@/lib/atelier-icons';
import { configurableNetworks, getNodeOverride, setNodeOverride } from '@/lib/explorer/node-config';
import { getNetwork } from '@/lib/explorer/networks';
import { getDefaultNetworkId, selectableNetworks, setDefaultNetworkId } from '@/lib/explorer/prefs';
import { loadWallets, removeWallet, type SavedWallet } from '@/lib/explorer/wallet-store';
import {
  ConfirmDialog,
  inputStyle,
  SectionHint,
  SectionLabel,
  sectionStyle,
} from './ui';
import { localVault } from '@/lib/local-vault';
import { useT } from '@/i18n';

function NetworkDot({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: color, display: 'inline-block' }}
    />
  );
}

export function ExplorerTab() {
  const t = useT();
  /* Node overrides live per network in localStorage. */
  const [nodeDrafts, setNodeDrafts] = useState<Record<string, string>>({});
  const [nodeNotice, setNodeNotice] = useState('');
  const [defaultNetwork, setDefaultNetwork] = useState<string>('');
  const [wallets, setWallets] = useState<SavedWallet[]>([]);
  const [confirmClearWallets, setConfirmClearWallets] = useState(false);

  useEffect(() => {
    localVault.whenReady(() => {
      setNodeDrafts(
        Object.fromEntries(configurableNetworks().map(n => [n.id, getNodeOverride(n.id)])),
      );
      setWallets(loadWallets());
    });
    setDefaultNetwork(getDefaultNetworkId());
  }, []);

  const handleSaveNode = (networkId: string) => {
    setNodeOverride(networkId, nodeDrafts[networkId] ?? '');
    // Reflect the trimmed/cleared value back into the input.
    setNodeDrafts(prev => ({ ...prev, [networkId]: getNodeOverride(networkId) }));
    setNodeNotice(t('settings.explorer.nodeSaved'));
    setTimeout(() => setNodeNotice(''), 4000);
  };

  const handleResetNode = (networkId: string) => {
    setNodeOverride(networkId, '');
    setNodeDrafts(prev => ({ ...prev, [networkId]: '' }));
    setNodeNotice(t('settings.explorer.nodeReset'));
    setTimeout(() => setNodeNotice(''), 4000);
  };

  const handleClearWallets = () => {
    let remaining = wallets;
    for (const wallet of wallets) remaining = removeWallet(wallet.id);
    setWallets(remaining);
    setConfirmClearWallets(false);
  };

  const walletCount = wallets.filter(w => w.kind === 'wallet').length;
  const addressCount = wallets.length - walletCount;

  return (
    <>
      <div style={sectionStyle}>
        <SectionLabel>{t('settings.explorer.startingNetwork')}</SectionLabel>
        <SectionHint>{t('settings.explorer.startingNetworkHint')}</SectionHint>
        <div className="flex gap-2 flex-wrap" role="group" aria-label={t('settings.explorer.startingNetworkAria')}>
          {selectableNetworks().map((net) => {
            const active = net.id === defaultNetwork;
            return (
              <button
                key={net.id}
                type="button"
                aria-pressed={active}
                onClick={() => { setDefaultNetworkId(net.id); setDefaultNetwork(getDefaultNetworkId()); }}
                className="alice-control alice-control--choice font-numbers flex items-center gap-2"
              >
                <NetworkDot color={net.color} />
                {net.label}
                {active && <SvgIcon svg={CHECK_ICON} size={16} color="currentColor" />}
              </button>
            );
          })}
        </div>
      </div>

      <div style={sectionStyle}>
        <SectionLabel>{t('settings.explorer.dataNode')}</SectionLabel>
        <SectionHint>{t('settings.explorer.dataNodeHint')}</SectionHint>
        <div className="flex flex-col gap-4">
          {configurableNetworks().map((net) => {
            const draft = nodeDrafts[net.id] ?? '';
            const defaultUrl = getNetwork(net.id).baseUrl ?? '';
            const dirty = draft.trim().replace(/\/$/, '') !== getNodeOverride(net.id);
            return (
              <div key={net.id} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <NetworkDot color={net.color} />
                  <label htmlFor={`node-${net.id}`} className="alice-field-label">
                    {t('settings.explorer.endpoint', { network: net.label })}
                  </label>
                  {getNodeOverride(net.id) && (
                    <span className="font-numbers" style={{ fontSize: 13, opacity: 1 }}>
                      {t('settings.explorer.custom')}
                    </span>
                  )}
                </div>
                <input
                  id={`node-${net.id}`}
                  aria-label={t('settings.explorer.endpoint', { network: net.label })}
                  type="url"
                  value={draft}
                  onChange={(e) => setNodeDrafts(prev => ({ ...prev, [net.id]: e.target.value }))}
                  placeholder={defaultUrl}
                  className="alice-field font-numbers outline-none w-full"
                  style={inputStyle}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveNode(net.id)}
                    className="alice-control alice-control--primary font-numbers"
                    disabled={!dirty}
                  >
                    {t('settings.explorer.save')}
                  </button>
                  {getNodeOverride(net.id) && (
                    <button
                      onClick={() => handleResetNode(net.id)}
                      className="alice-control alice-control--quiet font-numbers"
                    >
                      {t('settings.explorer.default')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {nodeNotice && (
          <p className="font-numbers m-0 mt-3" style={{ fontSize: 13, opacity: 1 }}>
            {nodeNotice}
          </p>
        )}
      </div>

      <div style={sectionStyle}>
        <SectionLabel>{t('settings.explorer.watched')}</SectionLabel>
        <SectionHint>{t('settings.explorer.watchedHint')}</SectionHint>
        <div className="flex items-center justify-between gap-3">
          <span className="font-numbers" style={{ fontSize: 13 }}>
            {t.plural('settings.explorer.walletCount', walletCount)} / {t.plural('settings.explorer.addressCount', addressCount)}
          </span>
          <button
            onClick={() => setConfirmClearWallets(true)}
            className="alice-control alice-control--danger font-numbers"
            disabled={wallets.length === 0}
          >
            {t('settings.explorer.forgetAll')}
          </button>
        </div>
      </div>

      {confirmClearWallets && (
        <ConfirmDialog
          title={t('settings.explorer.forgetTitle')}
          body={t.plural('settings.explorer.forgetBody', wallets.length)}
          confirmLabel={t('settings.explorer.forget')}
          onCancel={() => setConfirmClearWallets(false)}
          onConfirm={handleClearWallets}
        />
      )}
    </>
  );
}
