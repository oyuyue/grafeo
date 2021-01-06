import { centerElement, getElement, noop } from '../utils';
import AppInfo from './AppInfo';

export default function error(el: string | Element, opts: any = {}, info: AppInfo) {
  const ele = getElement(opts.el || el);
  if (!ele) return noop;
  const error = centerElement();
  error.style.cursor = 'pointer';
  error.innerHTML = `<svg viewBox="0 0 24 24" width="50"><path fill="${opts.color || '#D32F2F'}" d="M13 13h-2V7h2m0 10h-2v-2h2M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2z"/></svg>`;
  const destroy = function() {
    if (error.parentNode) {
      error.parentNode.removeChild(error);
    }
  };

  error.addEventListener('click', function() {
    destroy();
    info.mount(el);
  });

  ele.appendChild(error);

  return destroy;
}
