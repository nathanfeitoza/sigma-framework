<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 14/03/19
 * Time: 09:31
 */
namespace AppCore;

use AppCore\errors\AppException;
use ReflectionClass;
use Slim\Csrf\Guard;

trait ControllerModelTrait
{
    protected $modelLoad = [];

    public final function event()
    {
        return new Event();
    }

    public final function engine()
    {
        return new Engine();
    }

    private final function getLoadedModel($model)
    {
        if (array_key_exists(strtolower($model),$this->modelLoad)) {
            $model = $this->modelLoad[$model];
            $class = $model[0];
            $constructor = $model[1];
            $invoke = $model[2];

            if ($constructor != false) {
                $constructor = is_array($constructor) ? $constructor : [$constructor];
                $reflected_class = new ReflectionClass($class);
                $class = $reflected_class->newInstanceArgs($constructor);
            } else {
                $class = new $class;
            }

            if ($invoke != false) {
                $invoke = is_array($invoke) ? $invoke : [$invoke];
                call_user_func_array($class, $invoke);
            }

            return new $class;
        }

        return false;
    }

    protected final function loadModel(
        $model, 
        $constructor = false, 
        $invoke = false
    ) {
        if (!$this->getLoadedModel($model)) {
            $modelLoad = Genericos::loadModelGeneric($model, 2);
            $this->modelLoad[strtolower($modelLoad[0])] = [$modelLoad[1], $constructor, $invoke];
        }
    }

    /**
     * @param mixed $slimGuard
     */
    protected final function getSlimGuard()
    {
        if (!isset($_SESSION)) session_start();
        $slimGuard = new Guard();
        $slimGuard->setPersistentTokenMode(true);
        $slimGuard->validateStorage();
        return $slimGuard;
    }

    public function __get($name)
    {
        preg_match('/\Amodel_/', $name, $checkModel);
        
        if (count($checkModel) != 0) {
            $name = explode('_',$name);
            array_shift($name);
            $name = implode('_',$name);
            $getModel = $this->getLoadedModel($name);

            if (!is_bool($getModel)) return $getModel;
            else throw new AppException('Model '.$name.' não localizado ou não carregado', 1005, 404);
        }
    }
}