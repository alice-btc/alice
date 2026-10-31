// route(): the deterministic gate that decides where a question may run. It
// implements CONTRAT 3 of CONTRATS_AUDIT_ALICE.md.
//
// The rule that keeps this verifiable: we classify the ATTACHMENTS, never the
// question. Classifying natural language would need a model, so a raw identifier
// in the free text is detected by pattern, not by understanding, and forces the
// strictest class. Fail-closed: over-detection routes to local (safe), never the
// reverse.
//
// Pure and dependency-free. Seed/private-key detection is injected so this lib
// never imports the AI package; the app wires alice-ai's detectSensitiveInput.

import type { AbstractSignal } from './audit-core.ts';
import { t, type MessageKey } from '../../i18n/translate.ts';

export type BackendClass = 'A' | 'B' | 'C' | 'D';
export type AllowedBackend = 'local' | 'cloud_attested';

// 'address' covers on-chain, Ark (ark1…) and Spark (spark1…) addresses alike;
// 'spark-id' is the UUID that names a Spark transfer or leaf.
export type RawSubjectKind = 'address' | 'txid' | 'outpoint' | 'xpub' | 'vtxo' | 'spark-id';
export interface RawSubject {
  kind: RawSubjectKind;
  value: string;
  /** Where it came from, so the UI knows whether it can be removed automatically. */
  source: 'attachment' | 'text';
}

// The typed chips the user attached. A raw subject also lands here when pasted as
// a chip; identifiers typed into the prose are found by the text scan instead.
export type RouteAttachment =
  | { id: string; kind: 'fiche'; ficheId: string }
  | { id: string; kind: 'signal'; signal: AbstractSignal }
  | { id: string; kind: 'raw'; subject: { kind: RawSubjectKind; value: string } };

export interface UserPrefs {
  /** The user has explicitly consented to sending de-identified data to the cloud. */
  cloudConsent?: boolean;
  /** The user has explicitly enabled identified mode for THIS conversation:
      raw on-chain identifiers (typically about third parties under audit) may
      then reach the attested cloud, on top of cloudConsent. Never a default. */
  identifiedConsent?: boolean;
  /** Declared intent, so a pure setup description can be class C rather than A. */
  intent?: 'question' | 'setup';
}

export interface RouteInput {
  attachments: RouteAttachment[];
  questionText: string;
  prefs: UserPrefs;
}

export interface RouteDecision {
  class: BackendClass;
  /** Backends permitted right now, given prefs. */
  allowedBackends: AllowedBackend[];
  /** Could the attested cloud ever handle this input (now or after consent)? */
  cloudEligible: boolean;
  /** True only for class B not yet consented: the UI should offer the choice. */
  cloudConsentRequired: boolean;
  payload: { signals: AbstractSignal[]; fiches: string[]; rawSubjects: RawSubject[] };
  /** Plain, user-facing explanation of the decision. */
  reason: string;
  /** How removing identifying chips would relax the class (attachment-borne only). */
  downgradePath?: { removeAttachmentIds: string[]; resultingClass: 'A' | 'B' | 'C' };
  /** Seed or private key detected: the message is blocked, never sent anywhere. */
  blocked?: boolean;
}

export interface RouteDeps {
  /** Returns true when the text carries a recovery phrase or private key. */
  detectForbidden?: (text: string) => boolean;
}

// Global scanners, mirroring search.ts but matching inside free text. They lean
// toward over-detection on purpose: a false positive routes to local, which is
// the safe direction.
const OUTPOINT_RE = /\b[0-9a-f]{64}:\d{1,6}\b/gi;
const HEX64_RE = /\b[0-9a-f]{64}\b/gi;
const XPUB_RE = /\b(?:xpub|ypub|zpub|tpub|upub|vpub)[1-9A-HJ-NP-Za-km-z]{90,140}\b/gi;
const BECH32_RE = /\b(?:bc1|tb1|bcrt1)[0-9ac-hj-np-z]{20,87}\b/gi;
const BASE58_RE = /\b[13mn2][a-km-zA-HJ-NP-Z1-9]{24,33}\b/g;
// Off-chain identifiers: Ark and Spark addresses (the older sp1… spelling
// included, which also covers silent-payment addresses), and the UUIDs that
// name Spark transfers and leaves. Any UUID counts: over-detection is safe.
const LAYER_ADDR_RE = /\b(?:ark|tark|spark|sparkt|sparkrt|sparks|sparkl|sp|spt|sprt|sps|spl)1[0-9ac-hj-np-z]{20,}\b/gi;
const UUID_RE = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;

/**
 * Find raw on-chain identifiers pasted into free text. A 64-hex value with a long
 * run of leading zeros is a block hash (public, not identifying) and is ignored;
 * otherwise it is treated as a txid. Block heights (pure digits) are public too
 * and never matched here.
 */
