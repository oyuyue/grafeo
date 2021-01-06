import AppInfo from './AppInfo';
import { App, AppEntry } from './types';
import { noop, isFunction, requestIdleCallback } from '../utils';

const appMap: Record<string, AppInfo> = Object.create(null);

export interface RegisterAppOptions<P = any, L = any, E = any> {
  name: string;
  load?: string | (() => Promise<AppEntry>);
  props?: P;
  mountWhen?: string | ((loc: Location, path: string) => boolean);
  prefetch?: boolean;
  loading?: boolean | ((el: string | Element, opts?: L, app?: AppInfo) => () => void);
  error?: boolean | ((el: string | Element, opts?: E, app?: AppInfo) => () => void);
  loadingProps?: L;
  errorProps?: E;
}

export function exportApp<T = any>(
  fn: (options: T, isRoot: boolean) => Partial<App> | App['mount'] | [App['mount'], App['destroy']] | void
) {
  return function(options: T, isRoot: boolean): App | void {
    let res = fn(options, isRoot);
    if (isRoot) return;
    const ret = { mount: noop, update: noop, destroy: noop };
    if (isFunction(res)) {
      res = { mount: res };
    } else if (Array.isArray(res)) {
      res = { mount: res[0], destroy: res[1] };
    }
    return Object.assign(ret, res);
  };
}

export function getApps(): AppInfo[] {
  return Object.keys(appMap).map(x => appMap[x]);
}

export function getApp(name: string): AppInfo {
  return appMap[name];
}

export function getAppChanges(path: string): {mounts: AppInfo[], destroys:  AppInfo[]} {
  const ret: ReturnType<typeof getAppChanges> = { mounts: [], destroys:  [] };
  getApps().forEach(app => {
    if (app.isRouteMatch) {
      const matched = app.isRouteMatch(location, path);
      if (app.isMounted() && !matched) {
        ret.destroys.push(app);
      } else if (!app.isMounted() && matched) {
        ret.mounts.push(app);
      }
    }
  });
  return ret;
}

export function registerApp(opts: RegisterAppOptions): void {
  const app = getApp(opts.name);
  if (app) app.destroy();
  appMap[opts.name] = new AppInfo(opts);
  if (opts.prefetch) {
    const app = appMap[opts.name];
    requestIdleCallback(app.load.bind(app));
  }
}

export function unregisterApp(name: string): void {
  destroyApp(name);
  delete appMap[name];
}

export async function mountApp(name: string, el?: string | Element): Promise<void> {
  const app = getApp(name);
  if (app) return app.mount(el);
}

export function updateApp(name: string, opts: any): void {
  const app = getApp(name);
  if (app) app.update(opts);
}

export function destroyApp(name: string): void {
  const app = getApp(name);
  if (app) return app.destroy();
}
