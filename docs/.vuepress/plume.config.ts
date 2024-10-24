import {defineThemeConfig} from 'vuepress-theme-plume'
import {navbar} from './navbar'
// import { notes } from './notes'

/**
 * @see https://theme-plume.vuejs.press/config/basic/
 */
export default defineThemeConfig({
  logo: 'https://theme-plume.vuejs.press/plume.png',
  // your git repo url
  docsRepo: '',
  docsDir: 'docs',

  appearance: true,

  profile: {
    avatar: 'https://theme-plume.vuejs.press/plume.png',
    name: 'Hao Blog',
    description: 'Hao Blog',
    circle: true,
    // location: '',
    // organization: '',
  },
  prevPage: true,
  prevPageLabel: "上一篇",
  nextPage: true,
  nextPageLabel: "下一篇",

  transition: true,

  navbar,
  // notes,
  social: [
    {icon: 'github', link: '/'},
  ],
})
