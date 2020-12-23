import { noop, isFunction } from './utils'
import { UI, DefaultErrorUI, DefaultLoadingUI } from './ui'


export interface App {
  mount?: (el?: string | HTMLElement) => any;
  update?: () => any;
  destroy?: () => any;
}

export interface RegisterAppOptions {
  name: string;
  load: string | (() => App | Promise<App>);
  mount?: string | HTMLElement | ((app: App) => void);
  mountWhen?: string | ((loc: Location) => boolean);
  props?: any;
  loadingUI?: UI | false;
  errorUI?: UI | false;
}

export type ExportFn = (options: any, isRoot: boolean) => App | App['mount'] | undefined

export function exportApp(fn: ExportFn) {
  return function(options: any, isRoot: boolean): App | undefined {
    let res = fn(options, isRoot)
    if (isRoot) return;
    const ret = { mount: noop, update: noop, destroy: noop }
    if (isFunction(res)) res = { mount: res }
    return Object.assign(ret, res)
  }
}

const apps = {};

export function registerApp(opts: RegisterAppOptions): void {

}

export function unregisterApp(name: string): void {

}
