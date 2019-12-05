<template>
    <b-modal @close="close" :active.sync="ativar" has-modal-card>
                  <form action="">
                <div class="modal-card" style="width: auto">
                    <header class="modal-card-head">
                        <p class="modal-card-title">{{ titulo }}</p>
                    </header>
                    <section class="modal-card-body">
                        <b-field label="Email">
                            <b-input
                                type="email"
                                placeholder="Your email"
                                required>
                            </b-input>
                        </b-field>

                        <b-field label="Password">
                            <b-input
                                type="password"
                                password-reveal
                                placeholder="Your password"
                                required>
                            </b-input>
                        </b-field>

                        <b-checkbox>Remember me</b-checkbox>
                    </section>
                    <footer class="modal-card-foot">
                        <button class="button" type="button" @click="$parent.close()">Close</button>
                        <button class="button is-primary">Login</button>
                    </footer>
                </div>
            </form>
    </b-modal>
</template>

<script>

export default {
    name: 'ModalConfirm',
    data: function() {
        return {
            ativar: false,
        }
    },
    methods: {
        closado() {
            this.close();
            return this.close
        }
    },
    props: {
        ativo: {
            type: Boolean,
            default: false
        },
        close: {
            type: Function,
            default: () => {}
        },
        titulo: {
            type: String,
            default: 'Confirmar',
        }
    },
    mounted() {
        this.ativar = this.ativo;
    }
}
</script>