<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 22/03/19
 * Time: 13:32
 */

namespace AppController\api\extensao\stimul;


use AppCore\Controller;
use AppCore\errors\AppException;
use AppCore\Genericos;

class ControllerStimul extends Controller
{
    protected function model()
    {
        $this->loadModel('stimul/stimul');
        return $this->model_stimul_stimul;
    }

    public function handler()
    {
        $this->setMethodsAceitos('POST');

        $getDados = $this->getParamSend('dados');

        if($getDados == false) {
            $dados = file_get_contents('php://input');
            Genericos::jsonDecode($dados,'Requisição não válida para o stimul');
            $getDados = $dados;

        } else {
            $getDados = $getDados['dados'];
        }

        $this->setOutputJson($this->model()->handler($getDados), false);
    }

    public function verificarExisteRelatorio()
    {
        $this->setMethodsAceitos('GET');
        $this->loadModel('stimul/menu_sc');
        $nome_arquivo = $this->getParamSend('nome_arquivo', true)['nome_arquivo'];

        $this->setOutputJson($this->model_stimul_menu_sc->verificarExisteArquivoMenu($nome_arquivo));
    }

    public function autocomplete()
    {
        $this->setMethodsAceitos('GET');
        $campos_necessarios_url = ['tabela','campo_exibir','campo_buscado','pesquisar'];
        $dados_relatorio = $this->getParamSend($campos_necessarios_url,true);

        $tabela = $dados_relatorio[ $campos_necessarios_url[0] ];
        $campo_exibir = $dados_relatorio[ $campos_necessarios_url[1] ];
        $campo_buscado = $dados_relatorio[ $campos_necessarios_url[2] ];

        $pesquisar = $dados_relatorio[ end($campos_necessarios_url) ];

        $this->setOutputJson($this->model()->getAutoCompleteRelatorio($tabela, $campo_exibir, $campo_buscado, $pesquisar));
    }

    public function licenca()
    {
        $this->setMethodsAceitos('POST');
        $this->setOutputJson($this->model()->getLicenca());
    }

    public function gerarRelatorioJson()
    {
        $this->setMethodsAceitos(['GET','POST']);

        $this->loadModel('stimul/stimul_relatorio_json');
        $model = $this->model_stimul_stimul_relatorio_json;

        $tipo = $this->getParamSend('tipo', true)['tipo'];
        $argumentos = $this->getParamSend('argumentos');

        $argumentos = !$argumentos ? [] : $argumentos['argumentos'];

        $argumentos = !is_array($argumentos) ? [$argumentos] : $argumentos;

        $tipo = str_replace('_',' ',$tipo);
        $tipo = ucwords($tipo);
        $tipo = str_replace(' ','', $tipo);

        $gerar = 'gerarJsonRelatorio'.$tipo;

        if(!method_exists($model, $gerar)) {
            throw new AppException('A geração de relatório para '.$tipo.' não foi encontrada', 404, 404);
        }

        $reflection = new \ReflectionMethod($model, $gerar);

        if(!$reflection->isPublic()) {
            throw new AppException('A geração de relatório para '.$tipo.' não foi encontrada',1006, 403);
        }

        $paramsMethod = $reflection->getParameters();

        if(count($paramsMethod) != 0 and count($argumentos) == 0) {
            throw new AppException('O tipo '.$tipo.' de relatório necessita de argumentos', 10615,401);
        }

        $this->setOutputJson(call_user_func_array([$model,$gerar], $argumentos));
    }

    public function getRelatorioJson()
    {
        $this->setMethodsAceitos('GET');

        $this->loadModel('stimul/stimul_relatorio_json');
        $model = $this->model_stimul_stimul_relatorio_json;

        $relatorio = $this->getParamSend('relatorio',true)['relatorio'];

        $this->setOutputJson(json_decode($model->getJsonRelatorio($relatorio)),false);
    }
}