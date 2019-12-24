<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 14/03/19
 * Time: 10:01
 */

namespace AppCore;

use AppCore\errors\AppException;
use \Slim\App;


class Kernel extends Controller
{
    CONST METHOD_MIDDLEWARES = 'middleware';

    public function run($callable = false)
    {
        $engine = new Engine();
        $engine->initContainers();
        $callable = !$callable ? Kernel::class.':controller' : $callable;
        $slim = new App($engine->getContainer());
        $slim = $this->addMidllewares($slim);

        $slim->map(['*'],'[/{params:.*}]', $callable)->setOutputBuffering(false);

        $slim->run();
    }

    private function addMidllewares(App $slim)
    {
        $argsRequest = $_SERVER['REQUEST_URI'];
        preg_match('/^\/api\/{1}/', $argsRequest, $isApi);
        $isApi = count($isApi) != 0;

        if (strlen($argsRequest) > 1 && Configuracoes::get('USANDO_HISTORY_JS') && !$isApi) {
            $verificarSeTemNoTema = Genericos::getTemaDir().DIRECTORY_SEPARATOR.$argsRequest;
            if (file_exists($verificarSeTemNoTema)) {
                $extensoes_ignorar = ['twig','html'];
                $info = finfo_open(FILEINFO_MIME_TYPE);     
                $mime_type = finfo_file($info, $verificarSeTemNoTema);
                $extensao = pathinfo($verificarSeTemNoTema,PATHINFO_EXTENSION);
                
                switch($extensao) {
                    case 'css':
                        $mime_type = 'text/css';
                    break;
                    case 'js':
                        $mime_type = 'application/javascript';
                    default:
                    break;
                }
                if (!in_array($extensao, $extensoes_ignorar)) {
                    header('Content-Type: ' . $mime_type);
                    echo file_get_contents($verificarSeTemNoTema);
                    exit;
                }
            }
        }

        $removerArgs = preg_replace('/index.php/i', '', $_SERVER['PHP_SELF']);
        
        $argsRequest = preg_replace('/\?(.*)?/', '', $argsRequest);

        if ($removerArgs != '/') {
            $argsRequest = str_replace($removerArgs, '', $argsRequest);
        }
        
        $argsRequest = explode('/',$argsRequest);
        $argsRequest = array_values(array_filter($argsRequest, function($valor) {
            return !empty($valor);
        }));

        $classe = $this->getClassMethodArguments($argsRequest);
        $classe = $classe[0];

        if (class_exists($classe)) {
            $classe = new $classe;
            
            if (method_exists($classe, self::METHOD_MIDDLEWARES)) {
                
                $metodo = self::METHOD_MIDDLEWARES;
                $middlewares = $classe->$metodo();
                
                $middlewares = is_array($middlewares) ? $middlewares : [$middlewares];

                foreach ($middlewares as $indexMidlleware => $middlewareInstance) {
                    $slim->add( $middlewareInstance );
                }

            }
        }

        return $slim;
    }

    private function getClassMethodArguments($args)
    {
        $rotaIndex = ['/','index'];
        $namespace = 'AppController\\';
        $namespaceApi = $namespace.'api\\';
        $namespaceUi = $namespace.'ui\\';

        $countArgs = count($args);
        $isApi = false;
        
        if (isset($args[0])) $isApi = strtolower($args[0]) == 'api';

        $isExtensao = preg_grep( "/extensao/i" , $args);
        
        if (count($isExtensao) > 0) {
            $extensao = array_keys($isExtensao)[0];
            unset($args[$extensao]);
            $args = array_values($args);

            $namespaceApi .= 'extensao\\';
            $namespaceUi .= 'extensao\\';
        }

        $namespaceUsar = $isApi ? $namespaceApi : $namespaceUi;

        if ($isApi) {
            unset($args[0]);
            $args = array_values($args);
        }

        if (count($args) > 1) {
            $namespaceUsar .= $args[0].'\\';
            $classe = isset($args[1]) ? $args[1] : 'Index';
            $method = isset($args[2]) ? $args[2] : 'index';
        } else {
            $namespaceUsar .= 'index\\';
            $classe = 'Index';
            $method = isset($args[0]) ? $args[0] : 'index';
        }

        if (!$isApi && Configuracoes::get('USANDO_HISTORY_JS')) {
            $namespaceUsar = $namespaceUi.'index\\';
            $classe = 'Index';
            $method = 'index';
        }

        $classPre = $namespaceUsar.Configuracoes::get('CONTROLLER');
        $classe = $classPre.Genericos::convertClassMethod($classe, 1);

        return [$classe, $method];
    }

