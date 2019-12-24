<template>
  <div>
    <b-field v-for="(campo, indexCampo) in formularioCriar" :key="indexCampo" :label="campo.label">
      <b-input
        v-model="$store.state[stateVar][indexCampo]"
        :type="campo.type"
        :placeholder="campo.placeholder"
        :required="campo.required"
        v-if="campo.type.toLowerCase() != 'datepicker' && campo.type.toLowerCase() != 'select'"
      ></b-input>

      <b-select
        v-model="$store.state[stateVar][indexCampo]"
        :placeholder="campo.placeholder"
        v-if="campo.type.toLowerCase() == 'select'"
      >
        {{ console.log('sou foda', campo) }}
        <option
          v-for="option in campo.options"
          :value="option.id"
          :key="option.id"
        >{{ option.name }}</option>
      </b-select>

       <datetime 
       v-if="campo.type.toLowerCase() == 'datepicker'"
       format="DD/MM/YYYY" 
       width="300px" 
       v-model="$store.state[stateVar][indexCampo]">
       </datetime>
      <!-- 
      <datepicker
        calendar-class="setPositionCalendar"
        input-class="input <datetime format="MM/DD/YYYY" width="300px" v-model="val"></datetime>te[stateVar][indexCampo]"
        v-model="$store.state[stateVar][indexCampo]"
      ></datepicker> -->
    </b-field>
  </div>
</template>

<script>
import datetime from 'vuejs-datetimepicker';

export default {
  name: "GerarCampos",
  components: {
    datetime
  },
  data: function() {
    return {
      console: console
    };
  },
  props: {
    formularioCriar: {
      type: Array,
      required: true,
      default: []
    },
    stateVar: {
      type: String,
      required: true,
      default: "not"
    }
  },
  mounted() {
    console.log("teste");
  }
};
</script>

<style>
.setPositionCalendar {
  position: fixed !important;
}
</style>