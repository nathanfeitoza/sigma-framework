<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 15/03/19
 * Time: 09:30
 */

namespace AppModel\entidade;


use AppCore\Genericos;

class Empresa extends Entidade
{
    /**
     * Objetivo: Retornar os dados referentes a SMTP da empresa em execução do sistema
     * Retorna: Dados referentes ao SMTP da empresa
     * Autor: Nathan Feitoza
     * Nome Método: getDadosSMTP
     *
     * @return mixed
     * @throws \Exception
     * @autor Nathan Feitoza
     */
    public function getDadosSMTP()
    {
        $retornar = $this->db()->tabela(Genericos::getSchema().'view_smtp_empresa')
            ->campos(['email','host','login','senha','porta','auth'])
            ->buildQuery('select');

        return isset($retornar[0]) ? $retornar[0] : $retornar;
    }

    /**
     * Objetivo: Retornar os dados referentes a empresa em execução do sistema, como cnpj, nome, fantasia
     * Recebe: Campos que retornarão, opcional
     * Retorna: Dados da empresa executando o sistema
     * Autor: Nathan Feitoza
     * Nome Método: getEmpresa
     *
     * @param bool $campos_retornar
     * @return mixed
     * @throws \Exception
     * @autor Nathan Feitoza
     */
    public function getEmpresa()
    {
        $dados = $this->setMsgNaoEncontrado('Empresa não configurada')->db()
            ->tabela(Genericos::getSchema().self::view_empresa)
            ->buildQuery('select');

        return isset($dados[0]) ? $dados[0] : $dados;
    }

    /**
     * Objetivo: Padronizar a impressão das contas correntes
     * Recebe: O objeto da contas
     * Retorna: As contas em um formato padronizado
     * Autor: Nathan Feitoza
     * Nome Método: getContaCorrentePadronizada
     *
     * @param $contas
     * @return mixed
     * @autor Nathan Feitoza
     */
    protected function getContaCorrentePadronizada($contas)
    {
        if (isset($contas[0]->BANCO)) {

            foreach ($contas as $chave => $item) {
                $pasta_imgs_bancos = 'img/boletos/bancos/';
                $img1 = $pasta_imgs_bancos . $item->BANCO . '.png';
                $img2 = $pasta_imgs_bancos . $item->BANCO . '.jpg';
                $img3 = $pasta_imgs_bancos . $item->BANCO . '.jpeg';
                $imagem = null;

                if (file_exists(Genericos::getTemaDir() . '/' . $img1)) {
                    $imagem = $img1;
                } else if (file_exists(Genericos::getTemaDir() . '/' . $img2)) {
                    $imagem = $img2;
                } else if (file_exists(Genericos::getTemaDir() . '/' . $img3)) {
                    $imagem = $img3;
                }

                $item->IMG_BANCO = $imagem;
            }

        }

        return $contas;
    }

    /**
     * Objetivo: Retornar os dados das contas-correntes cadastradas da empresa
     * Recebe:
     * Retorna: Os dados referentes as contas-correntes da empresa
     * Autor: Nathan Feitoza
     * Nome Método: getContasCorrentesEmpresa
     *
     * @return bool
     * @autor Nathan Feitoza
     */
    public function getContasCorrentesEmpresa()
    {
        $contas = $this->db()->tabela('view_conta_corrente')->buildQuery('select');

        if (is_int($contas) || is_bool($contas)) return false;

        return $this->getContaCorrentePadronizada($contas);
    }

    /**
     * Objetivo: Recuperar uma conta corrente da empresa
     * Recebe: Id da conta a ser recuperada
     * Retorna: Dados da conta recuperada
     * Autor: Nathan Feitoza
     * Nome Método: getContaCorrenteEmpresa
     *
     * @param $conta_id
     * @return bool
     * @autor Nathan Feitoza
     */
    public function getContaCorrenteEmpresa($conta_id)
    {
        $conta = $this->db()
            ->tabela('view_conta_corrente')
            ->where('id','=',$conta_id)
            ->buildQuery('select');

        if (is_int($conta) || is_bool($conta)) {
            return false;
        }

        return $this->getContaCorrentePadronizada($conta);
    }

    /**
     * Objetivo: Retornar as filiais da empresa
     * Recebe:
     * Retorna: As filiais da empresa
     * Autor: Nathan Feitoza
     * Nome Método: getFiliais
     *
     * @return mixed
     * @autor Nathan Feitoza
     */
    public function getFiliais()
    {
        return $this->db()
            ->tabela('view_filiais')
            ->orderBy('filial','ASC')
            ->buildQuery('select');
    }

    /**
     * Objetivo: Retornar uma filial através de seu id
     * Recebe:
     * Retorna: A filial selecionada
     * Autor: Nathan Feitoza
     * Nome Método: getFilial
     *
     * @param $filial_id
     * @return mixed
     * @autor Nathan Feitoza
     */
    public function getFilial($filial_id)
    {
        return $this->db()
            ->tabela('view_filiais')
            ->where('id','=', $filial_id)
            ->orderBy('filial','ASC')
            ->buildQuery('select');
    }

    /**
     * Objetivo: Recuperar uma filial, ou várias, através de seu nome
     * Recebe:
     * Retorna: A(s) filial(is) recuperada(s)
     * Autor: Nathan Feitoza
     * Nome Método: getFilialNome
     *
     * @param $filial_nome
     * @return mixed
     * @autor Nathan Feitoza
     */
    public function getFilialNome($filial_nome)
    {
        return $this->db()
            ->tabela('view_filiais')
            ->where('nome','=', $filial_nome)
            ->orderBy('filial','ASC')
            ->buildQuery('select');
    }

    /**
     * Objetivo: Recuperar os setores da filiais
     * Recebe:
     * Retorna: Os setores da filiais
     * Autor: Nathan Feitoza
     * Nome Método: getFiliaisSetores
     *
     * @return mixed
     * @autor Nathan Feitoza
     */
    public function getFiliaisSetores()
    {
        return $this->db()->tabela('view_filiais_setores')->buildQuery('select');
    }

    /**
     * Objetivo: Buscar os setores de uma filial, ou um setor especifico de uma filial
     * Recebe:
     * Retorna: Os dados dos setores, ou setor, retornado da filial
     * Autor: Nathan Feitoza
     * Nome Método: getFilialSetores
     *
     * @param $filial
     * @param bool $setor
     * @return mixed
     * @autor Nathan Feitoza
     */
    public function getFilialSetores($filial, $setor=false)
    {
        $buscar = $this->db()
            ->tabela('view_filiais_setores')
            ->where('filial', '=', $filial);

        if ($setor != false)  {
            $buscar->whereAnd('setor','=',$setor);
        }

        $buscar = $buscar->buildQuery('select');

        return $buscar;
    }
}