import { RegisterAppOptions } from '.';
import { noop, isFunction, isString } from '../utils';
import { App, AppEntry } from './types';
import loading from './loading'
import error from './error'

export default class AppInfo {
  private loaded = false;
  private mounting = false;
  private mounted = false;
  private load_: () => Promise<AppEntry> = noop as any;
  private appEntry!: AppEntry;
  private app!: Required<App>;
  
  private opts: RegisterAppOptions;
  private uiLoading: ((el: string | Element, opts: any) => () => void) | undefined;
  private uiError: ((el: string | Element, opts: any, info: AppInfo) => () => void) | undefined;
  private destroyUIError: (()  => void) | undefined;
  
  isRouteMatch?: (loc: Location, path: string) => boolean;
  
  constructor(opts: RegisterAppOptions) { 
    this.opts = opts;

    if (isFunction(opts.load)) {
      this.load_ = opts.load
    } else {
      this.load_ = () => System.import(opts.load || opts.name)
    }

    if (isString(opts.mountWhen)) {
      this.isRouteMatch = urlToValidator(opts.mountWhen);
    } else if (isFunction(opts.mountWhen)) {
      this.isRouteMatch = opts.mountWhen;
    }

    if (isFunction(opts.loading)) {
      this.uiLoading = opts.loading;
    } else if (opts.loading !== false) {
      this.uiLoading = loading
    }

    if (isFunction(opts.error)) {
      this.uiError = opts.error;
    } else if (opts.error !== false) {
      this.uiError = error
    }
  }

  async load(): Promise<void> {
    if (this.loaded && this.appEntry) return;
    const entry = await this.load_();
    this.loaded = true;
    this.appEntry = entry;
  }

  async createApp(opts?: any): Promise<void> {
    await this.load()
    if (this.appEntry) {
      this.app = this.appEntry(opts || this.opts.props)
    }
  }

  async update(opts?: any): Promise<void> {
    if (this.app) {
      this.app.update(opts);
    } else {
      await this.createApp(opts)
    }
  }

  async mount(el?: string | Element): Promise<void> {
    if (this.mounted || this.mounting) return;
    if (!this.app) {
      this.mounting = true;
      let unloading;
      if (this.uiLoading) unloading = this.uiLoading(el as any, this.opts.loadingProps)
      try {
        await this.createApp()
      } catch (error) {
        if (this.uiError) {
          this.destroyUIError = this.uiError(el as any, this.opts.errorProps, this)
          return;
        }
        throw error
      } finally {
        this.mounting = false
        if (unloading) unloading();
      }
    }
    this.app.mount(el);
    this.mounted = true;
  }

  destroy(): void {
    this.mounted = false;
    this.mounting = false;
    if (this.destroyUIError) {
      this.destroyUIError();
      this.destroyUIError = undefined;
    }
    if (this.app) this.app.destroy();
  }

  isMounted(): boolean {
    return this.mounted;
  }

  isLoaded(): boolean {
    return this.loaded;
  }
}

function urlToValidator(path: string): AppInfo['isRouteMatch'] {
  const regex = toDynamicPathValidatorRegex(path);
  return function(_, p) {
    return regex.test(p)
  }
}

function toDynamicPathValidatorRegex(path: string) {
  let lastIndex = 0,
    inDynamic = false,
    regexStr = '^';

  if (path[0] !== '/') {
    path = '/' + path;
  }

  for (let charIndex = 0; charIndex < path.length; charIndex++) {
    const char = path[charIndex];
    const startOfDynamic = !inDynamic && char === ':';
    const endOfDynamic = inDynamic && char === '/';
    if (startOfDynamic || endOfDynamic) {
      appendToRegex(charIndex);
    }
  }

  appendToRegex(path.length);
  return new RegExp(regexStr, 'i');

  function appendToRegex(index: number) {
    const anyCharMaybeTrailingSlashRegex = '[^/]+/?';
    const commonStringSubPath = escapeStrRegex(path.slice(lastIndex, index));

    regexStr += inDynamic
      ? anyCharMaybeTrailingSlashRegex
      : commonStringSubPath;

    if (index === path.length && !inDynamic) {
      regexStr =
        // use charAt instead as we could not use es6 method endsWith
        regexStr.charAt(regexStr.length - 1) === '/'
          ? `${regexStr}.*$`
          : `${regexStr}([/#].*)?$`;
    }

    inDynamic = !inDynamic;
    lastIndex = index;
  }
}

function escapeStrRegex(str: string) {
  // borrowed from https://github.com/sindresorhus/escape-string-regexp/blob/master/index.js
  return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
}
