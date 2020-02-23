const autoPreFixer = require('autoprefixer')

module.exports = {
  plugins: [
    new autoPreFixer() //优化css代码,比如css加上不同类名
  ]
}