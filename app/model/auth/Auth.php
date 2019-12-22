<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 11/03/19
 * Time: 14:35
 */

namespace AppModel\auth;

use AppCore\Configuracoes;
use AppCore\errors\AppException;
use AppCore\Genericos;
use AppCore\Model;

class Auth extends Model
{
    
    const CHAVE_CRIPT_API = 'NATHANF';
    private $expira = 0;

    /**
     * Objetivo: Recuperar autenticaçõa
     * Recebe: chave da api e se tem um segundo fator de autenticação
     * Retorna: Se foi validade ou não
     * Autor: Nathan Feitoza
     * Data: 28/03/19 13:35
     * Nome Método: getAuth
     *
     * @param $chaveApi
     * @param bool $doubleCheck
     * @return bool
     * @autor Nathan Feitoza
     */
    protected function getAuth($chaveApi, $doubleCheck = false)
    {
        $verificar = $this->db()->tabela('webservices')
            ->campos(['id','secret_key','url'])
            ->where('key_api','=',$chaveApi)
            ->setUsarExceptionNaoEncontrado(false);
            if (is_array($doubleCheck)) {
                $comparador = isset($doubleCheck[2]) ? $doubleCheck[2] : '=';
                $verificar->whereAnd($doubleCheck[0],$comparador,$doubleCheck[1]);
            }

        $verificar = $verificar->buildQuery('select');

        if (is_int($verificar)) return false;

        return $verificar;
    }

    /**
     * Objetivo: Recuperar o key de autenticação
     * Recebe: chave da api
     * Retorna: key de autenticação
     * Autor: Nathan Feitoza
     * Data: 28/03/19 13:35
     * Nome Método: getAuthKey
     *
     * @param $chaveApi
     * @return bool
     * @autor Nathan Feitoza
     */
    public function getAuthKey($chaveApi)
    {
        return $this->getAuth($chaveApi);
    }

    /**
     * Objetivo: Recuperar o secret
     * Recebe: chave da api e secret
     * Retorna: O secret
     * Autor: Nathan Feitoza
     * Data: 28/03/19 13:36
     * Nome Método: getAuthSecret
     *
     * @param $chaveApi
     * @param $secret
     * @return bool
     * @autor Nathan Feitoza
     */
    public function getAuthSecret($chaveApi, $secret)
    {
        return $this->getAuth($chaveApi, ['secret_key', $secret]);
    }

    /**
     * Objetivo: recuperar o origin
     * Recebe: chave da api e origin
     * Retorna: origin
     * Autor: Nathan Feitoza
     * Data: 28/03/19 13:36
     * Nome Método: getAuthOrigin
     *
     * @param $chaveApi
     * @param $origin
     * @return bool
     * @autor Nathan Feitoza
     */
    public function getAuthOrigin($chaveApi, $origin)
    {
        return $this->getAuth($chaveApi, ['url', $origin]);
    }


    public function getAuthLoginPass($user, $pass)
    {
        $validar = $this->db()->tabela('sec_users')
                ->campos(['id', 'name', 'email'])
                ->where('login', '=', $user)
                ->whereAnd('pswd','=', md5($pass))
                ->setUsarExceptionNaoEncontrado(false)
                ->buildQuery('select');

        if (is_int($validar)) return false;

        return $validar;
    }

    /**
     * Objetivo: Gerar chave de criptografia do token
     * Recebe: chave da api e secret
     * Retorna: Chave de criptografia
     * Autor: Nathan Feitoza
     * Data: 28/03/19 13:37
     * Nome Método: getGerarChaveCriptTokenOauth
     *
     * @param $chave_api
     * @param $secret
     * @return string
     * @autor Nathan Feitoza
     */
    private function getGerarChaveCriptTokenOauth($chave_api, $secret)
    {
        return $chave_api.md5($secret.$chave_api).$secret;
    }

