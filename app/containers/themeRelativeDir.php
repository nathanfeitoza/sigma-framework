<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 12/03/19
 * Time: 14:28
 */
use AppCore\Genericos;

$themeRelativeDir = function($container) {
    return Genericos::getTemaDir(true);
};

$this->setContainer('themeRelativeDir',$themeRelativeDir, 4);