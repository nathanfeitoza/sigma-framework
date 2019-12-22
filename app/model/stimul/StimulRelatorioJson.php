<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 28/03/19
 * Time: 11:20
 */

namespace AppModel\stimul;


use AppCore\errors\AppException;
use AppCore\Genericos;
use AppCore\Model;

class StimulRelatorioJson extends Model
{
    /**
     * Objetivo: Gerar o json a ser usado nos relatórios que usam esta fonte de dados
     * Recebe: Os dados que serão gravados e o nome do relatorio (que será acescido do id do usuário)
     * Retorna: Nome do arquivo gerado
     * Autor: Nathan Feitoza
     * Nome Método: setGerarJsonRelatorio
     *
     * @param $dados
     * @param string $nome_json
     * @return array
     * @throws Exception
     * @autor Nathan Feitoza
     */
    protected function setGerarJsonRelatorio($dados, $nome_json='json')
    {
        if (!is_array($dados)) $dados = [$dados];
        $dados_json = json_encode($dados);

        $nome_json = str_replace(' ','_',$nome_json);
        $nome_arquivo = Genericos::getUsuarioSCLogado(false, false).'_'.$nome_json.'.json';
        $local_arquivo = '/tmpStimul/'.$nome_arquivo;

        $this->engine()->saveArquivo($local_arquivo, $dados_json);

        return ['arquivo'=>$nome_arquivo];
    }

    /**
     * Objetivo: Buscar um arquivo json e retornar seus dados para ser
     * usado em relatórios que o usem como fonte de dados
     * Recebe: nome do arquivo com ou sem .json
     * Retorna: Dados contidos no arquivo
     * Autor: Nathan Feitoza
     * Nome Método: getJsonRelatorio
     *
     * @param $arquivo
     * @return array
     * @throws Exception
     * @autor Nathan Feitoza
     */
    public function getJsonRelatorio($arquivo)
    {
        if (!strpos(strtolower($arquivo), '.json')) {
            $arquivo .= '.json';
        }

        $local_arquivo = $this->engine()->criarPasta('tmpStimul',true).$arquivo;

        if (!file_exists($local_arquivo)) throw new AppException('Arquivo não encontrado',404,404);

        $dados = file_get_contents($local_arquivo);

        return $dados;
    }

    public function gerarJsonRelatorioEstoqueMov($id_chave)
    {
        $this->loadModel('estoque_mov/estoque_mov');
        $model = $this->model_estoque_mov_estoque_mov;

        if (strlen($id_chave) == 44) {
            $dados = $model->getEstoqueMovSalvosChaveNfe($id_chave);
        } else {
            $dados = $model->getEstoqueMovSalvoId($id_chave);
        }

        return $this->setGerarJsonRelatorio($dados, 'relatorio_estoque_mov');
    }
}