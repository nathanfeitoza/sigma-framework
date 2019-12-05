<?php
/**
 * Created by PhpStorm.
 * User: nathan
 * Date: 16/03/19
 * Time: 23:38
 */

namespace AppController\api\entidade;


class ControllerAdminCartoes extends ControllerEntidade
{
    public function __construct($container = false)
    {
        parent::__construct($container);
        $this->model_adm_cartoes->setMsgNaoEncontrado('Nenhuma administradora encontrada');
    }

    public function listar()
    {
        $this->setMethodsAceitos('GET');
        $this->setOutputJson($this->model_adm_cartoes->setPaginacao($this->getAllParams())->getAdminsCartoes());
    }

    public function buscar()
    {
        $this->setMethodsAceitos('GET');
        $adm = $this->getParamSend('adm', true)['adm'];
        $retorno = is_numeric($adm) ? $this->model_adm_cartoes->getAdminCartoes($adm) : $this->model_adm_cartoes->getAdminCartoesNome($adm);
        $this->setOutputJson($retorno);
    }
}