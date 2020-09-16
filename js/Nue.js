let CompilerUtil = {
  getValue(vm, value) {
    // 处理复合对象
    return value.split('.').reduce((data, currentKey) => {
      // 例如： data = { time: { h:11 } }
      // 第一次执行，data = $data, currentKey = time
      // 第二次执行，data = time, currentKey = h
      // trim()去掉空格，{{ name }}
      return data[currentKey.trim()]
    }, vm.$data)
  },
  getContent(vm, value) {
    let reg = /\{\{(.+?)\}\}/gi // {{ name }} -{{age}} => {{ Maxb }} - {{age}} => {{ Maxb }} - {{18}} 
    let val = value.replace(reg, (...args) => {
      // 第一次执行args[1] = name
      // 第一次执行args[1] = age
      // 匹配到多个时，会重复执行，直到替换所有
      return this.getValue(vm, args[1])
    })
    return val
  },
  setValue(vm, attr, newValue) {
    // 复合对象的处理
    attr.split('.').reduce((data, currentAttr, index, arr) => {
      if (index === arr.length - 1) {
        data[currentAttr] = newValue
      }
      return data[currentAttr]
    }, vm.$data)
  },
  // v-model
  model: function(node, value, vm) {
    // 第二部：在第一次渲染的时候就给所有的属性添加观察者
    new Watcher(vm, value, (newValue, oldValue) => {
      node.value = newValue
    })
    let val = this.getValue(vm, value)
    node.value = val
    // dom驱动数据变化
    node.addEventListener('input', (e) => {
      let newValue = e.target.value
      this.setValue(vm, value, newValue)
    })
  },
  // v-html
  html: function(node, value, vm) {
    new Watcher(vm, value, (newValue, oldValue) => {
      node.innerHTML = newValue
    })
    node.innerHTML = this.getValue(vm, value)
  },
  // v-text
  text: function(node, value, vm) {
    new Watcher(vm, value, (newValue, oldValue) => {
      node.innerText = newValue
    })
    node.innerText = this.getValue(vm, value)
  },
  // {{ }} -- {{  }}
  content: function(node, value, vm) {
    let reg = /\{\{(.+?)\}\}/gi
    // 由于可能出现{{ name }} -- {{ age }} 的情况，所以不能直接替换
    let val = value.replace(reg, (...args) => {
      new Watcher(vm, args[1], (newValue, oldValue) => {
        node.textContent = this.getContent(vm, value)
      })
      return this.getValue(vm, args[1])
    })
    // let val = this.getContent(vm, value)
    node.textContent= val
  },
  // on事件
  on: function(node, value, vm, type) {
    node.addEventListener(type, (e) => {
      vm.$methods[value] && vm.$methods[value].call(vm, e)
    })
  }
}

class Nue {
  constructor(options) {
    if (this.isElement(options.el)) {
      this.$el = options.el
    } else {
      this.$el = document.querySelector(options.el)
    }
    this.$data = options.data
    // 将data中的数据绑定到nue实例上
    this.proxyData()
    this.$methods = options.methods
    this.$computed = options.computed
    // 将computed中的属性都绑定到data中
    this.computedToData()
    if (this.$el) {
      // 监听外界传入的数据的变化
      new Observer(this.$data)
      new Compiler(this)
    }
  }

  isElement(node) {
    return node.nodeType === 1
  }
  proxyData() {
    for (const key in this.$data) {
      Object.defineProperty(this, key, {
        get: () => {
          return this.$data[key]
        }
      })
    }
  }
  computedToData() {
    for (const key in this.$computed) {
      Object.defineProperty(this.$data, key, {
        get: () => {
          return this.$computed[key].call(this)
        }
      })
    }
  }
}

class Compiler {
  constructor(vm) {
    this.vm = vm
    // 1.将网页上的元素放到内存中
    let fragment = this.node2fragment(this.vm.$el)
    // 2.利用指定的数据编译内存中的元素
    this.buildTemplate(fragment)
    // 3.将编译好的内容重新渲染到网页上
    this.vm.$el.appendChild(fragment)
  }