    /**
     * Objetivo: Setar um novo token
     * Recebe: token e outros dados
     * Retorna:
     * Autor: Nathan Feitoza
     * Data: 28/03/19 13:37
     * Nome Método: setNewToken
     *
     * @param $token
     * @param int $webservice_id
     * @param int $tipo
     * @autor Nathan Feitoza
     */
    protected function setNewToken($token, $webservice_id = 1, $tipo = 1)
    {
        $this->db()->tabela('webservices_token')
            ->campos(['token','expira','tipo','webservices_id'], [
                $token, 
                $this->expira,
                $tipo,
                $webservice_id
            ])
            ->buildQuery('insert');
    }

    /**
     * Objetivo: Recuperar um token para uso interno nas chamadas de mesma origem
     * Recebe: chave da api
     * Retorna: token
     * Autor: Nathan Feitoza
     * Data: 28/03/19 13:37
     * Nome Método: getTokenInterno
     *
     * @param $chaveApi
     * @return array
     * @throws AppException
     * @autor Nathan Feitoza
     */
    public function getTokenInterno($chaveApi)
    {
        $id = $this->getAuthKey($chaveApi);

        if (!$id) throw new AppException('Chave de API não cadastrada', 1024);

        $origin = $id[0]->URL;
        $secret = false;
        $id = $id[0]->ID;

        $retornar = $this->getSlimGuard()->generateToken();
        $token = $this->getAcessToken($id,$chaveApi,$secret,$origin, 1);

        $retornar['access_token'] = $token['token'];
        $retornar['expira_token'] = $token['expira'];

        return $retornar;
    }

    /**
     * Objetivo: peg um token
     * Recebe: webservice e o tipo
     * Retorna: token
     * Autor: Nathan Feitoza
     * Data: 28/03/19 13:38
     * Nome Método: getToken
     *
     * @param $webservice_id
     * @param $tipo
     * @return bool
     * @autor Nathan Feitoza
     */
    public function getToken($webservice_id, $tipo)
    {
        $buscar = $this->db()->tabela('webservices_token')
                        ->campos(['*'])
                        ->where('webservices_id','=',$webservice_id)
                        ->whereAnd('tipo','=',$tipo)
                        ->whereAnd('expira', '>=', date('Y-m-d H:i:s'))
                        ->setUsarExceptionNaoEncontrado(false)
                        ->buildQuery('select');
        if (is_int($buscar)) return false;

        return $buscar[0];
    }

    /**
     * Objetivo: Recuperar um access token
     * Recebe: dados para recuperação
     * Retorna: access token
     * Autor: Nathan Feitoza
     * Data: 28/03/19 13:38
     * Nome Método: getAcessToken
     *
     * @param $id
     * @param $chave_api
     * @param $secret
     * @param $origin
     * @param $tipoToken
     * @return array
     * @autor Nathan Feitoza
     */
    public function getAcessToken($id,$chave_api,$secret,$origin,$tipoToken)
    {
        $criada = date('Y-m-d H:i:s');
        $getExistToken = $this->getToken($id, $tipoToken);

        if ($getExistToken != false) {
            $this->expira = $getExistToken->EXPIRA;
            $chave_criptografia = $this->getGerarChaveCriptTokenOauth($chave_api,$secret);
            return ['token' => $getExistToken->TOKEN, 'expira' => strtotime($this->expira)];
        }

        $this->expira = date('Y-m-d H:i:s', strtotime(
            $criada." + ".
            (int) Configuracoes::get('TEMPO_EXPIRA_TOKEN')." seconds")
        );

        $gravar_token = [
            "id" => $id,
            "key_api" => $chave_api,
            "secret" => $secret,
            "criada" => $criada,
            "expira" => $this->expira,
            "origin" => $origin,
        ];

        $json_token = json_encode($gravar_token);
        $chave_criptografia = $this->getGerarChaveCriptTokenOauth($chave_api,$secret);

        $token = Genericos::encriptarDecriptar('encrypt',$json_token, $chave_criptografia);
        $token = str_replace('+','__NF__',$token);
        $this->setNewToken($token, $id, $tipoToken);

        return ['token' => $token, 'expira' => strtotime($this->expira)];
    }

