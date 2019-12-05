<?php

/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 10/03/19
 * Time: 19:16
 */

namespace AppModel\index;

use AppCore\Model;

class Index extends Model
{
    public function getTextInicio()
    {
        $this->event()->trigger('evento1.index.before', 'executando no model');
        return 'Meu texto inicial UI';
    }

    public function getTextInicioApi()
    {
        return 'Meu texto inicial API';
    }
}