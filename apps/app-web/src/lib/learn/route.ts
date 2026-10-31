// Learn lives on the single static route /learn (output: 'export' would need
// generateStaticParams for dynamic segments). Internal navigation is client
// state mirrored into the query string with history.pushState, following the
// repo idiom of reading window.location.search directly instead of
// useSearchParams (which would force a <Suspense> boundary).

export type LearnView =
  | { kind: 'home' }
  | { kind: 'course'; code: string }
  | { kind: 'chapter'; code: string; chapterId: string }
  | { kind: 'quiz'; code: string; partId: string }
  | { kind: 'tutorial'; category: string; slug: string }
  // The Dictionnaire de Bitcoin: one letter of the index, or one definition.
  | { kind: 'dictionary'; letter?: string }
  | { kind: 'definition'; slug: string };

export function parseLearnView(search: string): LearnView {
  const params = new URLSearchParams(search);
  const course = params.get('course');
  const chapter = params.get('chapter');
  const quiz = params.get('quiz');
  const tutorial = params.get('tutorial');
  const dictionary = params.get('dictionary');
  const definition = params.get('definition');
  if (definition !== null) {
    if (/^[a-z0-9-]+$/.test(definition)) return { kind: 'definition', slug: definition };
    return { kind: 'dictionary' };
  }
  if (dictionary !== null) {
    return /^[a-z]$/.test(dictionary) ? { kind: 'dictionary', letter: dictionary } : { kind: 'dictionary' };
  }
  if (tutorial) {
    const [category, ...rest] = tutorial.split('/');
    if (category && rest.length) return { kind: 'tutorial', category, slug: rest.join('/') };
  }
  if (course && quiz) return { kind: 'quiz', code: course, partId: quiz };
  if (course && chapter) return { kind: 'chapter', code: course, chapterId: chapter };
  if (course) return { kind: 'course', code: course };
  return { kind: 'home' };
}

export function learnViewToSearch(view: LearnView): string {
  const params = new URLSearchParams();
  switch (view.kind) {
    case 'home':
      break;
    case 'course':
      params.set('course', view.code);
      break;
    case 'chapter':
      params.set('course', view.code);
      params.set('chapter', view.chapterId);
      break;
    case 'quiz':
      params.set('course', view.code);
      params.set('quiz', view.partId);
      break;
    case 'tutorial':
      params.set('tutorial', `${view.category}/${view.slug}`);
      break;
    case 'dictionary':
      params.set('dictionary', view.letter ?? '');
      break;
    case 'definition':
      params.set('definition', view.slug);
      break;
  }
  const search = params.toString();
  return search ? `?${search}` : '';
}

/**
 * Fired by app chrome (the sidebar's Learn entry) to bring an already-mounted
 * Learn workspace back to its dashboard, since a same-route router.push does
 * not remount the panel.
 */
export const LEARN_RESET_EVENT = 'alice-learn-reset';
