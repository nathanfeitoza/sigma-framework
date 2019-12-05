<?php
/**
 * Created by PhpStorm.
 * User: nathan
 * Date: 16/03/19
 * Time: 21:22
 */

namespace AppModel\entidade;


class AdminCartoes extends Entidade
{
    public function getAdminCartoes($admin_id)
    {
        return $this->getEntidade($admin_id, self::view_administradoras_cartoes);
    }

    /**
     * Objetivo: Recupera as administradoras de cartão por nome
     * Recebe: O nome da administradora
     * Retorna: a admninistradora
     * Autor: Nathan Feitoza
     * Data: 17/03/19 00:55
     * Nome Método: getAdminCartoesNome
     *
     * @param $admin_nome
     * @return \AppCore\bd\BD|array|bool|mixed
     * @throws \AppCore\errors\AppException,
     */
    public function getAdminCartoesNome($admin_nome)
    {
        return $this->getEntidadeNome($admin_nome, self::view_administradoras_cartoes);
    }

    /**
     * Objetivo: Listar as administradoras de cartão cadastrados
     * Recebe: pagina da paginação e a quantidade por paginas
     * Retorna: as aministradoras cadastrados
     * Autor: Nathan Feitoza
     * Data: 17/03/19 00:55
     * Nome Método: getAdminsCartoes
     *
     * @return \AppCore\bd\BD|array|bool|mixed
     * @throws \AppCore\errors\AppException
     */
    public function getAdminsCartoes()
    {
        return $this->getEntidades(self::view_administradoras_cartoes);
    }
}