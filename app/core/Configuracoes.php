<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 12/03/19
 * Time: 13:51
 */

namespace AppCore;

class Configuracoes 
{
    public static function get($configuracao)
    {
        $configuracao = strtoupper($configuracao);
        return (isset($GLOBALS['config'][$configuracao])) ? $GLOBALS['config'][$configuracao] : null;
    }

    public static function set($configuracao, $valor)
    {
        $configuracao = strtoupper($configuracao);
        if (!is_null(self::get($configuracao))) {
            $GLOBALS['config'][$configuracao] = $valor;
        }
    }
}