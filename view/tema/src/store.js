import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    modelCamposFormularioCriar: [],
    modelCamposFormulario: [],
    modelCamposFormularioComparar: []
  },
  mutations: {
	setModelCamposFormularios(state, dados) {
		state.modelCamposFormulario[dados.chave] = dados.valor;
	},
	setModelCamposFormulariosCriar(state, dados) {
		state.modelCamposFormularioCriar[dados.chave] = dados.valor;
	},
	setModelCamposFormulariosComparar(state, dados) {
		if(dados.chave == -1) {
			state.modelCamposFormularioComparar = dados.valor;
			return;
		}

		state.modelCamposFormularioComparar[dados.chave] = dados.valor;
	}

  },
  actions: {
  },
  modules: {
  }
})
