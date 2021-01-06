import { merge } from './utils';

export type StoreListener = (patch: Partial<any> ,store: Store<any>) => any;
export type StoreWatcher = (store: Store<any>) => any;

class Store <T extends Record<string, any>>{
  private state: T;
  private listeners: StoreListener[] = [];
  private watchers: {[key: string]: StoreWatcher[]} = {};
  private dataQueue: Partial<T>[] = [];
  private updateDataTimer!: number | undefined;

  constructor(state: T) {
    this.state = state || Object.create(null);
  }

  private updateState = () => {
    const paths: string[] = [];
    const patch = this.dataQueue.reduce((a, c) => merge(a, c));
    merge(this.state, patch, paths);
    this.dataQueue = [];

    this.listeners.forEach(fn => fn(patch, this));

    this.updateDataTimer = undefined;
  }

  getState(): T {
    return this.state;
  }

  setData(data: Partial<T>): void {
    this.dataQueue.push(data);
    if (this.updateDataTimer === undefined) this.updateDataTimer = setTimeout(this.updateState);
  }

  subscribe(listener: StoreListener): void {
    this.listeners.push(listener);
  }

  watch(path: string, watcher: StoreWatcher): void {
    (this.watchers[path] || (this.watchers[path] = [])).push(watcher);
  }

  unsubscribe(listener: StoreListener): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  unwatch(): void {
    //
  }
}

export default Store;
