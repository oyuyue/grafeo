let onceSupported = false;
let prefix = 'grafeo:';

try{
  new window.CustomEvent('T');
}catch(e){
  const CustomEvent = function<T>(event: string, params?: CustomEventInit<T>){
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles as boolean, params.cancelable as boolean, params.detail);
    return evt;
  };
  CustomEvent.prototype = window.Event.prototype;
  self.CustomEvent = CustomEvent as any;
}

try {
  const options = Object.defineProperty({}, 'once', { get() { onceSupported = true; } });
  self.addEventListener('test', null as any, options);
} catch(err) {}

// eslint-disable-next-line @typescript-eslint/ban-types
const listenerMap: Map<EventListener, EventListener> = new Map();

function createListener(listener: EventListener): EventListener {
  return function ({ detail }: any) { return listener(detail); };
}

export function on(name: string, listener: EventListener, options?: boolean | AddEventListenerOptions): void {
  const l = createListener(listener);
  listenerMap.set(listener, l);
  self.addEventListener(prefix + name, l, options);
}

export function once(name: string, listener: EventListener): void {
  const l = createListener(listener);
  listenerMap.set(listener, l);
  if (onceSupported) {
    self.addEventListener(prefix + name, l, { once: true });
  } else {
    const tmp = (event: Event) => {
      off(name, tmp);
      l(event);
    };
    self.addEventListener(prefix + name, tmp);
  }
}

export function off(name: string, listener: EventListener): void {
  const l = listenerMap.get(listener);
  self.removeEventListener(prefix + name, l as EventListener);
  listenerMap.delete(listener);
}

export function emit<T = any>(name: string, detail?: T): void {
  const evt = new CustomEvent(prefix + name, { detail, bubbles: false, cancelable: false });
  self.dispatchEvent(evt);
}

export function setEventPrefix(p: string): void {
  prefix = p;
}
