# (WIP) MFES

简单、功能强大的微前端解决方案。

## 快速入门

```
yarn add -D @mfes/webpack-plugin
```

该插件将微前端项目打包成 @mfes/loader 可以加载的模块。

```js
const MfesPlugin = require('@mfes/webpack-plugin')

module.exports = {
  devServer: MfesPlugin.devServerConfig(8090),
  configureWebpack: {
    plugins: [
      new MfesPlugin({
        name: '@vue2/shell',
        shared: { // 共享依赖，其他项目可以共享这些模块，无需重复下载
          vue: 'https://cdn.jsdelivr.net/npm/vue@2.6.12/dist/vue.runtime.js',
          vuex: 'https://cdn.jsdelivr.net/npm/vuex@3.6.0/dist/vuex.js',
          'vue-router': 'https://cdn.jsdelivr.net/npm/vue-router@3.4.9/dist/vue-router.js',
          '@vue2/module1': 'http://localhost:8091/remoteEntry.js',
          '@vue2/utils1': 'http://localhost:8092/remoteEntry.js'
        },
        // filename: 'remoteEntry.js' // 最终的入口文件名，默认叫 remoteEntry.js
      })
    ]
  }
}
```

其中输出的 `remoteEntry.js` 文件为入口文件，体积很小，**不应该缓存这个文件**，否则可能不能加载正确的项目文件。

项目入口文件中一般都为如下内容

```js
__webpack_public_path__ ='http://localhost:8090/' // 设置 public path
import('./boot') // 动态加载主代码
```

在 HTML 文件中需要加载 loader 代码。

```html
<script src="https://cdn.jsdelivr.net/npm/@mfes/loader@0.0.1/dist/index.js"></script>
```

最后在项目中动态加载其他微前端项目。

```js
// 第二个参数是获取，项目中导出的字段名，如果为 true 将会导出 default 字段
System.import('@vue2/module1', true).then((m) => {
  m('#module1') // m 为其他项目
})
```

### 公共工具

项目中可能有很多通用代码，对于这种工具项目，只需要修改以下 webpack 插件代码

```js
new MfesPlugin() // 什么参数都不传
new MfesPlugin({ utils: true }) // 或者 utils 设置为 true
```

## 例子

详细例子请看 `examples` 文件夹
