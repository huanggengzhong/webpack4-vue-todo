const path = require('path')
const webpack = require('webpack')
//vue编译
const {
  VueLoaderPlugin
} = require('vue-loader')
//在打包后生成一个HTML文件
const HtmlWebpackPlugin = require('html-webpack-plugin')
// 文本分离插件，分离js和css
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// 每次运行打包时清理过期文件
const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin');
// css模块资源优化插件
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');

//设置环境变量
const isDev = process.env.NODE_ENV === 'development';

const config = {
  target: 'web', //默认是'web',其它有些node平台
  entry: path.resolve(__dirname, 'src/index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [{
        test: /\.vue$/,
        use: 'vue-loader'
      },
      {
        test: /\.jsx$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.(jpg|png|jpeg|svg)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 1024, //如果文件大小小于1024字节，就会转义成base64,否则仍然是图片
            name: '[name].[ext]',
            outputPath: 'images/'
          }
        }]
      }
    ]
  },
  plugins: [ //插件
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({ //配置开发和发布构建的规则,vue和react都要配置
      'process.env': { //跟上面设置环境变量一样
        'NODE.ENV': isDev ? '"development"' : '"production"' //里面双引号,加了之后在js页面可以用process.env.NODE.ENV引用
      }
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: "index.html"
    }),
    new CleanWebpackPlugin()
  ],
  resolve: {
    alias: {
      c: path.resolve(__dirname, 'src/components'),
      p: path.resolve(__dirname, 'src/pages')
    },
    //寻找文件后缀
    extensions: ['.js', '.css', '.vue', '.scss']
  },
  optimization: {
    //对生成的CSS文件进行代码压缩 mode='production'时生效
    minimizer: [
      new OptimizeCssAssetsWebpackPlugin()
    ]
  }
}

//开发模式
if (isDev) {
  config.devtool = '#cheap-module-eval-source-map' //生产环境sourcemap
  config.devServer = {
      port: 8080,
      host: 'localhost',
      overlay: { //错误信息
        errors: true
      },
      open: false, //打开浏览器
      hot: true
    },
    config.plugins.push(
      new webpack.HotModuleReplacementPlugin(), //热加载模块
      new webpack.NoEmitOnErrorsPlugin() //减少我们不需要的信息的展示
    )
  //开发环境中使用scss
  config.module.rules.push({
    test: /\.scss$/,
    use: ['style-loader',
      'css-loader',
      'sass-loader',
      // 'postcss-loader'
      {
        loader: 'postcss-loader',
        options: {
          sourceMap: true
        }
      }
    ]
  })
} else {
  // 生产环境
  config.module.rules.push({
      test: /\.scss$/,
      use: [{
          loader: MiniCssExtractPlugin.loader, //生产环境js/css分离
          options: {
            publicPath: '../'
          }
        },
        'css-loader',
        {
          loader: 'sass-loader',
          options: {
            sourceMap: true
          }
        },
        'postcss-loader'
      ]
    }),
    config.plugins.push(
      new MiniCssExtractPlugin({ //为生产环境抽取出的独立的CSS文件设置配置参数
        filename: 'css/[name].css',
      })
    ),
    config.output.filename = 'js/[name].js'

}


module.exports = config