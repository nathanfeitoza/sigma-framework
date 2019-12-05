# Backend
Branch para testes com os apps criados fora do scriptcase

> TESTAR SEMPRE PARA EVITAR ERROS

Informações sobre a estrutura

A estrutura segue os padrões MVC, portanto, as pastas correspondente ao padrão estarão seguindo seus nomes.

* app
    * containers -> Arquivos que compõe os [containers do Slim](http://bit.ly/2UikTGY)
    * middleware -> Arquivos que fazem uma ponte para execução de determinadas ações, diferem do eventos, pois não necessitam de um controller para funcionar e serão incluídos diretamente no código (require_once) através de um metódo que possibilite tal. Só serão utilizados de maneira global, para interações dentro das rotas usar eventos
        * antes_da_validacao -> Os arquivos contidos aqui serão inseridos após o recebimento e preenchimento de objetos globais do controller, ou seja, antes de se iniciar as validações da requisição em si
        * depois_da_validacao -> Os arquivos contidos aqui serão responsáveis por executar após as validações da requisição em termos de rota, portanto, depois da execução da validação inicial. Os arquivos contidos aqui serão, por exemplo, utilizados para validação de tokens
    * controller -> Controller das aplicações (MVC)
        * api -> Classes de controller que precisam de autenticação que servem de endpoint da api
        * ui -> Classes de controller que não precisam de autenticação, pois a mesma será feita no login, e server para renderizar as páginas do twig e servir informações as mesmas
            
            OBS: Elas podem ter classes com o mesmo nome, porém essa é uma forma de identificar que aquele endpoint pertence ao grupo renderizado pela ui. Ou seja,
            as classes de api/controle_financeiro serão usadas, via javascript, por ui/controle_financeiro. Todas seguem a nomeação no padrão CamelCase para métodos e classes.
            
            OBS2: A forma da aplicação buscar seu endpoint baseia-se no nome da classe e seu método como segundo parâmetro. A classe ControllerIndex serve como endpoint "index", ou seja, que é o primeiro a ser buscado caso nada seja passado.
            Ex: A pasta ui/ tem a pasta controle_financeiro e dentro dela há a classe ControllerIndex com o método index(), ou seja, seu endpoint será {url da aplicação}/controle_financeiro. Dentro da mesma pasta há a classe ControllerBaixaControleFinanceiro 
            com um também método index(), então, seu endpoint ficará {url da aplicação}/controle_financeiro/baixa_controle_financeiro. Já na pasta ui/boleto há a classe ControllerIndex com o método retorno, então, seu endpoint ficará {url da aplicação}/boleto/retorno.
            Ou seja o nome da classe e seu método (somente públicos) influenciam no endpoint. Na pasta api/controle_financeiro há a classe ControllerControleFinanceiro com o seguinte método resumoMovContaDiario(), como a classe não é uma index e nem o método, então seu 
            endpoint será {url da aplicação}/api/controle_financeiro/controle_financeiro/resumo_mov_conta_diario   
            
    * core -> Núcleo da aplicação, onde ficam as partes fixas e não modulares do backend
        * bd -> Classes que compõe a comunicação com o banco de dados
        * errors -> Classes que manipulam os erros da aplicação
        
            OBS: Há duas classes Controller e Model que devem ser extendidas as classes Controller e Model do MVC, respectivamente. Há também a classe Genericos que é uma classe estática que abriga métodos também estáticos para validações e busca de configurações, por exemplo.
            A classe Start é quem inicia a aplicação
        
    * events -> Pasta que guarda as informações dos eventos que a aplicação tem, podendo especificar qual tigger (gatilho) e action (ação) do mesmo
    * externo -> São onde ficam os códigos gerenciados pelo composer e outros externos que não sejam gerenciados por ele
        * composer -> diretório dos códigos obtidos com o composer
        * notcomposer -> diretório com códigos de terceiros que não vieram do composer
        
    * model -> Model da aplicação, local que ficam as partes que acessam e modificam informações (MVC)
        
        OBS: Este diretório segue estrutura parecida com o Controller, onde o nome da pasta determina o grupo da classe. As classes daqui podem ser chamadas tanto de um controller como de um model através do método loadModel(), onde o primeiro argumento é o caminho do model, ex: loadModel('produto/produto') sem a necessidade do .php, assim a classe Produto será instanciada em uma váriavel da mémoria
        e será possível usá-la com o método mágico, dentro de um método de uma classe, $this->model_produto_produto, isto é possível pois as classes Model e Controller usam uma Trait para reaproveitamento de código. Para saber mais deste método acesse app/core/ControllerModelTrait.php.
        PS: para saber o que são [traits](http://bit.ly/2KIUJh7)  
        
    * .htaccess -> Arquivo apache para configurá-lo, ex: restringir acesso a pastas, arquivos
    * composer.json -> arquivo que gerencia as dependências do composer

* arquivos -> Pasta onde são armazenados os arquivos gerados e recebidos da aplicação
* certificados -> pasta que guarda os certificados digitais
* defines -> Pasta onde são definidas configurações da aplicação e endereço do banco de dados
* logs -> pasta onde são guardados os logs da aplicação
* scripts -> Pasta onde são guardados os scripts a serem executados em linha de comando
* view -> Pasta View onde a parte de ui é renderizada (MVC)
    OBS: Aqui a pasta do tema definido nas configurações, e dentro dela há a arquitetura frontend com o twig
    

# Definições Técnicas

PS: Toda classe deverá usar camelcase com a primeira letra maiúscula. Ex: MinhaClasse

### Controller
Toda classe Controller deverá ficar dentro da pasta app/controller e de sua respectiva finalidade, ui ou api, para interface do usuário ou api, respectivamente e de sua pasta grupo.
Deverá começar com o prefixo Controller e também extender a classe Controller. Exemplo de código:

```php
    <?php
    /*
     * AppController é o namespace que identifica que esta classe é um controller para o composer. Ver app/composer.json
     * */
    namespace AppController\ui\boleto;
    
    use AppCore\Controller;
    
    class ControllerIndex extends Controller
    {}
```

### Model

Toda classe Model deverá ficar dentro da pasta app/model e dentro de sua pasta grupo. Não há prefixo definido. Deverá extender a classe Model. Exemplo de código:

```php
    <?php
    /*
    * AppModel é o namespace que identifica que esta classe é um model para o composer
    */
    namespace AppModel\produto;
    
    use AppCore\Model;
    
    class Produto extends Model
    {}
```

### Métodos especiais

Toda classe Controller e Model poderá e deverá usar o método loadModel como carregador de classes Model. Seu uso é definido da seguinte forma:

```php
    $this->loadModel('local do model', [opcional] 'valor do construtor da classe', [opcional] 'valor do invoke da classe' )
```

Exemplo prático

```php
    $this->loadModel('produto/produto')
    $this->loadModel('produto/produto', $variavelParaConstrutor)
    $this->loadModel('produto/produto', false, $variavelParaInvoke)
    $this->loadModel('produto/produto', $variavelParaConstrutor, $variavelParaInvoke)
```

E o uso se dará por um método supermágico __call

```php
    /*
    * Esta variável constará a instância da classe Produto, onde model_ identifica para o __call que é um model pré-carregado anteriormente pelo método loadModel e que o subsequente é a localização do método (namespace) e a classe a ser instanciada 
    */
    
    $this->model_produto_produto
```

### Genéricos

Métodos genéricos de validação estão na classe Genericos e são todos estáticos. Exemplo de uso: 

```php
    Genericos::verificarCampoPreenchido();
```

### Impressão Controller

Os métodos controllers têm três formas de imprimir as informações para a tela, usando a classe RenderView para o JSON.
São ela: setOutput, setOutputPage, setOutputJson. A primeira imprime a informação crua em um html normal, a segunda 
renderiza um página do tema e a terceira, usada para a api, devolve um JSON dos dados.

```php
    $this->setOutput('informação')
    
    $this->setOutputPage('local da página', [opcional | array] ['dados que serão usados como variável pelo twig'])
    
    $this->>setOutpuJson([array] ['dados que serão transformados em json'], [opcional | boolean (padrão true) 'se é para mostrar no padrão da api ou renderizar de forma literal o array'], [opcional | boolean] 'status do retorno, true para sucesso e false para erro', [opcional | int] 'código de retorno de um erro')
```

### Alterações na base via model

É possível fazer alterações na base através de um também método __call. É possível inserir, atualizar e deletar, para isto basta chamar $this e sua ação precedida de informação de schema e nome da tabela. Exemplo:

#### Inserção

```php
    
    // Inserção em uma tabela pública
    
    $this->inserir_bd_entidade([campos a adicionar], [valores dos campos])
    
    // Inserção em uma tabela com schema
    
    $this->inserir_bd1_estoque_mov([campos a adicionar], [valores dos campos])
    
```

#### Atualização

```php
    
    // Atualização em uma tabela pública
    
    $this->atualizar_bd_entidade([campos a atualizar], [valores dos campos], [opcional] [callback do where])
    
    // com where
    
    $this->atualizar_bd_entidade([campos a atualizar], [valores dos campos], function($where){
        $where->where('id','=','108');   
    })
    
    // Atualização em uma tabela com schema
    
    $this->atualizar_bd1_entidade([campos a atualizar], [valores dos campos], [opcional] [callback do where])
    
```

#### Deletar

```php
    
    // Delete em uma tabela pública
    
    $this->deletar_bd_entidade([opcional] [callback where])
    
    // com where
    
    $this->deletar_bd_entidade(function($where){
        $where->where('id','=','108');   
    });
    
    // Delete em uma tabela com schema
    
    $this->deletar_bd1_entidade([opcional] [callback where])
    
```