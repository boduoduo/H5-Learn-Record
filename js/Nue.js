class Nue {
  constructor(options) {
    if (this.isElement(options.el)) {
      this.$el = options.el
    } else {
      this.$el = document.querySelector(options.el)
    }
    this.$data = options.data
  }

  isElement(node) {
    return node.nodeType === 1
  }
}