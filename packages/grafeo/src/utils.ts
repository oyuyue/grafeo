export function isString(o: any): o is string {
  return typeof o === 'string';
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function isFunction(o: any): o is Function {
  return typeof o === 'function';
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop(): void {}

export function getElement(el: string | Element): Element | null {
  if (isString(el)) return document.querySelector(el);
  return el;
}

export function centerElement(): HTMLElement {
  const div = document.createElement('div');
  div.style.width = '100%';
  div.style.height = '100%';
  div.style.display = 'flex';
  div.style.alignItems = 'center';
  div.style.justifyContent = 'center';
  return div;
}

export const requestIdleCallback = (self as any).requestIdleCallback || function (cb: () => any) { return setTimeout(cb, 1); };

let errors: Error[] = [];

export function storeError(err: Error): void {
  errors.push(err);
}

export function throwErrors(): void | never {
  if (!errors.length) return;
  const tmp = errors;
  errors = [];
  throw tmp;
}
