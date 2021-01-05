export function typeStr(o: any): string {
  return Object.prototype.toString.call(o).slice(8, -1)
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function isObject(o: any): o is Object {
  return typeStr(o) === 'Object'
}

export function isString(o: any): o is string {
  return typeof o === 'string'
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function isFunction(o: any): o is Function {
  return typeof o === 'function'
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function noop(): void {}

export function merge<T extends Record<string, any>>(
  dest: Record<string, any>, 
  source: Record<string, any>,
  paths?: string[],
  parentPath?: string
): T {
  dest = dest || {}
  let item
  Object.keys(source).forEach(k => {
    item = source[k]
    const p = parentPath ? parentPath + '.' + k : k
    if (isObject(item)) {
      dest[k] = merge(dest[k], item, paths, p)
    } else {
      if (paths) paths.push(p)
      dest[k] = source[k]
    }
  })
  return dest as T
}

export function getElement(el: string | Element): Element {
  if (isString(el)) return document.querySelector(el) as HTMLElement
  return el
}

export function centerElement(): HTMLElement {
  const div = document.createElement('div')
  div.style.width = '100%'
  div.style.height = '100%'
  div.style.display = 'flex'
  div.style.alignItems = 'center'
  div.style.justifyContent = 'center'
  return div
}

export const requestIdleCallback = (self as any).requestIdleCallback || function (cb: () => any) { return setTimeout(cb, 1); }

let errors: Error[] = [];
export function storeError(err: Error) {
  errors.push(err)
}

export function throwErrors() {
  if (!errors.length) return;
  const tmp = errors
  errors = []
  throw tmp
}
