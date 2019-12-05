<?php

/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 14/03/19
 * Time: 14:23
 */
namespace AppModel\entidade;

use \AppCore\Model;

class Entidade extends Model
{
    const view_empresa = 'view_empresa';
    const view_clientes = 'view_clientes';
    const view_fornecedores = 'view_fornecedores';
    const view_administradoras_cartoes = 'view_administradoras_cartoes';
    const view_funcionarios = 'view_funcionarios';
    const view_vendedores = 'view_vendedores';

    public function getEntidades($tabela_entidade='entidade')
    {
        return $this->getDadosPaginadosGenerico($tabela_entidade, function($entidae){
            $entidae->orderBy('nome','ASC');
        });
    }

    public function getEntidade($entidade_id, $tabela_entidade='entidade')
    {
        return $this->db()->tabela($tabela_entidade)->where('id','=',$entidade_id)->buildQUery('select');
    }

    public function getEntidadeCnpj($entidade_cnpj, $tabela_entidade='entidade')
    {
        return $this->db()->tabela($tabela_entidade)->where('cnpj','=',$entidade_cnpj)->buildQUery('select');
    }

    public function getEntidadeNome($entidade_nome, $tabela_entidade='entidade')
    {
        return $this->getDadosPaginadosGenerico($tabela_entidade, function($callback) {
                $callback->orderBy('nome','ASC');
        }, function($entidae) use ($entidade_nome) {
                    $entidae->where('nome','ilike','%'.$entidade_nome.'%');
        });
    }
}