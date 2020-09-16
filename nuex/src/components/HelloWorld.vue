<template>
  <div class="hello">
    <p>{{ this.$store.state.name }}</p>
    <p>num: {{ this.$store.state.num }}</p>
    <p>age: {{ this.$store.state.age }}</p>
    <button @click="addNum">AddNum</button> <br>
    <button @click="addAge">AsynAddAge</button>
    <hr>

    <p>{{ this.$store.state.home.name }}</p>
    <!-- 注意：各个模块中getters的方法不能同名，因为this.$store后面可以不用盯上各个模块 
              多个模块中mutations， actions中可以出现同名的方法，不会覆盖，会放在数组中依次执行
    -->
    <p>{{ this.$store.getters.getHomeName }}</p>
    <button @click="homeChangeName">ChangeName</button>
    <button @click="asynHomeChangeName">AsynchangeName</button>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  mounted() {
    console.log(this.$store, 'Hello World')
  },
  methods: {
    addNum() {
      this.$store.commit('addNum', 10)
    },
    addAge() {
      this.$store.dispatch('asynAddAge', 10)
    },
    homeChangeName() {
      this.$store.commit('homeChangeName', 'HAHAHA')
    },
    asynHomeChangeName() {
      this.$store.dispatch('asynChangeHomeName', 'MMMMM')
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
