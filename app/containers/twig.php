<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 12/03/19
 * Time: 14:26
 */

use AppCore\Configuracoes;
use Slim\Views\Twig;
use Slim\Views\TwigExtension;
use AppCore\Genericos;

$twig = function($container) use ($este) {
    $view = new Twig(Genericos::getTemaDir(), [
        'cache' => false
    ]);

    $baseDir = Configuracoes::get('ROOTDIR');
    $view->addExtension(new TwigExtension($container['router'], $baseDir));

    $erro = function($msg, $code) {
        new \AppCore\errors\AppException($msg, $code, 500);
        return ['erro' => $msg, 'cod' => $code];
    };

    $checkError = function($var) {
        $var = is_array($var) ? $var : [$var];
        return array_key_exists('erro',$var) and array_key_exists('cod',$var);
    };

    $loadModelMethod = new \Twig_SimpleFunction('loadModelMethod', function ($model,$method, $args = []) use ($este, $erro){
        try {
            $args = is_array($args) ? $args : [$args];
            $modelCarregar = Genericos::loadModelGeneric($model);

            if(!method_exists($modelCarregar, $method)) {
                return $erro('Método '.$method.' não encontrado para o model: '.$model, 1014);
            }

            $objReflection = new ReflectionMethod($modelCarregar, $method);

            if(!$objReflection->isPublic()) {
                return $erro('Método '.$method.' do model '.$model.' não é público', 1015);
            }

            $paramsMethod = $objReflection->getParameters();

            foreach ($paramsMethod as $param) {
                if(!$param->isOptional() and count($paramsMethod) != count($args)) {
                    return $erro('Número de argumentos inválido para o método '.$method.' do model '.$model, 1016);
                }
            }


            return call_user_func_array([new $modelCarregar, $method], $args);

        } catch(\AppCore\errors\AppException $e) {
            return $erro($e->getMessage(), $e->getCode());
        }
    });

    $var_dump = new \Twig_SimpleFunction('var_dump', function($dado){
        return var_dump($dado);
    });

    /**
     * Abaixo estão as funções e filtros criados para serem usados dentro dos templates twig
     */
    $is_arrayObject = new \Twig_SimpleFilter('is_arrayObject', function ($dado) {
        if (is_array($dado)) {
            return 1;
        } else if (is_object($dado)) {
            return 2;
        } else {
            return 0;
        }
    });

    $cast_to_array = new \Twig_SimpleFilter('cast_to_array', function ($stdClassObject) {
        return (array)$stdClassObject;
    });

    $count_arr = new \Twig_SimpleFilter('count_arr', function ($array) {
        return count($array);
    });

    $f_case = new \Twig_SimpleFilter('f_case', function ($str) {
        return ucfirst($str);
    });

    $strtolower = new \Twig_SimpleFunction('strtolower', function ($str) {
        return strtolower($str);
    });

    $print_array = new \Twig_SimpleFilter('print_array', function ($str) {
        return print_r($str, true);
    });

    $strlen = new \Twig_SimpleFilter('strlen', function ($str) {
        if (is_string($str) || is_numeric($str)) {
            return strlen($str);
        } else {
            return 0;
        }
    });

    $in_array = new \Twig_SimpleFunction('in_array', function($needle, $haystack){
        return in_array($needle, $haystack);
    });

    $getQueryParam = new \Twig_SimpleFunction('getQueryParam', function($parametro) use ($container) {
        $request = $container['request'];
        $params = $request->getQueryParams();
        $retorno = -1;
        if (isset($params[$parametro])) {
            $retorno = $params[$parametro];
        }
        return $retorno;
    });

    $contain = new \Twig_SimpleFunction('contain', function ($str, $str2) {
        return strpos(strtolower($str2), strtolower($str));
    });

    $is_int = new \Twig_SimpleFunction('is_int', function ($str) {
        return is_int($str);
    });

    $file_exist = new \Twig_SimpleFunction('file_exist', function ($str) {
        return file_exists($str);
    });

    $montar_options = new \Twig_SimpleFunction('montar_options', function ($dados, $index_buscar, $value, $mostrar, $separador_mostrar = ' - ') use ($checkError){
        $dados = (array) $dados;
        $arrMem = '';

        if($checkError($dados)) {
            return '';
        }

        if($index_buscar != false) {
            foreach ($index_buscar as $i => $niv) {
                if ($i == 0) {
                    if (isset($dados[$niv])) {
                        $arrMem = (array)$dados[$niv];
                    } else {
                        return '';
                    }
                }

                if (is_array($arrMem) && $i != 0) {
                    if (isset($arrMem[$niv])) {
                        $arrMem = (array)$arrMem[$niv];
                    }
                }
            }
            $arrMem = [$arrMem];
        } else {
            $arrMem = $dados;
        }

        $finalRetornar = '';

        foreach($arrMem as $i => $valores) {
            $valores = (array) $valores;

            $valorUsar = isset($valores[$value]) ? $valores[$value] : '';
            $mostrarUsar = '';

            foreach($mostrar as $indexMostrar) {
                if(isset($valores[$indexMostrar])) {
                    $mostrarUsar .= $valores[$indexMostrar];
                    if(end($mostrar) != $indexMostrar) {
                        $mostrarUsar .= $separador_mostrar;
                    }
                }
            }

            $finalRetornar .= '<option role-option-select="'.$mostrarUsar.'" value="'.$valorUsar.'">'.$mostrarUsar.'</option>';
        }

        return $finalRetornar;
    });

    $gerarInputs = new Twig_SimpleFunction('gerarInputs', function (array $inputs) {
        /*
        * $inputs = array de inputs
        * Caso o indice do array de inputs for uma string, ele gerará uma div de grid
        * [0] => [0] = Tipo do input, [1] = classes do input, [2] = array com atributos do input
        * Obs: a posição [1] pode ser a label do input quando presente, dentro da posição pode-se colocar na posição 1, quando for array, os atributos ex: title, for
        * submit -> um input do tipo submit, submit-button botão com o atributo de submit
        */

        $diferenciados = ['submit-button','data','select'];
        $inputsRetornar = '';

        foreach($inputs as $i => $input) {

            $inputTipo = strtolower($input[0]);
            $inputRetorno = '';
            $inputsAtributosRetornar = '';
            $fecharFinal = false;
            $botaoSubmit = false;
            $botaoSubmit = false;
            $optionStr = false;
            $label = '';

            if(count($input) == 4) {
                $label = $input[1];
                $input[1] = $input[2];
                $input[2] = $input[3];
                unset($input[3]);
            }

            if(in_array($inputTipo, $diferenciados)) {

                if($inputTipo == $diferenciados[2]) {
                    $inputRetorno = '<select ';
                } elseif($inputTipo == $diferenciados[0]) {
                    $botaoSubmit = true;
                    $inputRetorno = '<button ';
                } else {
                    $input[1] .= ' data';
                    $inputRetorno = '<input type="text" ';
                }

            } else {
                $fecharFinal = true;
                $inputRetorno = '<input type="'.$inputTipo.'" ';
            }

            if(isset($input[1])) {
                $inputRetorno .= 'class="'.$input[1].'" ';
            }

            if(isset($input[2])) {

                foreach($input[2] as $j => $inputAtributos) {
                    $j = strtolower($j);

                    if($j == 'option') {
                        if(!is_array($inputAtributos)) return -2;
                        $optionStr = '';
                        foreach($inputAtributos as $k => $option) {
                            $atributos = '';

                            if(is_array($option)) {
                                foreach($option as $l => $atributoOption) {
                                    $atributos .= $l.'="'.$atributoOption.'"';
                                }
                                $option = $k;
                            }

                            $optionStr .= '<option '.$atributos.' >'. $option .'</option>';
                        }
                    } else {
                        if(strtolower($j) == 'titulo') {
                            $tituloBotao = $inputAtributos;
                        } else {
                            $inputsAtributosRetornar .= $j.' = "'.$inputAtributos.'" ';
                        }
                    }
                }
            }

            if($fecharFinal != false) {
                $inputRetorno .= $inputsAtributosRetornar.' />';
            }

            if($optionStr != false) {
                $inputRetorno .= $inputsAtributosRetornar.' >'.$optionStr.'</select>';
            }

            if($botaoSubmit != false) {
                $tituloBtn = isset($tituloBotao) ? $tituloBotao : 'Sem Titulo';
                $inputRetorno .= '>'.$tituloBtn.'</button>';
            }

            $verificarLabel = is_string($label) ? strlen($label) : count($label);

            if($verificarLabel > 0 && $botaoSubmit == false) {
                $atributosLabel = '';

                if(is_array($label)) {
                    if(isset($label[1])) {
                        foreach($label[1] as $m => $labelAtributo) {
                            $atributosLabel .= $m. '="'.$labelAtributo.'"';
                        }
                    }
                    $label = $label[0];
                }

                $inputRetorno = '<label '.$atributosLabel.'>'.$label.'</label>'.$inputRetorno;
            }

            if(is_string($i)) {
                $inputRetorno = '<div class="'.$i.'">'.$inputRetorno.'</div>';
            }

            $inputsRetornar .= $inputRetorno;
        }

        return new \Twig_Markup( $inputsRetornar, 'UTF-8' );
    });

    $view->getEnvironment()->addFilter($cast_to_array);
    $view->getEnvironment()->addFilter($count_arr);
    $view->getEnvironment()->addFilter($f_case);
    $view->getEnvironment()->addFunction($strtolower);
    $view->getEnvironment()->addFilter($is_arrayObject);
    $view->getEnvironment()->addFilter($print_array);
    $view->getEnvironment()->addFilter($strlen);
    $view->getEnvironment()->addFunction($var_dump);
    $view->getEnvironment()->addFunction($loadModelMethod);
    $view->getEnvironment()->addFunction(new \Twig_SimpleFunction('checkError', $checkError));
    $view->getEnvironment()->addFunction($in_array);
    $view->getEnvironment()->addFunction($getQueryParam);
    $view->getEnvironment()->addFunction($contain);
    $view->getEnvironment()->addFunction($is_int);
    $view->getEnvironment()->addFunction($file_exist);
    $view->getEnvironment()->addFunction($montar_options);
    $view->getEnvironment()->addFunction($gerarInputs);

    return $view;
};
$this->setContainer('twig', $twig, 3);