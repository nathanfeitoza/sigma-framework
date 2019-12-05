<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 20/03/19
 * Time: 14:17
 */

namespace AppModel\teste;


use AppCore\Genericos;
use AppCore\Model;

class Teste2 extends Model
{
    public function getProduto($id)
    {
        return $this->db()
            ->tabela(Genericos::getSchema().'produto')
            ->where('id','=', $id)
            ->buildQuery('select');
    }
}