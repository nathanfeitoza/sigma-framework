<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 12/03/19
 * Time: 14:26
 */

use AppCore\Configuracoes;
use AppCore\Genericos;

$errorHandler = function ($c) use ($este) {
    return function ($request, $response, $e) use ($c, $este) {
        \AppCore\errors\AppException::gerarLog($e);
        $path = $request->getUri()->getPath();
        $pathEx = explode('/',$path);
        $isApi = strtolower($pathEx[1]) == 'api'; //0
        $resposta = $response->withStatus(500);
        $isDebug = Configuracoes::get('DEBUG');
        
        if ($isApi) {
            $mensagem = $e->getMessage();
            
            if (!$isDebug) {
                if($e instanceof PDOException) {
                    $mensagem = 'Houve um erro ao acessar o banco de dados.';
                }
            }

            return $resposta->withHeader('Content-Type', 'application/json')
                ->withBody(
                    Genericos::setStream( 
                        $c['view']->toJson($c['view']
                            ->msgJsonSys(
                                $mensagem, 
                                false,
                                $e->getCode()
                            )
                        ) 
                    )
                );
        }

        return $c['view']->toPage(
            $response, 
            'error', 
            ['msg' => $e->getMessage(), 'code' => $e->getCode()]
        );
    };
};

$this->setContainer('errorHandler',$errorHandler, 5);
$this->setContainer('phpErrorHandler', $errorHandler, 6);