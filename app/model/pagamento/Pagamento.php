<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 15/03/19
 * Time: 09:20
 */

namespace AppModel\pagamento;


use AppCore\Model;

class Pagamento extends Model
{

    /**
     * Objetivo: Retornar as formas de pagamento disponiveis
     * Recebe: Se retornará as contas correntes como uma forma de pagamento
     * Retorna: array com as formas de pagamento
     * Autor: Nathan Feitoza
     * Nome Método: getFormasPagamento
     *
     * @param bool $add_contas_correntes
     * @return mixed
     * @autor Nathan Feitoza
     */
    public function getFormasPagamento($add_contas_correntes=false)
    {
        $retorno = $this->db()->tabela('view_forma_pagamento')
            ->orderBy('id','ASC')
            ->buildQUery('select');

        if($add_contas_correntes) {
            $this->loadModel('entidade/empresa');
            $contas_correntes = $this->model_entidade_empresa
                ->setCamposRetornar(['id','numero_conta','nome'])
                ->getContasCorrentesEmpresa();

            $retorno['CONTAS_CORRENTES'] = $contas_correntes;
        }

        return $retorno;
    }

    /**
     * Objetivo: Recuperar uma determinada forma de pagamento
     * Recebe: id da forma de pagamento
     * Retorna: array com os dados da forma de pagamento solicitada
     * Autor: Nathan Feitoza
     * Nome Método: getFormaPagamento
     *
     * @param $forma_id
     * @return mixed
     * @autor Nathan Feitoza
     */
    public function getFormaPagamento($forma_id)
    {
        return $this->db()->tabela('view_forma_pagamento')
            ->where('id','=', $forma_id)
            ->orderBy('id','DESC')
            ->buildQuery('select');
    }
}