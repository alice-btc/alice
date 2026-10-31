// Where the pointer is fine (a mouse or a trackpad), a keyboard is physical
// and focusing a field on arrival helps. On a touch screen the on-screen
// keyboard would cover the page before it has been read, so fields wait for
// a tap.
export function finePointer(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;
}
