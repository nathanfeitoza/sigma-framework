<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 12/03/19
 * Time: 14:27
 */
use AppCore\Genericos;

$themeDir = function($container) {
    return Genericos::getTemaDir();
};
$this->setContainer('themeDir',$themeDir, 1);