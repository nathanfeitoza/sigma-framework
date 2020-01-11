<?php

/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 09/03/19
 * Time: 20:53
 */
namespace AppController\api\index;

use AppCore\Controller;
use AppCore\errors\AppException;
use AppCore\Genericos;
use AppCore\Log;

class ControllerIndex extends Controller
{
    public function index()
    {
        $this->setMethodsAceitos(['GET','POST']);
        $this->loadModel('index/index');
        $this->setOutput($this->model_index_index->getTextInicioApi());
    }

    public function testar()
    {
        $this->setOutputJson($this->getParams());
    }

    public function token()
    {
        $this->setMethodsAceitos('POST');
        $this->loadModel('auth/auth');
        $model = $this->model_auth_auth;
        $chaveApi = $this->getAllParams()['key'];

        if ($this->tipoAcessoApi == 1) {

            $interno = $model->getTokenInterno($chaveApi);

            $this->setOutputJson($interno,false);
            return;
        } elseif ($this->tipoAcessoApi == 2) {
            $secret = $this->getRequest()->getHeader('Secret-key')[0];
            $validar = $model->getAuthSecret($chaveApi, $secret);
            if (!$validar) throw new AppException('Chave secreta inválida', 1023);
            $id = $validar[0]->ID;
            $origin = $validar[0]->URL;
        } elseif ($this->tipoAcessoApi == 4) {
            $dadosUsuario = $this->getParamSend(['user', 'pass'], true);
            $validar = $model->getAuthLoginPass($dadosUsuario['user'], $dadosUsuario['pass']);
            if (!$validar) {
                throw new AppException(
                    'Usuário ou senha errados ou usário não cadastrado',
                    10005,
                    404,
                    'Usuário ou senha inválido ou as credenciais enviadas não foram cadastradas'
                );
            }
            $id = $validar[0]->ID;
            $secret = false;
            $origin = false;
        } else {
            $origin = $this->getRequest()->getHeader('Origin')[0];
            $validar = $model->getAuthOrigin($chaveApi, $origin);
            if (!$validar) throw new AppException('Este dominio não tem acesso a API', 1025);
            $id = $validar[0]->ID;
            $secret = false;
        }

        $token = $model->getAcessToken($id,$chaveApi,$secret,$origin, $this->tipoAcessoApi);

        if (!isset($retornar)) $retornar = $model->getReturnOatuh($token);

        $this->setOutputJson($retornar,false);
    }

    public function validarToken()
    {
        $this->setMethodsAceitos('GET');

        $this->setOutputJson('Token Válido');
    }

    public function dadosUsuarioOauth()
    {
        $this->setMethodsAceitos('GET');

        $this->loadModel('entidade/entidade');

        $retornar = Genericos::getDadosUsuarioOauth();

        if ($retornar != false) {

            $retornar = $this->model_entidade_entidade
                ->setCamposRetornar(['id','nome','cnpj','apelido','email'])
                ->getEntidade($retornar['id'])[0];
        }

        $this->setOutputJson($retornar);
    }

