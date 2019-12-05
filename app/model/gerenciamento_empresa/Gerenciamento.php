<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 29/03/19
 * Time: 14:08
 */

namespace AppModel\gerenciamento_empresa;

use AppCore\Genericos;
use AppCore\Model;

class Gerenciamento extends Model
{
    public function getPlanoContasGerencial()
    {
        return $this->setMsgNaoEncontrado('Sem plano gerencial cadastrado')
            ->db()->tabela('plano_conta_gerencial')->orderBy('id','asc')->buildQuery('select');
    }

    public function getControleCusto()
    {
        return $this->setMsgNaoEncontrado('Sem controle de custo cadastrado')
            ->db()->tabela(Genericos::getSchema().'controle_centro_custo')->buildQuery('select');
    }
}