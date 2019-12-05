import Vue from 'vue'
import Router from 'vue-router'

import PageNotFound from './views/PageNotFound'
    
Vue.use(Router)
const rotas = [
  { 
    path: "*", 
    component: PageNotFound 
  },
];

const rotaViews = './views/';

const paginas = require.context('./views', true, /^(?!\.+\/+PageNotFound+\.vue$).+\.vue$/m);

paginas.keys().forEach((item) => {
  const dadosPagina = item.split('/');
  let path = '/';
  let name = 'inicio';
  
  dadosPagina.shift();

  if(dadosPagina.length > 1) {
    let componente = dadosPagina[(dadosPagina.length - 1)]
    componente = componente.replace('.vue', '')
  
    path = `/${dadosPagina[0]}`;
    name = dadosPagina[0];

    if(componente.toLowerCase() != dadosPagina[0].toLowerCase()) {
      const cloneDadosPagina = [...dadosPagina];
      cloneDadosPagina.pop();

      path = `/${cloneDadosPagina.join('/')}/${componente.toLowerCase()}`;
      name = componente.toLowerCase();
    }
  }
  
  var componenteCarregar = dadosPagina.join('/')

  const componenteImportar = require(`${rotaViews}${componenteCarregar}`)
  const rotarAdicionar = {
      path: `${path}`,
      name: name,
      component: componenteImportar.default
  }

  if(typeof componenteImportar.default.routerChildren) {
    rotarAdicionar.children = componenteImportar.default.routerChildren;
  }

  rotas.push(rotarAdicionar)
})

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: rotas 
})
