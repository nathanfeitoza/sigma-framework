<?php
/**
 * Created by Nathan Feitoza.
 * User: dev01
 * Date: 15/03/19
 * Time: 08:57
 */

namespace AppModel\ordem_servico;


use AppCore\errors\AppException;
use AppCore\Genericos;
use AppCore\Model;

class OrdemServico extends Model
{
    public function getIdUltimoServico()
    {
        $dados = $this->db()->tabela(Genericos::getSchema().'servico_id_seq')
                ->campos(['last_value'])
                ->buildQuery('select');

        return $dados[0]->LAST_VALUE;
    }

    public function getServico($servico_id)
    {
        return $this->db()->tabela(Genericos::getSchema().'servico')
            ->where(Genericos::getSchema().'servico.id','=',$servico_id)
            ->buildQuery('select');
    }

    public function getServicoItem($servico_id)
    {
        return $this->db()->tabela(Genericos::getSchema().'servico_item')
            ->where(Genericos::getSchema().'servico_item.servico_id','=',$servico_id)
            ->buildQuery('select');
    }

    public function getServicoAtividade($servico_id)
    {
        return $this->db()->tabela(Genericos::getSchema().'servico_atividades')
            ->where(Genericos::getSchema().'servico_atividades.servico_id','=',$servico_id)
            ->buildQuery('select');
    }

    public function getServicoInfoCompleto($servico_id)
    {
        $db = $this->db()->leftJoin('entidade b','entidade_id = b.id');

        $cabecalho = $this->setCamposRetornar(['data_emissao as data_servico',
                                               'entidade_id as cliente_id','b.nome as cliente',
                                                'grupo_id as grupo_servico',
                                                'atendente_id as atendente',
                                                'tecnico_id as tecnico', 'data_previsao as previsao',
                                                'relato_cliente as relato','status',
                                                'nivel_prioridade as prioridade',
                                                'email_cliente as email','pessoa_contato as contato',
                                                'telefone_cliente as telefone','identificador',
                                                'atendimento_inicio','atendimento_final'])
            ->setObjDb($db)
            ->getServico($servico_id);

        $atividades = $this->setCamposRetornar(['tecnico_id as tecnico_servico',
                                           'descricao_atividade as nome_servico',
                                            'data_inicio_atividade as data_servico',
                                            'valor as valor_servico'])
            ->getServicoAtividade($servico_id);

        $db = $this->db()->leftJoin(Genericos::getSchema().'view_produtos b','b.id = produto_id');

        $materiais = $this->setCamposRetornar(['tecnico_id as tecnico_material',
                                               'produto_id', 'quantidade as quant_material',
                                                'b.nome as nome_produto','valor as valor_material',
                                                'data as data_produto'])
            ->setObjDb($db)
            ->getServicoItem($servico_id);

        if(is_int($cabecalho) OR is_bool($cabecalho)) return -1;

        return ['CABECALHO' => $cabecalho[0], 'HISTORICO' => $atividades, 'MATERIAIS' => $materiais];
    }

    public function getServicoGrupos()
    {
        return $this->db()->tabela('servico_grupo')->buildQuery('select');
    }

    public function getServicoPrioridades()
    {
        return $this->db()->tabela('servico_prioridade')->buildQuery('select');
    }

    public function getServicoStatus()
    {
        return $this->db()->tabela('servico_status')->buildQuery('select');
    }

    public function setIniciarFinalizarServico($tipo, $servico_id)
    {
        $iniciar = strcasecmp($tipo, 'iniciar') == 0;

        $servico = $this
            ->setMsgNaoEncontrado('Nenhum atendimento encontrado com o id '.$servico_id)
            ->setCamposRetornar(['atendimento_inicio','atendimento_final'])
            ->getServico($servico_id);

        $servico = $servico[0];

        if($iniciar && !is_null($servico->ATENDIMENTO_INICIO)) throw new AppException('O servico de id '.$servico_id.' já foi iniciado',1578);
        if(!$iniciar && is_null($servico->ATENDIMENTO_INICIO)) throw new AppException('O servico de id '.$servico_id.' não pode ser finalizado sem antes ser finalizado',1579);

        $data = date('Y-m-d H:i:s');

        if($iniciar) $campo_att = 'atendimento_inicio';
        else $campo_att = 'atendimento_final';

        $this->atualizar_bd1_servico($campo_att, $data, function($where) use ($servico_id) {
            $where->where('id','=', $servico_id);
        });
    }
    
    public function criarOrdemServico($criar, $servico, $materiais, $atividades) 
    {

        $trans = $this->db();
        $trans->iniciarTransacao();

        if(!is_numeric($criar)) {
            $this->inserir_bd1_servico(array_keys($servico), array_values($servico));
            $id_servico = $this->getIdUltimoServico();
        } else {
            $id_servico = $criar;
            $this->atualizar_bd1_servico(array_keys($servico), array_values($servico),
                function($where) use ($id_servico) {
                    $where->where('id','=', $id_servico);
                });
        }

        if(!is_null($atividades)) {
            $this->deletar_bd1_servico_atividades(function($where) use ($id_servico){
                $where->where('servico_id','=',$id_servico);
            });

            $necessarios = ['nome_servico','data_servico','tecnico-servico','valor_servico'];
            Genericos::camposVazios($atividades, $necessarios);
            if(isset($atividades['nome_servico'])) {
                foreach ($atividades['nome_servico'] as $i => $valor) {
                    $dados = [
                        'servico_id' => $id_servico,
                        'tecnico_id' => $atividades['tecnico-servico'][$i],
                        'descricao_atividade' => $valor,
                        'data_inicio_atividade' => $atividades['data_servico'][$i],
                        'forma_atendimento_id' => 1,
                        'valor' => Genericos::converterNumero($atividades['valor_servico'][$i])
                    ];

                    $this->inserir_bd1_servico_atividades(array_keys($dados), array_values($dados));
                }
            }
        }

        if(!is_null($materiais)) {
            $this->deletar_bd1_servico_item(function($where) use ($id_servico){
                $where->where('servico_id','=',$id_servico);
            });

            $necessarios = ['codigo','data_produto','tecnico-historico','quantidade_produto','valor_produto'];
            Genericos::camposVazios($atividades, $necessarios);

            if(isset($materiais['codigo'])) {
                foreach ($materiais['codigo'] as $i => $valor) {
                    $dados = [
                        'servico_id' => $id_servico,
                        'tecnico_id' => $materiais['tecnico-historico'][$i],
                        'produto_id' => $valor,
                        'data' => $materiais['data_produto'][$i],
                        'quantidade' => Genericos::converterNumero($materiais['quantidade_produto'][$i]),
                        'valor' => Genericos::converterNumero($materiais['valor_produto'][$i]),
                        'observacao' => ''
                    ];

                    $this->inserir_bd1_servico_item(array_keys($dados), array_values($dados));
                }
            }
        }

        $trans->commit();
        
        return $id_servico;
    }
}