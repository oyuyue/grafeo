import Vue from 'vue'
import { exportApp } from 'grafeo'
import App from './App.vue'
import createRouter from './router'
import store from './store'

Vue.config.productionTip = false

export default exportApp((opts = {}, isRoot) => {
  if (isRoot) {
    new Vue({
      router: createRouter(),
      store,
      render: h => h(App)
    }).$mount('#app')
    return
  }

  let app

  return {
    mount(el) {
      if (app) return;
      const container = document.createElement('div')
      app = new Vue({
        router: createRouter(opts.base),
        store,
        render: h => h(App)
      }).$mount(container)
      el = el || opts.el;
      if (typeof el === 'string') el = document.querySelector(el)
      el.appendChild(app.$el)
    },
    destroy() {
      if (app) {
        app.$destroy()
        app.$el.parentNode.removeChild(app.$el)
        app = undefined;
      }
    }
  }
})
