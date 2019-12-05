<?php

/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 09/03/19
 * Time: 20:53
 */
namespace AppController\ui\index;

use AppCore\Controller;
use Middleware\TesteMiddlware;

class ControllerIndex extends Controller
{
    public function middleware()
    {
        return [new TesteMiddlware()];
    }

    public function index()
    {
        $csrfNameKey = $this->getSlimGuard()->getTokenNameKey();
        $csrfValueKey = $this->getSlimGuard()->getTokenValueKey();
        $csrf = $this->getSlimGuard()->generateToken();
        
        $array_dados = [
            'titulo_pagina' => 'Inicio',
            'csrf_name_key' => $csrfNameKey,
            'csrf_value_key' => $csrfValueKey,
        ];

        $array_dados = array_merge($array_dados, $csrf);

        $this->setOutputPage('index', $array_dados);
    }
}