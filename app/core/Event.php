<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 14/03/19
 * Time: 08:26
 */

namespace AppCore;


use AppCore\errors\AppException;

class Event
{
    private $pastaEvents = '';

    public function __construct()
    {
        $this->pastaEvents = Configuracoes::get('ROOTDIR').'app/events/';
    }

    /**
     * Objetivo:
     * Recebe:
     * Retorna:
     * Autor: Nathan Feitoza
     * Nome Método: stringJsonEvent
     *
     * @param $codigo
     * @param $trigger
     * @param $acao
     * @param $tipo -> 1 model, 2 controller
     * @return string
     * @autor Nathan Feitoza
     */
    protected function stringJsonEvent(
        $codigo, 
        $trigger, 
        $acao, 
        $method
    ) {
        return json_encode( [
            'codigo' => $codigo,
            'trigger' => $trigger,
            'acao' => str_replace('\\','/',$acao),
            'method' => $method
        ] );
    }

    public function getEvent($trigger)
    {
        $event = $this->pastaEvents.$trigger.'.event';

        if (file_exists($event)) {
            $dadosEvent = file_get_contents($event);
            $dadosEvent = Genericos::jsonDecode(
                $dadosEvent, 
                'O evento '.$trigger.' informado não contém um arquivo de evento válido'
            );

            return $dadosEvent;
        }

        return false;
    }

    public function addEvent(
        $codigo, 
        $trigger, 
        $acao
    ) {

        if (php_sapi_name() == "cli") return;

        if (!$this->getEvent($codigo.'.'.$trigger)) {
            $namespace = 'AppController\\';

            $acaoAnalyse = explode('/',$acao);

            if (count($acaoAnalyse) <= 2) {
                 throw new AppException(
                     'Acão '.$acao.' do evento '.$codigo.' passada não é válida', 
                     1032
                );
            }

            $namespace2 = $acaoAnalyse[1];

            $classe = $acaoAnalyse[2];
            $classe = Genericos::convertClassMethod($classe, 1);

            $metodo = isset($acaoAnalyse[3]) ? $acaoAnalyse[3] : 'index';
            $metodo = Genericos::convertClassMethod($metodo, 2);

            $classe = $namespace . $acaoAnalyse[0]
                .'\\' . $namespace2 . '\\'
                . Configuracoes::get('CONTROLLER') . $classe;

            if (!class_exists($classe)) {
                throw new AppException(
                    'O controller da ação ' 
                    . $acao . ' para o evento ' 
                    . $codigo . ' não é válida, pois não existe', 
                    1033
                );
            }
            
            if (!method_exists(new $classe, $metodo)) {
                 throw new AppException(
                    'O método '
                    . $metodo
                    . ' do evento ' . $codigo . ' não existe', 
                    1034
                );
            }

            $eventName = $this->pastaEvents.$codigo.'.'.$trigger.'.event';
            $eventSave = $this->stringJsonEvent(
                $codigo, 
                $trigger, 
                $classe, 
                $metodo
            ); 

            return file_put_contents($eventName, $eventSave);
        }
    }

    public function trigger($trigger, $arguments = [])
    {
        $evento = $this->getEvent($trigger);
        $arguments = is_array($arguments) ? $arguments : [$arguments];

        if ($evento != false) {
            $classe = $evento->acao;
            $classe = str_replace('/', '\\', $classe);
            $metodo = $evento->method;

            try {
                $classAcation = new $classe;
                $execute = $classAcation->$metodo($arguments);
            } catch(AppException $e){}

        }
    }
}