    public function eventoSalvarLogBd($dados_gravar)
    {
        $script = $_SERVER['SCRIPT_NAME'];
        $pegar = $_SERVER['REQUEST_URI'];

        $script = str_replace('index.php','',$script);
        $pegar = str_replace($script,'',$pegar);
        $pegar = preg_replace('/\?(.*)/i', '', $pegar);

        $action = strtolower($dados_gravar[0]);
        $dados_sql = '';

        if ($action != 'access') {

            $parametrosQuery = $dados_gravar[2];

            $dados_sql = 'Foi pro banco: ';
            $dados_sql_arr = [];

            if ($action == 'insert') {
                preg_match_all('/\((.*?)\)/i', $dados_gravar[1], $analisar_insert);

                $campos = $analisar_insert[0][0];
                $campos = preg_replace('/\(|\)/i', '', $campos);
                $campos = str_replace(' ', '', $campos);
                $campos = explode(',', $campos);

                $valores = $analisar_insert[0][1];
                $valores = preg_replace('/\(|\)/i', '', $valores);
                $valores = str_replace(' ', '', $valores);
                $valores = explode(',', $valores);

                $usa_parametros = [];
                $parametro_dentro = [];

                foreach ($campos as $i => $campo) {
                    if (isset($valores[$i])) {
                        if ($valores[$i] == '?') $usa_parametros[] = $campo;
                        else $parametro_dentro[] = $campo . ' = ' . $valores[$i];
                    }
                }

                foreach ($usa_parametros as $i => $parametro) {
                    if (isset($parametrosQuery[$i])) {
                        $dados_sql_arr[] = $parametro . ' = ' . $parametrosQuery[$i];
                    }
                }

                $dados_sql_arr = implode(' || ', $dados_sql_arr);
                $dados_sql .= $dados_sql_arr;
                if (count($parametro_dentro) > 0) {
                    $parametro_dentro = implode(' || ', $parametro_dentro);
                    $dados_sql .= $parametro_dentro;
                }

            } elseif ($action == 'update' || $action == 'delete') {
                preg_match_all('/[a-zA-Z-0-9_]+\s?+=\s?(.*)/i', $dados_gravar[1], $analisar_update_delete);

                if (count($analisar_update_delete[0]) > 0) {
                    $dados = $analisar_update_delete[0][0];
                    $dados = preg_replace('/(\swhere\s|\sor\s|\sand\s|\sxor\s)/i', ',', $dados);
                    $dados = explode(',', $dados);

                    $usa_parametros = [];
                    $parametro_dentro = [];

                    foreach ($dados as $i => $campo) {
                        preg_match('/\s?+=+\s?\?/i', $campo, $dentro);
                        preg_match('/\s?+=+\s?(.*)/i', $campo, $valor);

                        $campo = str_replace($valor[0], '', $campo);
                        $valor = preg_replace('/\s?+=+\s?/i', ',', $valor);

                        if (count($dentro) > 0) $usa_parametros[] = $campo;
                        else $parametro_dentro[] = $campo . ' = ' . $valor;
                    }

                    foreach ($usa_parametros as $i => $parametro) {
                        if (isset($parametrosQuery[$i])) {
                            $dados_sql_arr[] = $parametro . ' = ' . $parametrosQuery[$i];
                        }
                    }

                    $dados_sql_arr = implode(' || ', $dados_sql_arr);
                    $dados_sql .= $dados_sql_arr;

                    if (count($parametro_dentro) > 0) {
                        $parametro_dentro = implode(' || ', $parametro_dentro);
                        $dados_sql .= $parametro_dentro;
                    }

                }
            }

            $dados_sql = ' - '.$dados_sql;
        }

        $description = [];

        foreach ($this->getAllParams() as $i => $valor) {
            if (is_array($valor)) {
                $valorAdd = [];

                foreach($valor as $j => $valorAjustar) {
                    if (is_array($valorAjustar)) {
                        $valorAdd[] = json_encode($valorAjustar);
                    } else {
                        $valorAdd[] = $valorAjustar;
                    }
                }

                $valor = implode(',',$valorAdd);
            }

            $description[] = $i.' = '.$valor;
        }

        $description = 'Recebido URL: '.implode(' || ', $description).$dados_sql;

        $username = Genericos::getUsuarioSCLogado(true,false);
        $username = !$username ? 'SEM USUARIO' : $username;

        $application = $pegar;
        $creator = 'InfoAPI';
        $ip_user = $_SERVER['REMOTE_ADDR'];
        
        Log::logger()->addInfo('Evento '.$description);
    }

    public function adicionar() 
    {
        $this->setMethodsAceitos(['POST']);
        $this->loadModel('teste/teste');
        $model = $this->model_teste_teste;
        
        $this->setOutputJson($model->adicionar($this->getAllParams()));
    }

    public function atualizar() 
    {
        $this->setMethodsAceitos(['PUT']);
        $this->loadModel('teste/teste');
        $model = $this->model_teste_teste;
        
        $this->setOutputJson($model->atualizar($this->getAllParams()));
    }

    public function deletar() 
    {
        $this->setMethodsAceitos(['DELETE']);
        $this->loadModel('teste/teste');
        $model = $this->model_teste_teste;
        $id = $this->getParamSend('id', true)['id'];
        
        $this->setOutputJson($model->deletar($id));
    }

    public function listar() 
    {
        #$this->setAcessoExterno(false);
        $this->setMethodsAceitos(['GET']);
        $this->loadModel('teste/teste');
        $model = $this->model_teste_teste;
        $campos = $this->getParamSend('campos');
        $query = $this->getParamSend('query');
        $model->setPaginacao($this->getAllParams());

        if ($campos !== false) {
            $nao_listar = ['']; //id
            $campos_listar = $this->getCamposListarCrud($campos['campos'], $nao_listar);

            $model->setCamposRetornar($campos_listar);
        }
        
        $this->setOutputJson($model->listar($query));
    }
}