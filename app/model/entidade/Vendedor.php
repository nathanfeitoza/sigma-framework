<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 15/03/19
 * Time: 10:18
 */

namespace AppModel\entidade;


class Vendedor extends Entidade
{
    /**
     * Objetivo: Listar os vendedores cadastrados
     * Recebe: pagina da paginação e a quantidade por paginas
     * Retorna: os vendedores cadastrados
     * Autor: Nathan Feitoza
     * Nome Método: getVendedores
     *
     * @param string $pagina
     * @param int $max_por_pag
     * @return array|bool|\Info\classes\BD\BuildQuery|mixed
     * @autor Nathan Feitoza
     */
    public function getVendedores()
    {
        return $this->getEntidades(self::view_vendedores);
    }

    /**
     * Objetivo: Recuperar dados de um vendedor através de seu id
     * Recebe: Id do vendedor
     * Retorna: Dados do vendedor encontrado
     * Autor: Nathan Feitoza
     * Nome Método: getVendedor
     *
     * @param $vendedor_id
     * @return mixed
     * @autor Nathan Feitoza
     */
    public function getVendedor($vendedor_id)
    {
        return $this->getEntidade($vendedor_id, self::view_vendedores);
    }

    /**
     * Objetivo: Recuperar um ou mais vendedores por nome
     * Recebe: nome do vendedor e dados referentes a paginação que são opcionais
     * Retorna: Dados do vendedor
     * Autor: Nathan Feitoza
     * Nome Método: getVendedorNome
     *
     * @param $vendedor_nome
     * @param int $pagina
     * @param int $max_por_pag
     * @return array|bool|\Info\classes\BD\BuildQuery|mixed
     * @autor Nathan Feitoza
     */
    public function getVendedorNome($vendedor_nome)
    {
        return $this->getEntidadeNome($vendedor_nome, self::view_vendedores);
    }
}