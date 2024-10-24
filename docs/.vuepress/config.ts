import {webpackBundler} from '@vuepress/bundler-webpack'
import {defineUserConfig} from 'vuepress'
import {plumeTheme} from 'vuepress-theme-plume'

export default defineUserConfig({
  base: '/',
  lang: 'zh-CN',
  title: 'Hao Blog',
  description: 'Hao Blog',

  bundler: webpackBundler(),

  theme: plumeTheme({
    // 添加您的部署域名
    // hostname: 'https://your_site_url',

    // 配置侧边栏
    sidebar: {
      '/': "auto"
    },

    plugins: {
      /**
       * Shiki 代码高亮
       * @see https://theme-plume.vuejs.press/config/plugins/code-highlight/
       */
      shiki: {
        // 强烈建议预设代码块高亮语言，插件默认加载所有语言会产生不必要的时间开销
        languages: ["js", "ts", "html", "css", "javascript", "shell", "xml", "java", "yaml", "properties", "http", "sh", "bash", "sql", "txt"],
      },

      /**
       * markdown enhance
       * @see https://theme-plume.vuejs.press/config/plugins/markdown-enhance/
       */
      markdownEnhance: {
        demo: true,
          include: true,
          // chart: true,
          // echarts: true,
          // mermaid: true,
          // flowchart: true,
      },

      /**
       *  markdown power
       * @see https://theme-plume.vuejs.press/config/plugin/markdown-power/
       */
      markdownPower: {
        pdf: true,
        plot: true,
        bilibili: true,
        youtube: true,
        icons: true,
        codepen: true,
        codeSandbox: true,
        jsfiddle: true,
      },
    },
  }),
})
