// Page label for feedback reports. Reports must not carry the raw URL: query
// strings, hashes, credentials and path segments can hold identifiers (txids,
// addresses, session ids). Only a fixed label from a known route list is ever
// returned, never any part of the input.

const ROUTE_LABELS: Record<string, string> = {
  explorer: 'Explorer',
  learn: 'Learn',
  playground: 'Playground',
  settings: 'Settings',
};

export function getReportPageLabel(href: string | null | undefined): string {
  if (!href) return 'Unknown';
  let pathname: string;
  try {
    // Base lets bare paths parse; absolute URLs (http, https, tauri) ignore it.
    pathname = new URL(href, 'http://localhost').pathname;
  } catch {
    return 'Unknown';
  }
  const first = pathname.split('/').filter(Boolean)[0];
  if (first === undefined) return 'Home';
  const route = first.toLowerCase();
  return Object.hasOwn(ROUTE_LABELS, route) ? ROUTE_LABELS[route] : 'Other page';
}

// New reports go to the issues of the public source repository. The former
// alice-btc/alice-support-contribute tracker stays open for older clients.
export const FEEDBACK_REPO = 'alice-btc/alice';

/**
 * The prefilled "new issue" page for a report. Title and body are passed as
 * query parameters, encoded by URLSearchParams; nothing is submitted until
 * the user confirms on GitHub. The labels must exist on the repository to
 * be applied; the title and body do not depend on them.
 */
export function buildFeedbackIssueUrl({ title, body, category }: { title: string; body: string; category: string }): string {
  const url = new URL(`https://github.com/${FEEDBACK_REPO}/issues/new`);
  url.searchParams.set('title', title);
  url.searchParams.set('body', body);
  url.searchParams.set('labels', `${category},private-beta`);
  return url.toString();
}
