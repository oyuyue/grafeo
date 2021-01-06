import { getAppChanges } from './app';
import { storeError, throwErrors } from './utils';
import { isEnabled } from './enable';
import { EVENT_ENABLE } from './constants';
import { on } from './event';

function createPopStateEvent(state: any) {
  let evt;
  try {
    evt = new PopStateEvent('popstate', { state });
  } catch (err) {
    evt = document.createEvent('PopStateEvent');
    (evt as any).initPopStateEvent('popstate', false, false, state);
  }
  return evt;
}

function patchedUpdateState(updateState: History['pushState'] | History['replaceState']) {
  return function (this: History) {
    const urlBefore = self.location.href;
    // eslint-disable-next-line prefer-rest-params
    const result = updateState.apply(this, arguments as any);
    if (!isEnabled()) return result;
    const urlAfter = self.location.href;

    if (urlBefore !== urlAfter) {
      self.dispatchEvent(createPopStateEvent(self.history.state));
    }

    return result;
  };
}

let reqAniId: number;
function onReroute() {
  if (!isEnabled()) return;
  cancelAnimationFrame(reqAniId);
  reqAniId = requestAnimationFrame(function() {
    const path = location.href.replace(location.origin, '').replace(location.search, '').split('?')[0];
    const apps = getAppChanges(path);
    apps.mounts.forEach((app) => {
      try {
        app.mount();
      } catch (error) {
        storeError(error);
      }
    });
    apps.destroys.forEach((app) => {
      try {
        app.destroy();
      } catch (error) {
        storeError(error);
      }
    });

    throwErrors();
  });
}

export const originPushState = self.history.pushState;
export const originReplaceState = self.history.replaceState;

self.history.pushState = patchedUpdateState(originPushState);
self.history.replaceState = patchedUpdateState(originReplaceState);
self.addEventListener('hashchange', onReroute);
self.addEventListener('popstate', onReroute);

on(EVENT_ENABLE, onReroute);
