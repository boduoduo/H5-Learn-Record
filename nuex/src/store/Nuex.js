import Vue from 'vue'

// install方法会在外界调用Vue.use的时候执行
const install = (Vue, options) => {
  // 给每一个Vue实例，都添加一个$store属性
  /*
  在Vue中有个mixin方法，这个方法会在创建每一个Vue实例的时候执行
  */
  Vue.mixin({
    beforeCreate() {
      // Vue在创建实例的时候会先创建父组件，再创建子组件
      if (this.$options && this.$options.store) {
        this.$store = this.$options.store
      } else {
        // 子组件的$store继承自父组件
        this.$store = this.$parent.$store
      }
    },
  })
}

class ModuleCollection {
  constructor(rootModule) {
    this.register([], rootModule)
  }

  register(arr, rootModule) {
    let module = {
      _raw: rootModule,
      _state: rootModule.state,
      children: {}
    }
    // 保存模块信息
    if (arr.length === 0) {
      this.root = module
    } else {
      // [a, b, c] => [a, b]
      let parent = arr.splice(0, arr.length-1).reduce((root, currentKey) => {
        return root._children[currentKey]
      }, this.root)
      parent._children[arr[arr.length-1]] = module
    }

    for (const childrenModuleName in rootModule.modules) {
      let childrenModule = rootModule.modules[childrenModuleName]
      this.register(arr.concat(childrenModuleName), childrenModule)
    }
  }
}

class Store {
  constructor(options) {
    // 将传递进来的state放在Store当中
    // this.state = options.state
    /*
      Vue中的有个util的工具类，util中有个defineReactive方法，可以快速将某个数据变为双向绑定的数据
      接受三个参数：
      1.给那个对象添加
      2.给对象添加哪个属性
      3.给这个属性添加哪个具体的值
    */ 
    Vue.util.defineReactive(this, 'state', options.state)
    // 处理模块信息
    this.modules = new ModuleCollection(options)
    this.initModules([], this.modules.root)
    /* 
      let root = {
        _raw: rootModule,
        _state: rootModule.state,
        children: {
          home: {
            _raw: homeModule,
            _state: homeModule.state,
            children: {

            }
          },
          account: {
            _raw: accountModule,
            _state: accountModule.state,
            children: {
              login: {

              }
            }
          }
        }
      }
    */  
  }

  initModules(arr, rootModule) {
    if (arr.length > 0) {
      let parent = arr.splice(0, arr.length-1).reduce((state, currentKey) => {
        return state[currentKey]
      }, this.state)
      Vue.set(parent, arr[arr.length-1], rootModule._state)
    }
    // 将传递进来的getters放到Store当中
    this.initGetters(rootModule._raw)
    // 存放Mutations
    this.initMutations(rootModule._raw)
    // 存放Actions
    this.initActions(rootModule._raw)
    for (const childrenModuleName in rootModule._children) {
      let childrenModule = rootModule._children[childrenModuleName]
      this.initModules(arr.concat(childrenModuleName), childrenModule)
    }
  }

  initGetters(options) {
    let getters = options.getters || {}
    this.getters = this.getters || {}
    for (const key in getters) {
      Object.defineProperty(this.getters, key, {
        get: () => {
          return getters[key](options.state)
        }
      })
    }
  }

  // 用箭头函数，是因为外界调用commit的时候，是没有指向this的
  commit = (type, payload) => {
    this.mutations[type].forEach(fn => fn(payload))
  }

  dispatch = (type, payload) => {
    this.actions[type].forEach(fn => fn(payload))
  }

  initMutations(options) {
    let mutations = options.mutations || {}
    this.mutations = this.mutations || {}
    for (const key in mutations) {
      this.mutations[key] = this.mutations[key] || []
      this.mutations[key].push((playload) => {
        mutations[key](options.state, playload)
      })
    }
  }

  initActions(options) {
    let actions = options.actions || {}
    this.actions = this.actions || {}
    for (const key in actions) {
      this.actions[key] = this.actions[key] || []
      this.actions[key].push((payload) => {
        // 外界会从this中，解构出commit
        actions[key](this, payload)
      }) 
    }
  }

}

export default {
  install,
  Store
}