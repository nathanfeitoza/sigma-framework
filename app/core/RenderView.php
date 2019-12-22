<?php

/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 09/03/19
 * Time: 20:55
 */

namespace AppCore;

use AppCore\errors\AppException;

class RenderView
{
    protected  $container;

    public function __construct($container)
    {
        $this->container = $container;
    }

    public function msgJsonSys($msg, $status = true, $codReturn = 200)
    {
        return [
            'status' => $status ? 'success' : 'error',
            'data' => $msg,
            'codStatus' => $codReturn
        ];
    }

    public function toJson(array $data)
    {
        return json_encode($data, JSON_PRETTY_PRINT);
    }

    public function toPage($response, $pagina, $dados)
    {
        $dados = is_array($dados) ? $dados : [];

        $dadosDefault = [
            'pagina' => $pagina,
            'baseTema' => $this->container->themeRelativeDir,
            'rootDir' => $this->container->rootDir,
            'themeDir' => $this->container->themeDir,
            'nome_schema_atual' => Genericos::getSchema(true),
            'schema_atual_bd' => Genericos::getSchema(),
            'usuario_logado' => Genericos::getUsuarioSCLogado(false, false, 'SEM USUARIO LOGADO')
        ];

        $dados = array_merge($dados, $dadosDefault);

        $tema = $this->container->themeDir;
        $pagina .= '.twig';
        $paginaLoad = $tema.'/'.$pagina;

        if (!file_exists($paginaLoad)) {
            echo $tema;
            throw new AppException('Pagina '.$pagina.' não encontrada no tema', 1004, 404);
        }

        return $this->container->twig->render($response, $pagina, $dados);
    }
}