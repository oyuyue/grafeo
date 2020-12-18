import { getElement, noop } from './utils'

export interface UI {
  getElement(): HTMLElement;
  destroy(): void;
}

export class DefaultLoadingUI implements UI {

  constructor(options: any) {
    //
  }
  getElement(): HTMLElement {
    throw new Error('Method not implemented.');
  }
  destroy(): void {
    throw new Error('Method not implemented.');
  }
}

export class DefaultErrorUI implements UI {
  constructor(options: any) {
    //
  }
  getElement(): HTMLElement {
    throw new Error('Method not implemented.');
  }
  destroy(): void {
    throw new Error('Method not implemented.');
  }
}

export function loadingUI(el: string | HTMLElement, options?: any, ui?: UI): () => any {
  el = getElement(el)
  if (!el) return noop

  ui = ui || new DefaultLoadingUI(options)
  el.appendChild(ui.getElement())

  return () => ui!.destroy()
}

export function errorUI(el: string | HTMLElement, options?: any, ui?: UI): () => any {
  el = getElement(el)
  if (!el) return noop

  ui = ui || new DefaultErrorUI(options)
  el.appendChild(ui.getElement())
  
  return () => ui!.destroy();
}
