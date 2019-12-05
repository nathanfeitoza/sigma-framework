<template>
  <div>
    <h1>Vamos laaaa</h1>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'produto',
   watch: {
    "$route"(rota) {
      console.log('yupi',rota)
      if(rota.meta.algo != undefined) {
        this.valorTeste = rota.meta.algo;
        return;this.data = []
                  this.total = 0
                  this.loading = false
      }
      this.valorTeste = 'Voltei padrão';
    }
    /*funcaoExec: (linha, chave, dados) => {
            
            return linha + ' -> 1234';
          },*/ 
          //primaria: 'asb',
  },
  mounted() {
    //console.log(this.$route)
  },
}
</script>
