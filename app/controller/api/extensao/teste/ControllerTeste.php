<?php
/**
 * Created by PhpStorm.
 * User: nathan
 * Date: 17/03/19
 * Time: 01:30
 */

namespace AppController\api\extensao\teste;


use AppCore\Controller;

class ControllerTeste extends Controller
{
    public function index()
    {
        $this->setOutputJson('Minha primeira extensão');
    }
}