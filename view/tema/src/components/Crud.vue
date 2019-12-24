<template>
  <section>
    <b-button @click="iniciarCriacao" v-if="opcoesDefault.criar" type="is-success">
      Adicionar
      <b-icon icon="plus-box" size="is-small" />
    </b-button>

    <b-table
      ref="b-table"
      :data="dadosTabela"
      :loading="loading"
      paginated
      backend-pagination
      :total="opcoesDefault.total"
      :per-page="opcoesDefault.perPage"
      @page-change="onPageChange"
      aria-next-label="Next page"
      aria-previous-label="Previous page"
      aria-page-label="Page"
      aria-current-label="Current page"
      backend-sorting
      :default-sort-direction="opcoesDefault.defaultSortOrder"
      :default-sort="[opcoesDefault.sortField, opcoesDefault.sortOrder]"
      @sort="onSort"
    >
      <template slot-scope="props">
        <b-table-column
          v-for="(dadosTabelaLaco, index) in props.row.labels"
          :key="index"
          :field="props.row.configs[index].campoOriginal"
          :label="dadosTabelaLaco"
          :sortable="props.row.configs[index].ordenar"
        >
          <template slot="header" slot-scope="{ column }">
            {{ column.label }}
            <div
              class="field is-floating-label is-grouped pesquisa"
              v-if="!opcoesDefault.semPesquisa"
            >
              <div class="field" v-if="props.row.configs[index].pesquisa.ativo">
                <div class="control is-clearfix">
                  <input
                    v-model="filtros[index]"
                    @click="$event.stopPropagation()"
                    v-on:keyup.enter="verFiltros(props.row.configs, $event)"
                    type="text"
                    class="input"
                  />
                </div>
              </div>
              <p class="control">
                <button
                  class="button"
                  style="margin-right: 3px;"
                  @click="verFiltros(props.row.configs, $event)"
                  v-if="(index + 1) == props.row.labels.length"
                >Buscar</button>

                <button
                  class="button"
                  @click="limparPesquisa"
                  v-if="(index + 1) == props.row.labels.length && pesquisa.length > 0"
                >Limpar</button>
              </p>
            </div>
          </template>
          {{ props.row.dadosMostrar[index] }}
        </b-table-column>

        <b-table-column
          v-if="(opcoesDefault.deletar || opcoesDefault.editar) && dadosTabela[0].dados.length > 0"
          :field="''"
          :label="''"
        >
          <b-button
            @click="editarRegistro(props.row.configs[getPosicaoBotoesDeletarEditar(props)], getPosicaoBotoesDeletarEditar(props), props.row)"
            :disabled="!(props.row.configs[getPosicaoBotoesDeletarEditar(props)].editar)"
            v-if="opcoesDefault.editar"
            type="is-success"
          >
            <b-icon icon="square-edit-outline" size="is-small" />
          </b-button>

          <b-button
            @click="deletarRegistro(props.row.configs[getPosicaoBotoesDeletarEditar(props)], getPosicaoBotoesDeletarEditar(props), props.row)"
            :disabled="!(props.row.configs[getPosicaoBotoesDeletarEditar(props)].deletar)"
            v-if="opcoesDefault.deletar"
            type="is-danger"
          >
            <b-icon icon="delete" size="is-small" />
          </b-button>
        </b-table-column>
      </template>

      <template slot="empty">
        <section class="section">
          <div class="content has-text-grey has-text-centered">
            <p>
              <b-icon icon="emoticon-sad" size="is-large"></b-icon>
            </p>
            <p>Nada Encontrado</p>
          </div>
        </section>
      </template>
    </b-table>

    <b-modal @close="isEditando = false" :active.sync="isEditando" has-modal-card>
      <form action>
        <div class="modal-card" style="width: auto">
          <header class="modal-card-head">
            <p class="modal-card-title">Editar</p>
          </header>
          <section class="modal-card-body modal-editar">
            <GerarCampos :formularioCriar="formularioEditar" stateVar="modelCamposFormulario" />
          </section>
          <footer class="modal-card-foot">
            <button class="button" type="button" @click="isEditando = false">Cancelar</button>
            <button
              :disabled="!editarLiberado"
              class="button is-success"
              @click="salvarEdicao"
            >Salvar</button>
          </footer>
          <b-loading :is-full-page="false" :active.sync="isLoadingEditando" :can-cancel="false"></b-loading>
        </div>
      </form>
    </b-modal>

    <b-modal @close="isCriando = false" :active.sync="isCriando" has-modal-card>
      <form action>
        <div class="modal-card" style="width: auto">
          <header class="modal-card-head">
            <p class="modal-card-title">Criar</p>
          </header>
          <section class="modal-card-body modal-criar">
            <GerarCampos :formularioCriar="formularioCriar" stateVar="modelCamposFormularioCriar" />
          </section>
          <footer class="modal-card-foot">
            <button class="button" type="button" @click="isCriando = false">Cancelar</button>
            <button :disabled="!criarLiberado" class="button is-success" @click="salvarCriar">Salvar</button>
          </footer>
          <b-loading :is-full-page="false" :active.sync="isLoadingCriando" :can-cancel="false"></b-loading>
        </div>
      </form>
    </b-modal>
    
  </section>
  
