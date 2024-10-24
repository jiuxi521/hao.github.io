import {defineNoteConfig, defineNotesConfig} from 'vuepress-theme-plume'

const demoNote = defineNoteConfig({
  dir: 'demo',
  link: '/demo',
  sidebar: [''],
})

export const notes = defineNotesConfig({
  dir: 'journal',
  link: '/',
  notes: [demoNote],
})