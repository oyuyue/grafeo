import Vue from 'vue'
import { registerApp, exportApp, enable } from 'grafeo'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

export default exportApp(() => {
  registerApp({
    name: '@app/module',
    mountWhen: '/module',
    props: {
      el: '#module',
      base: '/module/'
    }
  })

  new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount('#app').$nextTick(enable)
})
