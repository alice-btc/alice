import type { ReactNode } from 'react';
import { BookIcon, CompassIcon, ShieldIcon, ShieldCheckIcon } from '@/components/icons';
import type { HomeCopy } from '@/i18n/dictionaries/home';

// Alice's mission, led by the slogan. Four mission tiles, then a compact
// "who it's for" strip that absorbs the old audience cards.

// The tiles' words are in the home dictionary, in the order of these icons.
const ICONS: ReactNode[] = [
  <BookIcon key="educate" size={24} />,
  <CompassIcon key="guide" size={24} />,
  <ShieldIcon key="harden" size={24} />,
  <ShieldCheckIcon key="verify" size={24} />,
];

export function Missions({ copy }: { copy: HomeCopy['missions'] }) {
  const MISSIONS = copy.tiles.map((tile, i) => ({ ...tile, icon: ICONS[i] }));
  return (
    <section id="missions" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16">
      {/* Slogan manifesto */}
      <div className="max-w-3xl">
        <p className="font-pixel text-[12px] uppercase tracking-widest text-[var(--alice-primary)]">
          {copy.eyebrow}
        </p>
        <h2 className="mt-4 text-4xl font-semibold leading-[1.08] sm:text-5xl">
          {copy.titleLines[0]}
          <br />
          {copy.titleLines[1]}
        </h2>
        <p className="mt-5 text-lg leading-relaxed text-[var(--alice-heading)]">
          {copy.lead}
        </p>
        <p className="mt-3 text-lg leading-relaxed text-[var(--alice-muted)]">
          {copy.body}
        </p>
      </div>

      {/* Mission tiles */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MISSIONS.map((m) => (
          <div
            key={m.title}
            className="rounded-[4px] border border-[var(--alice-border)] bg-[var(--alice-card-bg)] p-6"
          >
            <span className="text-[var(--alice-primary)]">{m.icon}</span>
            <h3 className="mt-4 text-lg font-semibold">{m.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--alice-text)]">{m.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
