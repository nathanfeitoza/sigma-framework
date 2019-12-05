<?php
/**
 * Created by Nathan Feitoza (Sigma).
 * Date: 10/25/2019
 * Time: 12:35
 */
namespace AppModel\testar;

use AppCore\Genericos;
use AppCore\Model;

class Teste extends Model
{

    public function adicionar($adicionar)
    {
        $pegar = ['id','nome','email'];

        return $this->inserir_bd1_teste(
            $this->filtrarCamposCrud($pegar, $adicionar)
        );
    }

    public function atualizar($atualizar)
    {
        $pegar = ['id','nome','email'];
        
        Genericos::verificarCampoPreenchido($atualizar, "id", true);

        return $this->atualizar_bd1_teste(
            $this->filtrarCamposCrud($pegar, $atualizar),
            function($where) use ($atualizar) {
                return $where->where("id", "=", $atualizar["id"]);
            }
        );
    }

    public function deletar($id)
    {
        return $this->deletar_bd1_teste(
            function($where) use ($id) {
                return $where->where("id", "=", $id);
            }
        );
    }

    public function listar($query = false)
    {
        return $this->getDadosPaginadosGenerico("teste", false, function($where) use ($query) {
            return $this->whereOfQuery($query, $where);
        });
    }
        
}