export function findRawIdentifiersInText(text: string): RawSubject[] {
  const found: RawSubject[] = [];
  const seen = new Set<string>();
  const add = (kind: RawSubjectKind, value: string) => {
    const key = `${kind}:${value.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    found.push({ kind, value, source: 'text' });
  };

  const outpointTxids = new Set<string>();
  for (const m of text.matchAll(OUTPOINT_RE)) {
    add('outpoint', m[0]);
    outpointTxids.add(m[0].slice(0, 64).toLowerCase());
  }
  for (const m of text.matchAll(HEX64_RE)) {
    const hex = m[0].toLowerCase();
    if (outpointTxids.has(hex)) continue; // already reported as an outpoint
    const leadingZeros = hex.match(/^0+/)?.[0].length ?? 0;
    if (leadingZeros >= 8) continue; // block hash: public, not identifying
    add('txid', hex);
  }
  for (const m of text.matchAll(XPUB_RE)) add('xpub', m[0]);
  for (const m of text.matchAll(BECH32_RE)) add('address', m[0]);
  for (const m of text.matchAll(BASE58_RE)) add('address', m[0]);
  for (const m of text.matchAll(LAYER_ADDR_RE)) add('address', m[0]);
  for (const m of text.matchAll(UUID_RE)) add('spark-id', m[0].toLowerCase());

  return found;
}

// Shown to the user under the composer, so in the interface language.
const BLOCKED_REASON: MessageKey = 'explorer.route.blocked';
const REASON: Record<BackendClass, MessageKey> = {
  A: 'explorer.route.classA',
  C: 'explorer.route.classC',
  B: 'explorer.route.classB',
  D: 'explorer.route.classD',
};
const REASON_D_IDENTIFIED: MessageKey = 'explorer.route.classDIdentified';

function nonIdentifyingClass(input: RouteInput, hasSignals: boolean, hasFiches: boolean): 'A' | 'B' | 'C' {
  if (hasSignals) return 'B';
  if (!hasFiches && input.prefs.intent === 'setup' && input.questionText.trim().length > 0) return 'C';
  return 'A';
}

export function route(input: RouteInput, deps: RouteDeps = {}): RouteDecision {
  const signals = input.attachments.flatMap(a => (a.kind === 'signal' ? [a.signal] : []));
  const fiches = input.attachments.flatMap(a => (a.kind === 'fiche' ? [a.ficheId] : []));
  const rawFromAttachments: RawSubject[] = input.attachments.flatMap(a =>
    a.kind === 'raw' ? [{ kind: a.subject.kind, value: a.subject.value, source: 'attachment' as const }] : [],
  );
  const rawFromText = findRawIdentifiersInText(input.questionText);
  const rawSubjects = [...rawFromAttachments, ...rawFromText];
  const payload = { signals, fiches, rawSubjects };

  // Forbidden first: a seed or key blocks the whole message, ahead of any class.
  if (deps.detectForbidden?.(input.questionText)) {
    return {
      class: 'D',
      allowedBackends: [],
      cloudEligible: false,
      cloudConsentRequired: false,
      payload,
      reason: t(BLOCKED_REASON),
      blocked: true,
    };
  }

  // Any raw identifier forces class D: local only, unless the user explicitly
  // enabled identified mode for this conversation, which makes the attested
  // cloud eligible under the SAME cloud-consent gate as class B. Both consents
  // are explicit inputs: the default remains local only, cloud never offered.
  if (rawSubjects.length > 0) {
    const identified = input.prefs.identifiedConsent === true;
    const consented = input.prefs.cloudConsent === true;
    const decision: RouteDecision = {
      class: 'D',
      allowedBackends: identified && consented ? ['local', 'cloud_attested'] : ['local'],
      cloudEligible: identified,
      cloudConsentRequired: identified && !consented,
      payload,
      reason: t(identified ? REASON_D_IDENTIFIED : REASON.D),
    };
    // A downgrade is only automatic when every identifier is a chip: text-borne
    // identifiers cannot be removed for the user, so no path is offered then.
    const rawAttachmentIds = input.attachments.flatMap(a => (a.kind === 'raw' ? [a.id] : []));
    if (rawFromText.length === 0 && rawAttachmentIds.length > 0) {
      decision.downgradePath = {
        removeAttachmentIds: rawAttachmentIds,
        resultingClass: nonIdentifyingClass(input, signals.length > 0, fiches.length > 0),
      };
    }
    return decision;
  }

  // De-identified analysis only: local by default, cloud on explicit consent.
  if (signals.length > 0) {
    const consented = input.prefs.cloudConsent === true;
    return {
      class: 'B',
      allowedBackends: consented ? ['local', 'cloud_attested'] : ['local'],
      cloudEligible: true,
      cloudConsentRequired: !consented,
      payload,
      reason: t(REASON.B),
    };
  }

  // No on-chain data: pedagogy (A) or a declared setup description (C).
  const cls = nonIdentifyingClass(input, false, fiches.length > 0);
  return {
    class: cls,
    allowedBackends: ['local', 'cloud_attested'],
    cloudEligible: true,
    cloudConsentRequired: false,
    payload,
    reason: t(REASON[cls]),
  };
}