    /**
     * Objetivo: Pegar o retorno do oauth
     * Recebe: token
     * Retorna: retorno do oauth
     * Autor: Nathan Feitoza
     * Data: 28/03/19 13:38
     * Nome Método: getReturnOatuh
     *
     * @param $token
     * @return array
     * @autor Nathan Feitoza
     */
    public function getReturnOatuh($token)
    {
        return [
            "access_token" => $token['token'], 
            "expires_in" => strtotime($this->expira), 
            "scope" => '',
            "token_type" => "bearer"
        ];
    }

    /**
     * Objetivo: Pega o token do cabeçalho http
     * Recebe: Token
     * Retorna: Validado ou não
     * Autor: Nathan Feitoza
     * Data: 28/03/19 13:39
     * Nome Método: getTokenAuthorization
     *
     * @param $token
     * @return mixed
     * @throws AppException
     * @autor Nathan Feitoza
     */
    public function getTokenAuthorization($token)
    {
        preg_match("/(Bearer )+(.*)/", $token, $token_array);

        if (count($token_array) == 3) return $token_array[2];

        throw new AppException("Token de acesso é inválido", 120);
    }

    /**
     * Objetivo: Recuperar dados do token oauth
     * Recebe: dados para recuperação
     * Retorna: dados
     * Autor: Nathan Feitoza
     * Data: 28/03/19 13:40
     * Nome Método: getDadosTokenOauth
     *
     * @param $token
     * @param $chave_api
     * @param bool $secret_acesso
     * @return bool|mixed|string
     * @throws AppException
     * @autor Nathan Feitoza
     */
    public function getDadosTokenOauth($token,$chave_api, $secret_acesso = false)
    {
        $chave_criptografia = $this->getGerarChaveCriptTokenOauth($chave_api,$secret_acesso);
        $token_decrypt = Genericos::encriptarDecriptar('decrypt', $token, $chave_criptografia);

        if (!$token_decrypt) throw new AppException("Token inválido", 118);

        $dados_token_decrypt = Genericos::jsonDecode(
            $token_decrypt,
            'O json do token oauth enviado não é válido'
        );

        if (count((array) $dados_token_decrypt) == 6) return $dados_token_decrypt;
        
        throw new AppException('Token Inválido', 144);
    }

    /**
     * Objetivo: Validar o token oauth recebido
     * Recebe: Dados para validação
     * Retorna: se foi validado ou não
     * Autor: Nathan Feitoza
     * Data: 28/03/19 13:40
     * Nome Método: validarTokenOauth
     *
     * @param $token
     * @param $chave_api
     * @param bool $secret_acesso
     * @return bool
     * @throws AppException
     * @autor Nathan Feitoza
     */
    public function validarTokenOauth($token, $chave_api, $secret_acesso = false, $retornar_dados = false)
    {
        $token = str_replace('__NF__','+',$token);
        $dados_token_decrypt = $this->getDadosTokenOauth($token,$chave_api, $secret_acesso);
        $key_api_token = $dados_token_decrypt->key_api;
        $secret_token = $dados_token_decrypt->secret;
        $expira_token = $dados_token_decrypt->expira;

        $retorno = $dados_token_decrypt;

        if (strcmp($key_api_token, $chave_api) != 0) {
            throw new AppException("Chave da api não corresponde ao token de acesso", 119);
        } elseif ($secret_token != $secret_acesso) {
            throw new AppException("Chave secreta não corresponde ao token de acesso", 122);
        } elseif ($expira_token != false) {
            $agora = strtotime(date('Y-m-d H:i:s'));
            $expira_token = strtotime($expira_token);

            if ($agora > $expira_token) {
                throw new AppException('Token expirado', 143);
            }

        }

        return $retornar_dados ? $retorno : true;
    }

    private function getChaveCriptAPI($encodada=false)
    {
        return $encodada ? base64_encode(self::CHAVE_CRIPT_API) : self::CHAVE_CRIPT_API;
    }

