const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  outputDir: 'dist',
  assetsDir: 'static',
  configureWebpack: {
    devtool: process.env.NODE_ENV === 'development' ? 'eval-source-map' : false
  }
})
