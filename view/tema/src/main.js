import Vue from 'vue'
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'
import '@mdi/font/css/materialdesignicons.css'
import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'
import network from './utils/network'

Vue.config.productionTip = false;
Vue.use(Buefy)

const options = {
  confirmButtonColor: '#41b882',
  cancelButtonColor: '#ff7674'
}
 
Vue.use(VueSweetalert2, options)


const urlDefaultApi = 'http://apilocal.com.br/api/';

Vue.prototype.$network = network(urlDefaultApi);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
