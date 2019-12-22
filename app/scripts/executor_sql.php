<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 29/05/19
 * Time: 11:41
 */

require 'includeParaClassScriptsCl.php';

/*
 * Como executar:
 *  1 - php executor_sql.php --arquivo=tabela-nfe-rejeicao.sql
 *  2 - Limpando a tabela: php executor_sql.php --arquivo=tabela-nfe-rejeicao.sql --limparTabela=schema_tabela.tabela_a_ser_limpa
 *  2 - Limpando a tabela com where no delete: php executor_sql.php --arquivo=tabela-nfe-rejeicao.sql --limparTabela=schema_tabela.tabela_a_ser_limpa --whereLimpar="campo = 2"
 * */

$arquivoSql = $classScript->getOpcao('arquivo');
$limparTabela = $classScript->getOpcao('limparTabela');
$whereLimpar = $classScript->getOpcao('whereLimpar');

if (!$arquivoSql) {
    $arquivoSql = $classScript->getArgumento(1);

    if (!$arquivoSql) $classScript->setErro('Não informado o arquivo sql para execução', 40401);
}

if (!file_exists($arquivoSql)) $classScript->setErro('Arquivo '.$arquivoSql.' não encontrado', 40402);

$dados = file_get_contents($arquivoSql);

$dados = explode(PHP_EOL, $dados);

$dados = array_filter($dados, function($valor) {
    if (!is_string($valor)) return true;

    return strlen($valor) > 0;
});

$objBanco = $classScript->db();
$objBanco->iniciarTransacao();

$classScript->setMensagem('Iniciei inserção: '.date('d/m/Y H:i:s'));

try {

    if ($limparTabela != false) {

        $where = ($whereLimpar != false) ? ' WHERE '.$whereLimpar : '';

        $sqlLimpar = 'DELETE FROM '.$limparTabela.$where;

        $objBanco->executarSQL($sqlLimpar);
    }

    foreach ($dados as $chave => $valor) {
        $quantidadeCaracteres = strlen($valor);
        $posicaoPontoEVirgula = strrpos($valor,';');

        if ($quantidadeCaracteres == ($posicaoPontoEVirgula + 1)) $valor = substr($valor, 0, $posicaoPontoEVirgula);

        $codificacaoString = mb_detect_encoding($valor) ;

        if (!($codificacaoString == "UTF-8" && mb_check_encoding($valor,"UTF-8"))) $valor = utf8_encode($valor);

        $objBanco->executarSQL($valor);
    }

    $objBanco->commit();
} catch (\AppCore\errors\AppException $e) {
    $objBanco->rollback();
    $classScript->setErro('Erro ao executar comandos sql. Erro: '.$e->getMessage(), $e->getCode());
} finally {
    $classScript->setMensagem('Finalizei inserção: '.date('d/m/Y H:i:s'));
}

$classScript->setMensagem('Executado com sucesso', 'verde', 'preto');