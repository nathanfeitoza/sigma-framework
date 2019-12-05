<?php

require dirname(__DIR__).'/scripts/includeParaClassScriptsCl.php';

echo '---- Script Gerador de View do CRUD Sigma ----';

$componente = ucwords($classScript->getDadosNaoPodemVirVazios("Componente: "));
$rota = "";

if($classScript->getYesOrNot("Usar rota padrão (/)") != "s") {
    $rota = $classScript->getDadosNaoPodemVirVazios("Rota: ").'/';
}

$tabela = $classScript->getDadosNaoPodemVirVazios("Tabela: ");
$campos = $classScript->stringVirgulaToArray("Campos: ", '');

$schemaRecuperar = explode('.', $tabela);
$schema = 'public';

if(count($schemaRecuperar) >= 2) {
    $schema = $schemaRecuperar[0];
}

$camposUsar = empty($campos[0]) || $campos[0] == '*' 
              ? $classScript->getCamposTabela($tabela, $schema)
              : $campos;

$camposListarCrud = [];

foreach($camposUsar as $campoCrud) {
    $labelCampo = str_replace('_', ' ', $campoCrud);
    $labelCampo = ucwords($labelCampo);
    
    $camposListarCrud[] = "
        {$campoCrud}: {
            label: '".$labelCampo."',
        }";
}

$saida = "<template>
  <div>
    <Crud
      :configs='crudConfig'
      :opcoes='opcoes'
      baseUrl='".$rota."'
    />
  </div>
</template>

<script>

import Crud from '../../components/Crud'

export default {
  name: '".$componente."',
  components: {
    Crud
  },
  data: function() {
    return {
      crudConfig: {".implode(',',$camposListarCrud)."
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
";

file_put_contents($componente . '.vue', $saida);