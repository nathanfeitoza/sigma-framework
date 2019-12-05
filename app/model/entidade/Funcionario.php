<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 15/03/19
 * Time: 10:41
 */

namespace AppModel\entidade;


class Funcionario extends Entidade
{
    /**
     * Objetivo: Listar os vendedores cadastrados
     * Recebe: pagina da paginação e a quantidade por paginas
     * Retorna: os vendedores cadastrados
     * Autor: Nathan Feitoza
     * Nome Método: getFuncionarios
     *
     * @param string $pagina
     * @param int $max_por_pag
     * @return array|bool|\Info\classes\BD\BuildQuery|mixed
     * @autor Nathan Feitoza
     */
    public function getFuncionarios()
    {
        return $this->getEntidades(self::view_funcionarios);
    }

    /**
     * Objetivo: Recuperar dados de um funcionario através de seu id
     * Recebe: Id do funcionario
     * Retorna: Dados do funcionario encontrado
     * Autor: Nathan Feitoza
     * Nome Método: getFuncionario
     *
     * @param $funcionario_id
     * @return mixed
     * @autor Nathan Feitoza
     */
    public function getFuncionario($funcionario_id)
    {
        return $this->getEntidade($funcionario_id, self::view_funcionarios);
    }

    /**
     * Objetivo: Recuperar um ou mais funcionarios por nome
     * Recebe: nome do funcionario e dados referentes a paginação que são opcionais
     * Retorna: Dados do funcionario
     * Autor: Nathan Feitoza
     * Data: 17/03/19 01:08
     * Nome Método: getFuncionarioNome
     *
     * @param $funcionario_nome
     * @return \AppCore\bd\BD|array|bool|mixed
     * @throws \AppCore\errors\AppException
     */
    public function getFuncionarioNome($funcionario_nome)
    {
        return $this->getEntidadeNome($funcionario_nome, self::view_funcionarios);
    }
}