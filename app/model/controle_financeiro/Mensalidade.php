<?php
/**
 * Created by PhpStorm.
 * User: nathan
 * Date: 17/03/19
 * Time: 12:28
 */

namespace AppModel\controle_financeiro;


use AppCore\Genericos;

class Mensalidade extends ControleFinanceiro
{
    /**
     * Objetivo: Gerar as mensalidades de um determinado mês
     * Recebe: data a ser gerada as mensalidades
     * Retorna: a quantidade de mensalidades geradas para a data enviada
     * Autor: Nathan Feitoza
     * Data: 20/03/19 14:54
     * Nome Método: gerarMensalidades
     *
     * @param $data_gerar
     * @return mixed
     * @autor Nathan Feitoza
     */
    public function gerarMensalidades($data_gerar)
    {
        $data_gerar = date('Y-m-d', strtotime($data_gerar));

        return $this->db()
            ->tabela(Genericos::getSchema()."geramensalidades('".$data_gerar."') as MENSALIDADES_GERADAS")
            ->campos(['*'])
            ->buildQuery('select');
    }

    /**
     * Objetivo: Recuperar as mensalidades geradas para o mês e o tipo de busca enviados
     * Recebe: dados para recuperar as mensalidades
     * Retorna: Mensalidades para o mês e tipo (1 - emissao, 2 ou outro - vencimento) selecionado
     * Autor: Nathan Feitoza
     * Data: 20/03/19 14:53
     * Nome Método: getMensalidades
     *
     * @param $data_consultar
     * @param $tipo_consultar
     * @return mixed
     * @autor Nathan Feitoza
     */
    public function getMensalidades($data_consultar, $tipo_consultar)
    {

        $data1 = $data_consultar.'-01';
        $data_array = explode('-',$data_consultar);
        $ultimo_dia_mes = date("t", mktime(0, 0, 0, $data_array[1], '01', $data_array[0]));
        $data2 = $data_consultar.'-'.$ultimo_dia_mes;

        $tipo_buscar = $tipo_consultar == 1 ? 'emissao' : 'vencimento';

        return $this->db()->tabela(Genericos::getSchema().'view_mensalidades')
            ->where($tipo_buscar,'>=',$data1)
            ->whereAnd($tipo_buscar,'<=',$data2)
            ->orderBy('nome','ASC')
            ->buildQuery('select');
    }
}