<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 11/07/18
 * Time: 14:12
 */

namespace AppModel\stimul;
use AppCore\Genericos;
use Exception, stdClass;
use AppCore\Model;

class MenuSc extends Model
{
    /**
     * Objetivo: Recuperar os menus pais do SC
     * Retorna: os menus pais do script case
     * Autor: Nathan Feitoza
     * Nome Método: getMenuPais
     *
     * @return array|bool|\Info\classes\BD\BuildQuery|mixed
     * @throws Exception
     * @autor Nathan Feitoza
     */
    public function getMenuPais()
    {
        return $this->setMsgNaoEncontrado('null')
            ->db()->tabela('view_menu_pai')->buildQuery('select');
    }

    /**
     * Objetivo: Trazer qual foi a ultima ordem de um menu pai
     * Recebe: o id do pai
     * Retorna: retornar a ultima ordem de um menu pai
     * Autor: Nathan Feitoza
     * Nome Método: getUltimaOrdemPai
     *
     * @param $id_pai
     * @return array|bool|\Info\classes\BD\BuildQuery|mixed
     * @throws Exception
     * @autor Nathan Feitoza
     */
    protected function getUltimaOrdemPai($id_pai)
    {
        $retorno = $this->db()->tabela('menu_sistema')
            ->campos(['max(ordem) as ordem'])
            ->setUsarExceptionNaoEncontrado(false)
            ->where('id_pai','=', $id_pai)
            ->buildQuery('select');

        $vazio = [new stdClass()];
        $vazio[0]->ORDEM = 0;

        return (is_int($retorno)) ? $vazio : $retorno;
    }

    /**
     * Objetivo: Verifica se um arquivo do stimul (.mrt) que comporá o menu já existe
     * Recebe: Nome do arquivo
     * Retorna: Booleano de true para não existe e seu inverso para existe
     * Autor: Nathan Feitoza
     * Nome Método: verificarExisteArquivoMenu
     *
     * @param $nome_arquivo
     * @return bool|string
     * @throws Exception
     * @autor Nathan Feitoza
     */
    public function verificarExisteArquivoMenu($nome_arquivo)
    {
        $verificar = $this->db()->tabela('menu_sistema')
            ->campos(['id'])
            ->where('aplicacao','=',$nome_arquivo)
            ->setUsarExceptionNaoEncontrado(false)
            ->setFalseNaoEncontrado(true)
            ->buildQuery('select');

        $retorno = is_bool($verificar);
        $retornar_quando_nome_array = $retorno ? 'true' : 'false' ;

        return is_array($nome_arquivo) ? $retornar_quando_nome_array  : $retorno;
    }

    /**
     * Objetivo: cadastrarEntidade um item de menu referente a um relatório do Stimul
     * Recebe: campos do menu
     * Retorna: mensagem de que o menu foi cadastrado
     * Autor: Nathan Feitoza
     * Nome Método: setCadastrarMenuItemRelatorio
     *
     * @param $campos_menu
     * @return string
     * @throws Exception
     * @autor Nathan Feitoza
     */
    public function setCadastrarMenuItemRelatorio($campos_menu)
    {
        $necessarios = ['nome_menu','arquivo','id_pai'];

        Genericos::camposVazios($campos_menu,$necessarios);

        $nome_menu = $campos_menu[ $necessarios[0] ];
        $aplicacao = $campos_menu[ $necessarios[1] ];
        $id_pai = $campos_menu[ end($necessarios) ];

        if(!is_null($id_pai)) {
            $ordem = $this->getUltimaOrdemPai($id_pai)[0]->ORDEM;
            $ordem = is_null($ordem) ? 0 : $ordem;
            $ordem = $ordem == 0 ? 0 : $ordem + 1;
            $nome_menu = preg_replace("/(_)/", " ", $nome_menu);
            $aplicacao_salvar = strtolower($aplicacao);

            if($this->verificarExisteArquivoMenu($aplicacao_salvar)) {
                $this->inserir_bd_menu_sistema(['descricao','aplicacao','id_pai','ordem'],
                    [$nome_menu, $aplicacao_salvar, $id_pai, $ordem]);
            }
        }

        return $nome_menu.' Salvo com sucesso';
    }
}