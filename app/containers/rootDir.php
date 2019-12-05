<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 12/03/19
 * Time: 14:27
 */

use AppCore\Configuracoes;

$rootDir = function($container) {
    return Configuracoes::get('ROOTDIR');
};
$this->setContainer('rootDir',$rootDir,0);