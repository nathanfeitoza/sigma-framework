<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 21/03/19
 * Time: 11:55
 */

namespace AppModel\arquivo;


use AppCore\errors\AppException;
use AppCore\Genericos;
use AppCore\Model;
use Slim\Http\Stream;

class Arquivo extends Model
{
    /**
     * Objetivo: Método para forçar o download de algum arquivo
     * Recebe: o caminho criptografado do arquivo a ser baixado
     * Retorna: o download do arquivo
     * Autor: Nathan Feitoza
     * Data: 28/03/19 13:41
     * Nome Método: getDownloadArquivo
     *
     * @param $arquivo
     * @return bool|mixed|string
     * @throws AppException
     * @autor Nathan Feitoza
     */
    public function getDownloadArquivo($arquivo)
    {
        $arquivo = str_replace(' ','+',$arquivo);
        $arquivo = Genericos::encriptarDecriptar('decrypt', $arquivo, Genericos::getChaveCriptografiaZip());

        if(!file_exists($arquivo)) throw new AppException("Arquivo não encontrado",404);

        return $arquivo;
    }
}