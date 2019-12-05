<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 18/03/19
 * Time: 10:01
 */

namespace AppModel\entidade;


class Fornecedor extends Entidade
{
    public function getFornecedores()
    {
        return $this->getEntidades(self::view_fornecedores);
    }

    public function getFornecedor($fornecedor_id)
    {
        return $this->getEntidade($fornecedor_id, self::view_fornecedores);
    }

    public function getFornecedorNome($fornecedor_nome)
    {
        return $this->getEntidadeNome($fornecedor_nome, self::view_fornecedores);
    }

    public function getFornecedorCnpj($fornecedor_cnpj)
    {
        return $this->getEntidadeCnpj($fornecedor_cnpj, self::view_fornecedores);
    }
}