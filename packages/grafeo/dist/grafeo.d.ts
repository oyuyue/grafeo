
declare interface App {
    mount?: (el?: string | Element) => void;
    update?: (opts?: any) => void;
    destroy?: () => void;
}

declare type AppEntry = (opts: any, isRoot?: boolean) => Required<App>;

declare class AppInfo {
    private loaded;
    private mounting;
    private mounted;
    private load_;
    private appEntry;
    private app;
    private opts;
    private uiLoading;
    private uiError;
    private destroyUIError;
    isRouteMatch?: (loc: Location, path: string) => boolean;
    constructor(opts: RegisterAppOptions);
    load(): Promise<void>;
    createApp(opts?: any): Promise<void>;
    update(opts?: any): Promise<void>;
    mount(el?: string | Element): Promise<void>;
    destroy(): void;
    isMounted(): boolean;
    isLoaded(): boolean;
}

export declare function destroyApp(name: string): void;

export declare function disable(): void;

export declare function emit<T = any>(name: string, detail?: T): void;

export declare function enable(): void;

export declare const EVENT_DISABLE = "disable";

export declare const EVENT_ENABLE = "enable";

export declare function exportApp<T>(fn: (options: T, isRoot: boolean) => Partial<App> | App['mount'] | [App['mount'], App['destroy']] | undefined): (options: T, isRoot: boolean) => App | undefined;

export declare function getApp(name: string): AppInfo;

export declare function getAppChanges(path: string): {
    mounts: AppInfo[];
    destroys: AppInfo[];
};

export declare function getApps(): AppInfo[];

export declare function isEnabled(): boolean;

export declare function mountApp(name: string, el?: string | Element): Promise<void>;

export declare function off(name: string, listener: EventListener): void;

export declare function on(name: string, listener: EventListener, options?: boolean | AddEventListenerOptions): void;

export declare function once(name: string, listener: EventListener): void;

export declare const originPushState: (data: any, title: string, url?: string | null | undefined) => void;

export declare const originReplaceState: (data: any, title: string, url?: string | null | undefined) => void;

export declare function registerApp(opts: RegisterAppOptions): void;

export declare interface RegisterAppOptions<P = any, L = any, E = any> {
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

export declare function setEventPrefix(p: string): void;

export declare function unregisterApp(name: string): void;

export declare function updateApp(name: string, opts: any): void;

export { }
