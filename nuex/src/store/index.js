import Vue from 'vue'
// import Vuex from './Nuex'
import Vuex from 'vuex'

Vue.use(Vuex)

let home = {
  state: {
    name: 'qfl'
  },
  getters: {
    // 注意： 各子模块的getters中，不能出现同名的方法
    getHomeName(state) {
      return state.name + 'home'
    }
  },
  mutations: {
    homeChangeName(state, payload) {
      state.name += payload
    }
  },
  actions: {
    asynChangeHomeName({ commit }, payload) {
      setTimeout(() => {
        commit('homeChangeName', payload)
      }, 1000);
    }
  },
  modules: {
    // 子模块中还可以嵌套子模块
  }
}

export default new Vuex.Store({
  /*
    注意：各个模块中getters的方法不能同名，因为this.$store后面可以不用盯上各个模块 
    多个模块中mutations， actions中可以出现同名的方法，不会覆盖，会放在数组中依次执行
  */ 
  state: {
    name: 'Maxb',
    num: 0,
    age: 18
  },
  // 用于同步修改共享数据
  mutations: {
    addNum(state, payload) {
      state.num += payload
    },
    addAge(state, payload) {
      state.age += payload
    }
  },
  // 用于异步步修改共享数据
  actions: {
    asynAddAge({ commit }, payload) {
      setTimeout(() => {
        commit('addAge', payload)
      }, 2000)
    }
  },
  // 模块化共享数据，解决命名匮乏的问题，同一个属性在每个模块共享，但取值不一样
  modules: {
    home: home
  }
})
