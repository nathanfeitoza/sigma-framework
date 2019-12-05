<?php
/**
 * Created by PhpStorm.
 * User: nathan
 * Date: 04/09/19
 * Time: 21:17
 */

namespace Middleware;

use AppCore\Configuracoes;

class TesteMiddlware
{
    /**
     * Example middleware invokable class
     *
     * @param  \Psr\Http\Message\ServerRequestInterface $request  PSR7 request
     * @param  \Psr\Http\Message\ResponseInterface      $response PSR7 response
     * @param  callable                                 $next     Next middleware
     *
     * @return \Psr\Http\Message\ResponseInterface
     */
    public function __invoke($request, $response, $next)
    {
        //$response->getBody()->write('BEFORE');
        //Configuracoes::set('TEMA', 'fdsfdsfds');
        $response = $next($request, $response);
        //$response->getBody()->write('AFTER');

        return $response;
    }

}