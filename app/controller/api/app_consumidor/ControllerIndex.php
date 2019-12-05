<?php

/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 09/03/19
 * Time: 20:53
 */
namespace AppController\api\app_consumidor;

use AppCore\ControllerApi;
use AppCore\errors\AppException;
use AppCore\Genericos;
use AppCore\Log;

class ControllerIndex extends ControllerApi
{
    public function __construct()
    {
        $this->ativarRequestToken();
    }
    public function index()
    {
        $this->setOutputJson('Teste pinto duro');
    }
}