    /**
     * Objetivo: Gerar a chave da api
     * Retorna: string com a chave da api
     * Autor: Nathan Feitoza
     * Data: 28/03/19 13:40
     * Nome Método: getGerarChaveAPI
     *
     * @return string
     * @autor Nathan Feitoza
     */
    public function getGerarChaveAPI()
    {
        $chave_cript_api = $this->getChaveCriptAPI(true); // Primeiro, geramos um hash base64 da string comum
        $rand_subs = rand(1, 4); // Geramos um número aleatório entre 1 e 4 que cortará o hash gerado acima
        $time_1 = substr( md5(time()) , 0, 5); // Geramos a primeira string validadora da chave
        $time_2 = substr( md5(uniqid()) , 0, 6); // Geramos a segunda string validadora da chave
        $cript_string = substr($chave_cript_api, 0, -$rand_subs); // Cortamos o hash gerado com o valor gerado automaticamente de corte
        $cript_string_f = $rand_subs; // Aqui é o valor de digito verificador 3, pois ele vai determinar quanto o hash foi cortado, assim podendo fazer o caminho de remontagem
        $chave_gerada_retorno = $time_1.'@'.$cript_string.$cript_string_f.'_'.$time_2; // Geramos a chave da API

        return $chave_gerada_retorno;
    }

    /**
     * Objetivo: Validar a chave da api passada na requisição
     * Recebe: A chave da api
     * Retorna: Um booleano definindo se a api está validada (true)
     * ou um exception apontando o erro da api e se código
     * Autor: Nathan Feitoza
     * Data: 28/03/19 13:40
     * Nome Método: setValidarChaveAPI
     *
     * @param $chave_api
     * @throws AppException
     * @autor Nathan Feitoza
     */
    public function setValidarChaveAPI($chave_api)
    {
        $chave_cript_api = $this->getChaveCriptAPI();
        $msg_invalida = 'Chave da API inválida'; // Mensagem de retorno quando a chave é invalidada
        $validador_primario = preg_match("/[@]+(.*)+[_]/", $chave_api, $saida_validada); // Expressão regular que captura o primeiro validador, que é o que está entre o @ e o _
        $time1 = preg_match("/(.)+[@]/", $chave_api, $time1_return); // Pegamos o valor do time gerado, que é a primeira string validadora (fora a string principal)
        $time2 = preg_match("/[_]+(.*)/", $chave_api, $time2_return); // Pegamos o valor do uniqid gerado, que é a string de validação secundária

        if ($validador_primario == 0) throw new AppException( $msg_invalida, 110);

        //Estes dois trechos de código removem o @ e o _, respectivamente, do validador primário, que é a string principal
        $str_comum = str_replace('@','',$saida_validada[0] );
        $str_comum = str_replace('_','',$str_comum);

        $cont_str_comum = (strlen($str_comum) - 1); // Conta a string comum, já subtraindo do resultado o digito verificador. Exemplo: String inteira: 10, menos o digito verificador -> String inteira = 9
        $digito_validador = substr($str_comum, -1 ); // Retira o digito verificador da String principal, que fica no final da string
        
        // Verifica se ele é numérico, caso não gera um erro
        if (!is_numeric($digito_validador)) throw new AppException( $msg_invalida, 111);
        
        $str_comum_sem_digito = substr($str_comum,  0,$cont_str_comum); // Corta a string removendo o digito verificador da mesma
        $str_comum_decript = base64_decode($str_comum_sem_digito); // Desencodifica o hash base64
        $convert_string_comum = substr($chave_cript_api, 0, -$digito_validador); // Corta a string comum com o valor do digito verificador informado

        // Compara a string convertida enviada e a constante após ser cortada pelo digito verificador
        if (strcmp($convert_string_comum, $str_comum_decript) != 0) throw new AppException( $msg_invalida, 112);
        
        // Verifica se as strings iniciais de validação não são iguais a zero, caso sim um erro será mostrado
        if (!($time1 != 0 && $time2 != 0)) throw new AppException( $msg_invalida, 113);

        // Os códigos abaixo removem o @ do verificaor 1 e o _ do verificador 2 respectivamente
        $time1_rep = str_replace('@','',$time1_return[0]);
        $time2_rep = str_replace('_','',$time2_return[0]);

        // Verifica se os validadoras têm seus tamanhos definidos, caso não um erro é disparado
        if ( !(strlen($time1_rep) == 5 && strlen($time2_rep) == 6) ) throw new AppException( $msg_invalida, 114);
        
        return true;
    }
}