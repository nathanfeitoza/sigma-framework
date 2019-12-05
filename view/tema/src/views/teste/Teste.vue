<template>
  <div>
    <Crud
      :configs='crudConfig'
      :opcoes='opcoes'
      baseUrl='testar/teste/'
    />
  </div>
</template>

<script>

import Crud from '../../components/Crud'

export default {
  name: 'Teste',
  components: {
    Crud
  },
  data: function() {
    return {
      crudConfig: {
        id: {
            label: 'Id',
        },
        nome: {
            label: 'Nome',
        },
        email: {
            label: 'Email',
        }
      },
      opcoes: {
        edicaoInline: true,
        rotaParaEditar: '/'
      }
    }
  },
  mounted() {
    
  },
}
</script>
