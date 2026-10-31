import { Fragment } from 'react';
import type { Locale } from '@/i18n/config';
import { localizeHref } from '@/i18n/paths';
import { externalLinkProps } from '@/lib/links';

// Prose that carries a link or an emphasis, kept as data so a dictionary
// holds whole sentences in its own word order: a string, a link, a strong
// word. Internal links are localized when rendered, so a dictionary always
// writes the English route ('/trust/#status') and never a prefixed one.

export type RichSegment = string | { href: string; text: string } | { strong: string };

export type Rich = RichSegment[];

export function RichText({
  value,
  locale,
  linkClassName,
  strongClassName = 'text-[var(--alice-heading)]',
}: {
  value: Rich;
  locale: Locale;
  linkClassName: string;
  strongClassName?: string;
}) {
  return (
    <>
      {value.map((segment, index) => {
        if (typeof segment === 'string') return <Fragment key={index}>{segment}</Fragment>;
        if ('strong' in segment) {
          return (
            <strong key={index} className={strongClassName}>
              {segment.strong}
            </strong>
          );
        }
        const href = localizeHref(locale, segment.href);
        return (
          <a key={index} href={href} {...externalLinkProps(href)} className={linkClassName}>
            {segment.text}
          </a>
        );
      })}
    </>
  );
}

/** The plain text of a rich value, for JSON-LD and other attributes. */
export function richToText(value: Rich): string {
  return value
    .map((segment) => (typeof segment === 'string' ? segment : 'strong' in segment ? segment.strong : segment.text))
    .join('');
}
