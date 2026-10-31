#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const REVIEW_BY = '2026-11-28';
// Reviewed 2026-10-31. No high advisory remains: node-forge moved to 1.4.2,
// its patched release, inside the declared ranges, and npm no longer reports
// braces 3.0.3. The sets below stay empty until a review accepts a new
// exception. See docs/security/dependency-audit.md.
const KNOWN_HIGH_PACKAGES = new Set([]);
const KNOWN_HIGH_ADVISORIES = new Set([]);
// Scope the exceptions to the exact reviewed package locations and versions.
const REVIEWED_HIGH_NODES = new Map([]);
const lock = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'));

const audit = spawnSync('npm', ['audit', '--json'], { encoding: 'utf8' });
let report;
try {
  report = JSON.parse(audit.stdout);
} catch {
  console.error('npm audit did not return valid JSON. Check registry access.');
  process.exit(1);
}

if (report.error || !report.metadata?.vulnerabilities) {
  const message = report.error?.summary ?? report.error?.message ?? audit.stderr.trim();
  console.error(`npm audit failed: ${message || `exit code ${audit.status}`}`);
  process.exit(1);
}

const unexpectedPackages = [];
const unexpectedAdvisories = [];
const critical = [];
const unexpectedNodes = [];
for (const [name, finding] of Object.entries(report.vulnerabilities ?? {})) {
  if (finding.severity === 'critical') critical.push(name);
  if (finding.severity === 'high' && !KNOWN_HIGH_PACKAGES.has(name)) {
    unexpectedPackages.push(name);
  }
  for (const via of finding.via ?? []) {
    if (typeof via !== 'object' || via.severity !== 'high') continue;
    for (const node of finding.nodes ?? []) {
      if (REVIEWED_HIGH_NODES.get(node) !== lock.packages?.[node]?.version
          || !REVIEWED_HIGH_NODES.has(node)) unexpectedNodes.push(node);
    }
    if (!KNOWN_HIGH_ADVISORIES.has(via.source)) {
      unexpectedAdvisories.push(`${name}: ${via.url ?? via.source}`);
    }
  }
}

const today = new Date().toISOString().slice(0, 10);
console.log(`npm audit: ${report.metadata?.vulnerabilities?.high ?? 0} high, ${report.metadata?.vulnerabilities?.critical ?? 0} critical`);
if (critical.length || unexpectedPackages.length || unexpectedAdvisories.length || unexpectedNodes.length || today > REVIEW_BY) {
  if (critical.length) console.error(`Critical vulnerabilities: ${critical.join(', ')}`);
  if (unexpectedPackages.length) console.error(`New high-risk packages: ${unexpectedPackages.join(', ')}`);
  if (unexpectedAdvisories.length) console.error(`New high-risk advisories: ${unexpectedAdvisories.join(', ')}`);
  if (unexpectedNodes.length) console.error(`Unreviewed high-risk locations or versions: ${[...new Set(unexpectedNodes)].join(', ')}`);
  if (today > REVIEW_BY) console.error(`The accepted audit baseline expired on ${REVIEW_BY}.`);
  process.exit(1);
}