    public function controller($request, $response, $args)
    {
        header('Access-Control-Allow-Methods: PUT, POST, GET, DELETE, OPTIONS');
        if ($request->getMethod() == 'OPTIONS') {
            header('Access-Control-Allow-Origin: *');
            header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
            return true;
        }

        $this->setArgs($args);
        $args = $this->getArgs();

        $isApi = strtolower(@$args[0]) == 'api';

        $classeMetodo = $classe = $this->getClassMethodArguments($args);


        $classPre = $classeMetodo[0];
        $method = $classeMetodo[1];
        $rotaIndex = ['/','index'];


        $request->getQueryParams = function() use($request) {
            $query = $request->getUri()->getQuery();
            parse_str($query, $retorno);
            return $retorno;
        };

        $this->setRequest($request);
        $this->setResponse($response);
        $metodoHttpPadrao = false;

        $method = strlen($method) == 0 ? 'index' : $method;

        $classe = $classe[0];

        $method = in_array(strtolower($method), $rotaIndex) ? 'index' : $method;

        try {
            $params = $isApi ? array_slice($args, 3) : array_slice($args, 2);
            $this->setParams($params);

            return $this->exec($classe, $method, $metodoHttpPadrao);

        } catch (AppException $e) {
            $message = method_exists($e, 'getMsgUsuario') 
                ? $e->getMsgUsuario() 
                : $e->getMessage();

            $code = $e->getCode();
            $codeHttp = method_exists($e, 'getCodeHttp') ? $e->getCodeHttp() : 500;
            
            $this->setCodHttp($codeHttp);
            
            if ($isApi) {
                $this->setOutputJson($message, true, false, $code);

            } else {
                $this->setOutputPage('error', ['msg' => $message, 'cod' => $code]);
            }

            return $this->getOutput();
        }

    }

    private function exec(
        $class, 
        $method, 
        $metodosAceitosHttp = false
    ) {
        
        $method_old = $method;
        $namespace = explode('\\',$class);
        $classViraMethod = str_replace(Configuracoes::get('CONTROLLER'),'',end($namespace));
        array_pop($namespace);
        $isApi = strtolower(@$namespace[1]) == 'api';
        $namespace = implode('\\', $namespace);
        $classIndex = $namespace.'\\'.Configuracoes::get('CONTROLLER').'Index';
        $params = $this->getParams();

        if (!class_exists($class)) {
            if (method_exists($classIndex, $classViraMethod)) {
                $class = $classIndex;
                $method = $classViraMethod;
                $offset = $isApi ? 2 : 1;
                $params = array_slice($this->getArgs(), $offset);
            } else {
                throw new AppException('Classe ' . $class . ' não existe', 1000, 403);
            }
        }

        $methodComoClass = $namespace.'\\'.Configuracoes::get('CONTROLLER').Genericos::convertClassMethod($method, 1);
        $method = Genericos::convertClassMethod($method, 2);

        $class = new $class($this->getContainer());

        $msgNotFound = 'Método '.$method.' inexistente';

        if (!method_exists($class, $method)) {
            $erro = true;

            if (class_exists($methodComoClass)) {
                $class = new $methodComoClass($this->getContainer());
                $method = 'index';

                if (method_exists($class, $method)) $erro = false;

            } else {
                $method_old = strtolower($method_old);
                $namespace = str_replace('index','', $namespace);
                $namespace .= $method_old.'\\';
                $classe = $namespace.Configuracoes::get('CONTROLLER').'Index';

                if (class_exists($classe)) {
                    $class = new $classe($this->getContainer());
                    $method = 'index';

                    if (method_exists($class, $method)) $erro = false;
                }
            }

            if ($erro) throw new AppException($msgNotFound, 1001, 403);
        }

        $reflection = new \ReflectionMethod($class, $method);

        if (!$reflection->isPublic()) {
            throw new AppException($msgNotFound, 1006, 403);
        }

        $paramsMethod = $reflection->getParameters();

        if (count($paramsMethod) != 0) {
            foreach ($paramsMethod as $paramM) {
                if (!$paramM->isOptional()) throw new AppException('O método '.$method.' acessado é destinado para eventos, portanto não é possível acessá-lo via HTTP',1031, 404,'Rota não encontrada');
            }
        }

        $naoAcessar = ['setRequest','setResponse','setArgs',
            'setMethodsAceitos','setTipoAcessoApi', self::METHOD_MIDDLEWARES];

        $checkNaoAcessar = preg_grep('/'.$method.'/i', $naoAcessar);

        if (count($checkNaoAcessar) != 0) {
            throw new AppException($msgNotFound, 1013);
        }

        $class->setRequest($this->getRequest());
        $class->setResponse($this->getResponse());
        $class->setArgs($this->getArgs());
        $class->setParams($params);

        if ($metodosAceitosHttp != false) $class->setMethodsAceitos($metodosAceitosHttp);

        $class->setTipoAcessoApi($this->tipoAcessoApi);
        
        $class->$method();
        
        if ($class->getAcessoExterno() && $isApi) {
            header('Access-Control-Allow-Origin: *');
            header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
        }

        $this->event()->trigger('logdb.salvar',['access']);

        return $class->getOutput();
    }

}