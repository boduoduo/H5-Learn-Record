<template>
  <div id="app">
    <!-- <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <a href="#home">首页</a>
    <a href="#about">关于</a>
    <router-link to="/home">Home</router-link>
    |
    <router-link to="/about">About</router-link>
    <router-view></router-view>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import Home from './views/Home'
import About from './views/About'

export default {
  name: 'App',
  components: {
    HelloWorld,
    Home,
    About
  }
}
</script>

<style>

</style>
