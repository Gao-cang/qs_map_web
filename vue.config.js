const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 8086, // 指定前端开发服务器的端口
    proxy: {
      '/api': { // 匹配所有以 /api 开头的请求
        target: 'http://localhost:8085', // 后端服务地址
        changeOrigin: true, // 是否改变源地址，设置为true，服务器收到的请求头中的host会是目标target的host
        ws: true, // 如果后端支持websocket，则设置为true
        pathRewrite: {
           '^/api': '' // 如果后端API路径不包含 /api 前缀，则需要重写路径，例如将 /api/stations 重写为 /stations
          // 如果后端API路径本身就是 /api/stations，则不需要 pathRewrite 或设置 '^/api': '/api'
        }
      }
    }
  }
})