  node2fragment(app) {
    // 1.创建一个空的文档碎片对象
    let fragment = document.createDocumentFragment()
    // 2.编译循环取到每一个元素
    let node = app.firstChild;
    while (node) {
      // 注意点：只要将元素添加到了文档碎片对象中，那么这个元素就会从自动从网页上移除
      fragment.appendChild(node)
      node = app.firstChild
    }
    // 3.返回存储了所有元素的文档碎片对象
    return fragment
  }

  buildTemplate(fragment) {
    let nodeList = [...fragment.childNodes]
    nodeList.forEach(node => {
      // 需要判断当前遍历的节点是一个元素还是一个文本
      // 如果是元素，需要判断有没有v-model属性
      // 如果是一个文本，需要判断有没有 {{}}
      if (this.vm.isElement(node)) {
        this.buildElement(node)
        // 处理子元素（即处理后代）
        this.buildTemplate(node)
      } else {
        this.buildText(node)
      }
    })
  }

  buildElement(node) {
    let attrs = [...node.attributes]
    attrs.forEach(attr => {
      // v-model="name",  name = v-model, value = name
      // v-on:click = "myFn"  name=v-on:click, value = myFn
      let { name, value } = attr
      if (name.startsWith('v-')) { // v-model / v-html/ v-text
        let [directiveName, directiveType] = name.split(':')
        let [ , directive] = directiveName.split('-') // v-model => [v, model] / v-on => [ v, on ]
        CompilerUtil[directive](node, value, this.vm, directiveType)
      }
    })
  }

  buildText(node) {
    let content = node.textContent
    let reg = /{\{.+?\}\}/gi
    if (reg.test(content)) {
      CompilerUtil['content'](node, content, this.vm)
    }
  }
}

class Observer {
  constructor(data) {
    this.observer(data)
  }
  observer(obj) {
    if (obj && typeof obj === 'object') {
      // 遍历取出对象中所有的属性，并为他们增加get/set方法
      for (const key in obj) {
        this.defineReactive(obj, key, obj[key])
      }  
    }
  }
  defineReactive(obj, attr, value) {
    // 如果value的值也是一个对象，那么也需要给这个属性添加get/set方法
    this.observer(value)
    // 第三步：将当前属性的所有观察者对象都放到当前属性的发布订阅对象中管理起来
    let dep = new Dep()
    Object.defineProperty(obj, attr, {
      get() {
        // 添加观察者对象
        Dep.target && dep.addSub(Dep.target)
        return value
      },
      set: (newValue) => {
        if (newValue !== value) {
          // 如果新赋值的也是一个对象，需要给这个新赋值对象的所有属性添加get/set方法
          this.observer(newValue)
          value = newValue
          // 监听到了数据的变化
          dep.notify()
          console.log('监听到了数据的变化，去更新UI')
        }
      }
    })
  }
}

// 想要实现数据变化之后更新UI界面，我们可以用发布订阅模式来实现
// 先定义一个观察者类，再定义一个发布订阅类，然后再通过发布订阅的类来管理观察者类

class Dep {
  constructor() {
    // 定义一个数据，用来管理某个属性的所有观察者对象
    this.subs = []
  }
  // 订阅观察者的方法
  addSub(watcher) {
    this.subs.push(watcher)
  }
  // 发布订阅者的方法
  notify() {
    this.subs.forEach(watcher => watcher.update())
  }
}

class Watcher {
  constructor(vm, attr, callback) {
    this.vm = vm
    this.attr = attr
    this.callback = callback
    this.oldValue = this.getOldValue()
  }

  getOldValue() {
    Dep.target = this
    let oldValue = CompilerUtil.getValue(this.vm, this.attr)
    Dep.target = null
    return oldValue
  }

  // 定义一个更新的方法，用于判断一个新值和旧值是否相同
  update() {
    let newValue = CompilerUtil.getValue(this.vm, this.attr)
    if (newValue !== this.oldValue) {
      this.callback && this.callback(newValue, this.oldValue)
    }
  }

}