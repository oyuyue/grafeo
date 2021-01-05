import { noop, getElement, centerElement } from '../utils';

export default function loading(el: string | Element, opts: { color?: string } = {}): () => void {
  const ele = getElement(el);
  if (!ele) return noop
  const loading = centerElement()
  loading.innerHTML = `<svg fill="${opts.color || '#03A9F4'}" viewBox="0 0 52 20" width="52"><circle cx="6" cy="10" r="6"><animate attributeName="opacity" dur="1s" values="0;1;0" repeatCount="indefinite" begin=".1"/></circle><circle cx="26" cy="10" r="6"><animate attributeName="opacity" dur="1s" values="0;1;0" repeatCount="indefinite" begin=".2"/></circle><circle cx="46" cy="10" r="6"><animate attributeName="opacity" dur="1s" values="0;1;0" repeatCount="indefinite" begin=".3"/></circle></svg>`
  ele.appendChild(loading)
  return function() {
    loading.parentElement?.removeChild(loading)
  }
}
