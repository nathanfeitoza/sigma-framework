<?php

require dirname(__DIR__).'/scripts/includeParaClassScriptsCl.php';

echo '---- Script Gerador de CRUD Sigma ----';

$namespace_usar = $classScript->getDadosNaoPodemVirVazios("Namespace da Classe: ");
$namespace =  $namespace_usar;

$is_api = $classScript->getYesOrNot("Api");
$localController = $is_api == 's' ? 'api' : 'ui';

$classe = $classScript->getDadosNaoPodemVirVazios("Nome da Classe: ");
$classe_usar = ucwords($classe);
$classe_usar = str_replace('_', '', $classe_usar);
$tabela = $classScript->getDadosNaoPodemVirVazios("Qual tabela você deseja gerar um crud: ");
$usar_schema = $classScript->getYesOrNot("Usar schema");
$schema = 'bd';

if ($usar_schema) {
    $schema = 'bd1';
}

$campos = $classScript->stringVirgulaToArray("Quais os campos (separados por vírgula ou branco para todos): ");

$usar_adicionar = $classScript->getYesOrNot("Usar adicionar");
$usar_atualizar = $classScript->getYesOrNot("Usar atualizar");
$usar_deletar = $classScript->getYesOrNot("Usar deletar");
$usar_listar = $classScript->getYesOrNot("Usar listar");
$nao_listar = '$campos_listar = $campos["campos"];';

if ($usar_listar == 's') {
    $nao_listar = $classScript->stringVirgulaToArray("Campos nao listar: ", '');

    if (!empty($nao_listar[0])) {
        $nao_listar = '
            $nao_listar = ['.$classScript->printArrayArquivo($nao_listar).'];
            $campos_listar = $this->getCamposListarCrud($campos["campos"], $nao_listar);
        ';
    } else {
        $nao_listar = '$campos_listar = $campos["campos"];';
    }

    $listar_com_busca = $classScript->getYesOrNot('Listar terá busca');
    $listar = '
    public function listar()
    {
        return $this->listar_'.$schema.'_'.$tabela.'();
    }
    ';

    if ($listar_com_busca == 's') {
        $listar = '
    public function listar($query = false)
    {
        return $this->listar_'.$schema.'_'.$tabela.'(function($where) use ($query) {
            return $this->whereOfQuery($query, $where);
        });
    }
        ';
    }

    $usar_paginacao = $classScript->getYesOrNot('Usar pagincação na listagem');

    if ($usar_paginacao == 's') {
        $listar = '
    public function listar($query = false)
    {
        return $this->getDadosPaginadosGenerico("'.$tabela.'", false, function($where) use ($query) {
            return $this->whereOfQuery($query, $where);
        });
    }
        ';
    }
}

$arquivo_model_saida = '<?php
/**
 * Created by Nathan Feitoza (Sigma).
 * Date: '.date('m/d/Y').'
 * Time: '.date('h:i').'
 */
namespace AppModel\\'.$namespace.';

use AppCore\Genericos;
use AppCore\Model;

class '.$classe_usar.' extends Model
{

    public function adicionar($adicionar)
    {
        $pegar = ['.$classScript->printArrayArquivo($campos).'];

        return $this->inserir_'.$schema.'_'.$tabela.'(
            $this->filtrarCamposCrud($pegar, $adicionar)
        );
    }

    public function atualizar($atualizar)
    {
        $pegar = ['.$classScript->printArrayArquivo($campos).'];
        
        Genericos::verificarCampoPreenchido($atualizar, "id", true);

        return $this->atualizar_'.$schema.'_'.$tabela.'(
            $this->filtrarCamposCrud($pegar, $atualizar),
            function($where) use ($atualizar) {
                return $where->where("id", "=", $atualizar["id"]);
            }
        );
    }

    public function deletar($id)
    {
        return $this->deletar_'.$schema.'_'.$tabela.'(
            function($where) use ($id) {
                return $where->where("id", "=", $id);
            }
        );
    }
'.$listar.'
}
';

$localModel = $namespace_usar.'/'.strtolower($classe);
$call_model = $namespace_usar.'_'.strtolower($classe);

$arquivo_controller_saida = '<?php

/**
 * Created by Nathan Feitoza (Sigma).
 * Date: '.date('m/d/Y').'
 * Time: '.date('h:i').'
 */

namespace AppController\\'.$localController.'\\'.$namespace.';

use AppCore\Controller;
use AppCore\errors\AppException;
use AppCore\Genericos;
use AppCore\Log;

class Controller'.$classe_usar.' extends Controller
{

    public function adicionar() 
    {
        $this->setMethodsAceitos(["POST"]);
        $this->loadModel("'.$localModel.'");
        $model = $this->model_'.$call_model.';

        $this->setOutputJson($model->adicionar($this->getAllParams()));
    }

    public function atualizar() 
    {
        $this->setMethodsAceitos(["PUT"]);
        $this->loadModel("'.$localModel.'");
        $model = $this->model_'.$call_model.';

        $this->setOutputJson($model->atualizar($this->getAllParams()));
    }

    public function deletar() 
    {
        $this->setMethodsAceitos(["DELETE"]);
        $this->loadModel("'.$localModel.'");
        $model = $this->model_'.$call_model.';
        $id = $this->getParamSend("id", true)["id"];

        $this->setOutputJson($model->deletar($id));
    }

    public function listar() 
    {
        $this->setMethodsAceitos(["GET"]);
        $this->loadModel("'.$localModel.'");
        $model = $this->model_'.$call_model.';
        $campos = $this->getParamSend("campos");
        $query = $this->getParamSend("query");
        $model->setPaginacao($this->getAllParams());

        if ($campos !== false) {
            '.$nao_listar.'
            $model->setCamposRetornar($campos_listar);
        }

        $this->setOutputJson($model->listar($query));
    }
}
';

$local_salvar_model = dirname(__DIR__) . '/model/'.$namespace.'/';
if (!file_exists($local_salvar_model)) mkdir($local_salvar_model);

$local_salvar_controller = dirname(__DIR__) . '/controller/'.$localController.'/'.$namespace.'/';
if (!file_exists($local_salvar_controller)) mkdir($local_salvar_controller);

file_put_contents($local_salvar_model.$classe_usar.'.php', $arquivo_model_saida);
file_put_contents($local_salvar_controller.'Controller'.$classe_usar.'.php', $arquivo_controller_saida);

echo 'Gerado com sucesso';

echo PHP_EOL;