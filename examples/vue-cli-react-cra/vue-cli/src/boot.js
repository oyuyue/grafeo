import Vue from 'vue'
import { registerApp, exportApp, enable } from 'grafeo'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

export default exportApp(() => {
  registerApp({
    name: '@app/react',
    mountWhen: '/react',
    props: {
      el: '#react'
    }
  })

  new Vue({
    router,
    store,
    render: h => h(App)
  }).$mount('#app').$nextTick(enable)
})
