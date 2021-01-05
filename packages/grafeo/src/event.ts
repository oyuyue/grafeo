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

let onceSupported = false;

let prefix = 'grafeo:'

try {
  const options = Object.defineProperty({}, 'once', { get() { onceSupported = true; } });
  self.addEventListener('test', null as any, options);
} catch(err) {}

export function on(name: string, listener: EventListener, options?: boolean | AddEventListenerOptions): void {
  self.addEventListener(prefix + name, listener, options)
}

export function once(name: string, listener: EventListener): void {
  if (onceSupported) {
    self.addEventListener(prefix + name, listener, { once: true })
  } else {
    const tmp = (event: Event) => {
      off(name, tmp)
      listener(event)
    }
    self.addEventListener(prefix + name, tmp)
  }
}

export function off(name: string, listener: EventListener): void {
  self.removeEventListener(prefix + name, listener)
}

export function emit<T = any>(name: string, detail?: T): void {
  const evt = new CustomEvent(prefix + name, { detail, bubbles: false, cancelable: false });
  self.dispatchEvent(evt)
}

export function setEventPrefix(p: string): void {
  prefix = p;
}
