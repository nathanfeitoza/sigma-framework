<?php

/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 14/03/19
 * Time: 14:24
 */
namespace AppModel\entidade;

class Cliente extends Entidade
{
    const campos_retornar = ['ID','NOME','FANTASIA','CNPJ','CEP','LOGRADOURO','BAIRRO','NUMERO','CIDADE', 'UF','TELEFONE1','EMAIL','CONTATO'];

    public function getCliente($id)
    {
        return $this->setCamposRetornar(self::campos_retornar)->getEntidade($id, self::view_clientes);
    }

    public function getClienteNome($nome)
    {
        return $this->setCamposRetornar(self::campos_retornar)->getEntidadeNome($nome, self::view_clientes);
    }

    public function getClientes()
    {
        return $this->setCamposRetornar(self::campos_retornar)->getEntidades(self::view_clientes);
    }

    public function getClienteCpfCnpj($cliente_cpf_cnpj)
    {
        return $this->getEntidadeCnpj($cliente_cpf_cnpj, self::view_clientes);
    }
}