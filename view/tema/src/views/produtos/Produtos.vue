<template>
  <div>
    <Crud
      :configs="crudConfig"
      :opcoes="opcoes"
      baseUrl=""
    />
  </div>
</template>

<script>

import moment from 'moment';

import Crud from '../../components/Crud'
import Produto from './Produto'

export default {
  name: 'Produtos',
  components: {
    Crud
  },
  data: function() {
    return {
      crudConfig: {
        id: {
          label: 'ID',
          pesquisa: {
            ativo: false,
          },
        },
        nome: {
          label: 'Nome',
          pesquisa: {
            tipoComparador: 'like'
          }
        },
        email: {
          label: 'E-mail',
          tipoCampo: 'email',
          pesquisa: {
            tipoComparador: 'like'
          }
        },
        senha: {
          label: 'Senha',
          tipoCampo: 'password'
        },
        data_cad: {
          label: 'Data Cadastro',
          type: 'datepicker',
          tipoCampo: "datepicker",
          funcaoExecField(valor) {
            return moment(valor).format("DD/MM/YYYY");
          },
          funcaoExec(valor) {
            return moment(valor).format("DD/MM/YYYY");
          }
        }
      },
      opcoes: {
        edicaoInline: false,
        rotaParaEditar: '/produto/{id}/editar'
      }
    }
  },
  mounted() {
    
  },
  routerChildren: [{
        path: '/produto/:id/:criar_editar_visualizar(editar|criar|visualizar)?',
        name: 'produto',
        component: Produto, //Produto
        meta: {
          editando: 'meu pintooooooo'
        },
        //props: true
  }],
}
</script>