</template>

<script>
import * as diff from "fast-array-diff";
import { mapState } from "vuex";

import ModalConfirm from "./ModalConfirm";
import GerarCampos from "./GerarCampos";
import serializerQuery from "../utils/serializeQuery.js";

var posicaoPropsEditarDeletar = -1;

export default {
  name: "Crud",
  components: {
    ModalConfirm,
    GerarCampos
  },
  data: function() {
    return {
      dadosTabela: [],
      opcoesDefault: {
        chavePrimaria: "id",
        editarPrimaria: false,
        edicaoInline: true,
        criacaoInline: true,
        rotaParaEditar: "",
        rotaParaCriar: "",
        total: 0,
        loading: false,
        sortField: "",
        sortOrder: "desc", // do your stuff
        defaultSortOrder: "desc",
        page: 1,
        perPage: 50,
        semPesquisa: false,
        paginar: false,
        criar: true,
        editar: true,
        deletar: true,
        perguntarDeletar: true,
        tituloPerguntaDeletar: "Deletar %titulo",
        corpoPerguntaDeletar: "Você deseja deletar o registro %valor?"
      },
      loading: false,
      filtros: [],
      pesquisa: "",
      isEditando: false,
      isCriando: false,
      primariaEditando: "",
      formularioEditar: [],
      formularioCriar: [],
      editarLiberado: false,
      criarLiberado: false,
      chavePrimariaEditar: {},
      isLoadingEditando: false,
      isLoadingCriando: false
    };
  },
  props: {
    baseUrl: {
      type: String,
      default: ""
    },
    urlListar: {
      type: String,
      default: "listar",
      required: false
    },
    urlDeletar: {
      type: String,
      default: "deletar",
      required: false
    },
    urlAtualizar: {
      type: String,
      default: "atualizar",
      required: false
    },
    urlAdicionar: {
      type: String,
      default: "adicionar",
      required: false
    },
    dados: {
      type: Object,
      default: () => {
        return {};
      },
      required: false
    },
    configs: {
      type: Object,
      default: () => {
        return {};
      },
      required: true
    },
    opcoes: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  methods: {
    console(dados) {
      console.log(dados);
    },
    checkVazio() {
      const dadosTabelaVerificar = this.dadosTabela;

      if (typeof dadosTabelaVerificar[0] == "undefined") return false;

      const retornar = dadosTabelaVerificar[0].dados.length == 0;

      if (retornar) {
        setTimeout(() => {
          this.dadosTabela = [];
        }, 250);
      }

      return retornar;
    },
    getPosicaoBotoesDeletarEditar(props) {
      const posicaoMaximaPropsRow = props.row.configs.length - 1;

      if (props.index > posicaoMaximaPropsRow) {
        if (posicaoPropsEditarDeletar >= posicaoMaximaPropsRow) {
          posicaoPropsEditarDeletar = -1;
        }

        posicaoPropsEditarDeletar++;
        return posicaoPropsEditarDeletar;
      }

      return props.index;
    },
    salvarEdicao(event) {
      const jsonAtualizar = {};

      this.formularioEditar.forEach((item, index) => {
        let valor = this.$store.state.modelCamposFormulario[index];
        if (!isNaN(valor)) valor = parseFloat(valor);

        if (typeof valor.indexOf == "function") {
          if (valor.indexOf("/") != -1) {
            let [dia, mes, ano] = valor.split("/");

            valor = ano + "-" + mes + "-" + dia;
          }
        }

        jsonAtualizar[item.name] = valor;
      });

      const chavePrimaria = this.chavePrimariaEditar;
      jsonAtualizar[chavePrimaria.chave] = chavePrimaria.valor;

      this.isLoadingEditando = true;
      this.editarLiberado = false;

      this.urlAtualizar = this.urlAtualizar.replace(
        "{id}",
        `${chavePrimaria.valor}`
      );

      this.$network
        .connect({
          url: this.urlAtualizar,
          method: "PUT",
          data: JSON.stringify(jsonAtualizar),
          headers: {
            "Content-Type": "application/json"
          }
        })
        .then(response => {
          if (response.status == 200) {
            //console.log("ok", response.data);
            this.isEditando = false;
            this.isLoadingEditando = false;
            this.loadAsyncData();
          }
        })
        .catch(error => {
          this.$swal.fire({
            type: "error",
            title: "Oops...",
            text: "Erro ao atualizar registro!",
            footer: ""
          });
          console.log(error);
          this.isLoadingEditando = false;
          this.editarLiberado = true;
        });

      event.preventDefault();
    },
    iniciarCriacao(event) {
      //console.log(this);
      if (!this.opcoesDefault.criacaoInline) {
        this.$router.push(this.opcoesDefault.rotaParaCriar);
        return;
      }

      const dadosLinha = this.ajustarLinha(this.configs, true);
      this.formularioCriar = [];
      var contadorCamposCriar = 0;

      dadosLinha.configs.forEach((item, index) => {
        if (
          !(
            item.campoOriginal == this.opcoesDefault.chavePrimaria &&
            !this.opcoesDefault.editarPrimaria
          )
        ) {
          this.formularioCriar.push({
            name: item.campoOriginal,
            label: item.label,
            type: item.tipoCampo,
            placeholder: item.placeholder,
            required: item.required,
            options: item.options
          });

          this.$store.commit("setModelCamposFormulariosCriar", {
            chave: contadorCamposCriar,
            valor: ""
          });

          contadorCamposCriar++;
        }
      });

      this.isCriando = true;
      this.criarLiberado = true;
    },
    salvarCriar(event) {
      const jsonCriar = {};

      this.formularioCriar.forEach((item, index) => {
        let valor = this.$store.state.modelCamposFormularioCriar[index];
        if (!isNaN(valor)) valor = parseFloat(valor);

        if (typeof valor.indexOf == "function") {
          if (valor.indexOf("/") != -1) {
            let [dia, mes, ano] = valor.split("/");

            valor = ano + "-" + mes + "-" + dia;
          }
        }

        jsonCriar[item.name] = valor;
      });

      this.isLoadingCriando = true;
      this.criarLiberado = false;

      this.$network
        .connect({
          url: this.urlAdicionar,
          method: "POST",
          data: JSON.stringify(jsonCriar),
          headers: {
            "Content-Type": "application/json"
          }
        })
        .then(response => {
          if (response.status == 200) {
            //console.log("ok", response.data);
            this.isCriando = false;
            this.isLoadingCriando = false;
            this.loadAsyncData();
          }
          this.criarLiberado = true;
        })
        .catch(error => {
          this.$swal.fire({
            type: "error",
            title: "Oops...",
            text: "Erro ao criar o registro!",
            footer: ""
          });
          console.log(error);
          this.isLoadingCriando = false;
          this.criarLiberado = true;
        });
      event.preventDefault();
    },
    deletarRegistro(dados, index, dadosLinha) {
      const params = {};
      params[this.opcoesDefault.chavePrimaria] = dados.primaria;
      //console.log(params);
      const swalWithBootstrapButtons = this.$swal.mixin({
        customClass: {
          confirmButton: "btn btn-success",
          cancelButton: "btn btn-danger"
        },
        buttonsStyling: false
      });

      swalWithBootstrapButtons
        .fire({
          title: this.titulorequiredPerguntaDeletar,
          text: this.corpoPerguntaDeletar,
          type: "warning",
          showCancelButton: true,
          confirmButtonText: "Remover",
          cancelButtonText: "Cancelar",
          reverseButtons: true,
          customClass: {
            confirmButton: "button is-danger",
            cancelButton: "button is-default"
          }
        })
        .then(result => {
          if (result.value) {
            swalWithBootstrapButtons.showLoading();
            this.urlDeletar = this.urlDeletar.replace(
              "{id}",
              `${dados.primaria}`
            );
            this.$network
              .connect({
                url: this.urlDeletar,
                method: "DELETE",
                data: params,
                headers: {
                  "Content-Type": "application/json"
                }
              })
              .then(response => {
                if (response.status == 200) {
                  //console.log("ok", response.data);
                  swalWithBootstrapButtons.hideLoading();
                  swalWithBootstrapButtons.fire(
                    "Deletado",
                    "Seu registro foi deletado com sucesso",
                    "button is-success"
                  );
                  this.loadAsyncData();
                }
              })
              .catch(error => {
                swalWithBootstrapButtons.hideLoading();
                swalWithBootstrapButtons.fire({
                  type: "error",
                  title: "Oops...",
                  text: "Erro ao deletar registro!",
                  footer: ""
                });
                console.log(error);
              });
          }
        });
    },
    editarRegistro(dados, index, dadosLinha) {
      
      if (!this.opcoesDefault.edicaoInline) {
        let rotaEditar = this.opcoesDefault.rotaParaEditar;
        let substituir = rotaEditar.match(/{([^}]+)}/g);
        
        if(substituir != null) {
          substituir.forEach((flag) => {
            let flagAjustada = flag.replace(/({|})/g, '');
            let valor = dadosLinha.configs.map((item, i) => {
              if(item.campoOriginal == flagAjustada) {
                return dadosLinha.dadosMostrar[i]
              }
               
            }).filter((item) => item != undefined);

            if(valor.length > 0) {
              rotaEditar = rotaEditar.replace(flag, valor);
            }
          })
        }

        this.$router.push({
          path: rotaEditar, 
          params: {
            dados, 
            index, 
            dadosLinha
          }
        });
        return;
      }

      this.formularioEditar = [];
      var contadorCampos = 0;

      dadosLinha.configs.forEach((item, index) => {
        if (
          !(
            item.campoOriginal == this.opcoesDefault.chavePrimaria &&
            !this.opcoesDefault.editarPrimaria
          )
        ) {
          this.formularioEditar.push({
            name: item.campoOriginal,
            label: item.label,
            type: item.tipoCampo,
            placeholder: item.placeholder,
            required: item.required,
            options: item.options
          });

          this.$store.commit("setModelCamposFormularios", {
            chave: contadorCampos,
            valor: dadosLinha.dados[index]
          });

          contadorCampos++;
        } else {
          this.chavePrimariaEditar = {
            chave: item.campoOriginal,
            valor: dadosLinha.dados[index]
          };
        }
      });

      this.primariaEditando = dados.primaria;
      this.isEditando = true;
    },
    verFiltros(configs, event) {
      const comparadores = {
        "=": "i",
        like: "li",
        "<>": "diff",
        ">=": "maq",
        "<=": "meq"
      };
      const query = {};

      this.filtros.forEach((busca, index) => {
        const dadosBusca = configs[index];
        const configsPesquisa = dadosBusca.pesquisa;

        if (configsPesquisa.ativo) {
          let comparador = comparadores[configsPesquisa.tipoComparador];

          if (typeof comparador == "undefined") comparador = comparadores["="];

          if (busca.length > 0) {
            query[dadosBusca.campoOriginal] = {
              valor: busca,
              comparador: comparador,
              logico: "a"
            };
          }
        }
      });

      if (Object.keys(query).length > 0) {
        this.pesquisa = serializerQuery(query);
        this.loadAsyncData();
      }

      event.stopPropagation();
    },
    limparPesquisa(event) {
      this.filtros.forEach((busca, index) => {
        this.filtros[index] = "";
      });

      this.pesquisa = "";
      event.stopPropagation();
      this.$refs["b-table"].$forceUpdate();
      this.loadAsyncData();
    },
    ajustarLinha(item, retornarSomenteConfig) {
      let retornar = {
        labels: [],
        dados: [],
        dadosMostrar: [],
        configs: []
      };

      let primaria = "";

      Object.keys(item).forEach((chave, index) => {
        let dadosConfig = this.configs[chave];
        dadosConfig = dadosConfig == undefined ? {} : dadosConfig;
        let label = chave;
        let linha = item[chave];
        var linhaMostrar = linha;
        const configDefault = {
          label: chave,
          tipoPesquisa: "input",
          dadosOption: {},
          editar: true,
          deletar: true,
          required: false,
          tipoCampo: typeof linha == "string" ? "text" : typeof linha,
          placeholder: "",
          pesquisa: {
            ativo: true,
            tipoComparador: "=", // = -> igual, <> -> diferente, > -> maior que, < -> menor que,
            valorDefault: ""
          },
          ordenar: true
        };

        if (chave == this.opcoesDefault.chavePrimaria) {
          primaria = linha;
        }

        dadosConfig.pesquisa = Object.assign(
          configDefault.pesquisa,
          dadosConfig.pesquisa
        );
        dadosConfig = Object.assign(configDefault, dadosConfig);
        dadosConfig.campoOriginal = chave;

        if (typeof dadosConfig.primaria == "undefined") {
          dadosConfig.primaria = primaria;
        }

        label = dadosConfig.label;
        var linhaMostrar = linha;

        if (typeof dadosConfig.funcaoExec == "function") {
          linhaMostrar = dadosConfig.funcaoExec(linha, chave, item);
        }

        if (typeof dadosConfig.funcaoExecField == "function") {
          linha = dadosConfig.funcaoExecField(linha, chave, item);
        }

        retornar.labels.push(label);
        retornar.dados.push(linha);
        retornar.dadosMostrar.push(linhaMostrar);
        retornar.configs.push(dadosConfig);

        if (retornarSomenteConfig != true)
          this.filtros[index] = dadosConfig.pesquisa.valorDefault;
      });
      //console.log(retornar);
      return retornar;
    },
    /*
     * Load async datamodal-editar
     */
    loadAsyncData() {
      let params = [];
      let urlListar = this.baseUrl + '' + this.urlListar;

      if(this.pesquisa.length > 0) {
          //console.log(this.pesquisa)
          params.push(this.pesquisa)
      }

      if(this.opcoesDefault.sortField.length > 0) {
          params.push(`query[ordem][${this.opcoesDefault.sortField}]=${this.opcoesDefault.sortOrder}`)
      }

      var camposRetornar = [];
      Object.keys(this.configs).forEach((item) => {
          camposRetornar.push(`campos[]=${item}`);
      })

      params.push(camposRetornar.join('&'))

      if(params.length > 0) {
          params = params.join('&');

          urlListar += `?${params}`
      }

      this.dadosTabela = [];

      this.loading = true;
      
      this.$network.connect({
          url: urlListar,
      }).then((response) => {
          if(response.status == 200) {
              const dados = response.data.data;
              
              this.opcoesDefault.perPage = dados.max_por_pag;
              this.opcoesDefault.total = dados.registros_totais;

              dados.dados.forEach((item) => {
                  item = this.ajustarLinha(item)
                  this.dadosTabela.push(item)
              })

              this.loading = false
          }
      }).catch((error) => {
          const item = this.ajustarLinha(this.configs, true);
          item.dados = [];
          this.dadosTabela.push(item)
          this.checkVazio();
          this.loading = false
      })
    },
    /*
     * Handle page-change event
     */
    onPageChange(page) {
      this.opcoesDefault.page = page;
      this.loadAsyncData();
    },
    /*
     * Handle sort event
     */
    onSort(field, order, event) {
      this.opcoesDefault.sortField = field;
      this.opcoesDefault.sortOrder = order;
      this.loadAsyncData();
    }
  },
  watch: {
    "$store.state.modelCamposFormulario"(to, yep, yep2) {
      const comparar = diff.same(
        to,
        this.$store.state.modelCamposFormularioComparar
      );

      if (
        comparar.length ==
        this.$store.state.modelCamposFormularioComparar.length
      ) {
        this.editarLiberado = false;
        return;
      }

      this.editarLiberado = true;
    },
    isEditando(to) {
      this.editarLiberado = false;

      this.$store.commit("setModelCamposFormulariosComparar", {
        chave: -1,
        valor: JSON.parse(
          JSON.stringify(this.$store.state.modelCamposFormulario)
        )
      });

      setTimeout(() => {
        if (to) {
          const element = document.querySelector(".modal-editar");
          element.querySelector("input, select").select();
        }
      }, 400);
    },
    isCriando(to) {
      setTimeout(() => {
        if (to) {
          const element = document.querySelector(".modal-criar");
          element.querySelector("input, select").select();
        }
      }, 400);
    }
  },
  filters: {
    /**
     * Filter to truncate string, accepts a length parameter
     */
    truncate(value, length) {
      return value.length > length ? value.substr(0, length) + "..." : value;
    }
  },
  mounted() {
    this.opcoesDefault = Object.assign(
      JSON.parse(JSON.stringify(this.opcoesDefault)),
      JSON.parse(JSON.stringify(this.opcoes))
    );
    
    this.loadAsyncData();
  }
};
</script>