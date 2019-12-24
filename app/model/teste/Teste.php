<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 20/03/19
 * Time: 08:50
 */

namespace AppModel\teste;

use AppCore\Genericos;
use AppCore\Model;

class Teste extends Model
{
    public function adicionar($adicionar)
    {
        $pegar = ['nome','email','senha'];

        return $this->inserir_bd_teste(
            $this->filtrarCamposCrud($pegar, $adicionar)
        );
    }

    public function atualizar($atualizar)
    {
        $pegar = ['nome','email','senha','data_cad'];
        
        Genericos::verificarCampoPreenchido($atualizar, 'id', true);

        return $this->atualizar_bd_teste(
            $this->filtrarCamposCrud($pegar, $atualizar),
            function($where) use ($atualizar) {
                return $where->where('id', '=', $atualizar['id']);
            }
        );
    }

    public function deletar($id)
    {
        return $this->deletar_bd_teste(
            function($where) use ($id) {
                return $where->where('id', '=', $id);
            }
        );
    }

    public function listar($query = false)
    {
        return $this->getDadosPaginadosGenerico('teste', false, function($where) use ($query) {
            return $this->whereOfQuery($query, $where);
        });
        /*return $this->listar_bd_teste(function($where) use ($query) {
            return $this->whereOfQuery($query, $where);
        });*/
    }

    public function testar()
    {
        $this->loadModel('teste/teste2');
        $teste2 = $this->model_teste_teste2;


        $obj = $this->db();
        $obj->iniciarTransacao();

        $obj2 = $obj;
        $max = 10;
        $este = $this;


        /*for($i = 0; $i < $max; $i++) {

             $this->inserir_bd_Teste('algo','teste -> '.$i);

        }*/

        //$this->atualizar_bd_teste('algo','atualizado');

        $this->deletar_bd_teste();

        $obj->commit();

        return $obj->getLinhasAfetadas();
    }
}