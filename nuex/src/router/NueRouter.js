class NueRouterInfo {
  constructor() {
    this.currentPath = null
  }
}

class NueRouter {
  constructor(options) {
    this.mode = options.mode || 'hash';
    this.routes = options.routes || []
    this.routesMap = this.createRoutesMap()
    this.routerInfo = new NueRouterInfo()
    this.initDefault()
  }

  initDefault() {
    if (this.mode === 'hash') {
      if (!location.hash) {
        location.hash = '/'
      }

      window.addEventListener('load', () => {
        this.routerInfo.currentPath = location.hash.slice(1)
      })
      // 监听返回，路由变化
      window.addEventListener('hashchange', () => {
        this.routerInfo.currentPath = location.hash.slice(1)
      })

    } else {
      if (!location.pathname) {
        location.pathname = '/'
      }
      window.addEventListener('load', () => {
        this.routerInfo.currentPath = location.pathname
        console.log(this.routerInfo)
      })
      // 监听返回，路由变化
      window.addEventListener('popstate', () => {
        this.routerInfo.currentPath = location.pathname
      })
    }
  }

  createRoutesMap() {
    return this.routes.reduce((map, route) => {
      map[route.path] = route.component
      return map
    }, {})
  }
}

NueRouter.install = (Vue, options) => {
  Vue.mixin({
    beforeCreate() {
      if (this.$options && this.$options.router) {
        this.$router = this.$options.router
        this.$route = this.$router.routerInfo
        Vue.util.defineReactive(this, 'xxx', this.$router)
      } else {
        this.$router = this.$parent.$router
        this.$route = this.$router.routerInfo
      }
    }
  })

  Vue.component('router-link', {
    props: {
      to: String
    },
    render() {
      let path = this.to
      if (this._self.$router.mode === 'hash') {
        path = '#' + path
      }
      return <a href={path}>{this.$slots.default}</a>
    },
  })

  Vue.component('router-view', {
    render(h) {
      // 注意路由变化的时候，是组件先渲染的，currentPath才变化，会出现首次渲染的时候，拿不到currentPath，所以要将this.$router变成双向绑定数据
      let routesMap = this._self.$router.routesMap
      let currentPath = this._self.$route.currentPath
      let currentComponent = routesMap[currentPath]
      return h(currentComponent)
    },
  })
}

export default NueRouter