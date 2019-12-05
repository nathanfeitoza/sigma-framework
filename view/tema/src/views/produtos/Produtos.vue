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
        }
      },
      opcoes: {
        edicaoInline: true,
        rotaParaEditar: '/teste/testar'
      }
    }
  },
  mounted() {
    
  },
  routerChildren: [{
        path: '/produto/:id/:criar_editar(editar|criar)?',
        name: 'produto',
        component: Produto, //Produto
        meta: {
          algo: 'meu pintooooooo'
        },
        //props: true
  }],
}
</script>
