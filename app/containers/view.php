<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 12/03/19
 * Time: 14:25
 */
$view = function($container) {
    return new \AppCore\RenderView($container);
};
$this->setContainer('view',$view,2);