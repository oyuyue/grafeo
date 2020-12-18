export function typeStr(o: any): string {
  return Object.prototype.toString.call(o).slice(8, -1)
}

export function isObject(o: any): boolean {
  return typeStr(o) === 'Object'
}

export function isString(o: any): o is string {
  return typeof o === 'string'
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

export function getElement(el: string | HTMLElement): HTMLElement {
  if (isString(el)) return document.querySelector(el) as HTMLElement
  return el
}
