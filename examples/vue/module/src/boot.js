import Vue from 'vue'
import { exportApp } from 'grafeo'
import App from './App.vue'
import createRouter from './router'
import store from './store'

Vue.config.productionTip = false

export default exportApp((opts = {}) => {
  let app
  return {
    mount(el) {
      try {
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
      } catch (error) {
        console.log(error)
      }
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
