import { beforeEach, describe, expect, it } from 'vitest'
import BlogPage from '../BlogPage.vue'
import { useTranslation } from '../../composables/useTranslation'
import { PAGE_LINKS, mountPage } from './pageTestUtils'

describe('BlogPage', () => {
  beforeEach(() => {
    useTranslation().setLanguage('de')
  })

  it('nutzt den gemeinsamen AppHeader statt der Legacy-Kopfleiste', () => {
    const wrapper = mountPage(BlogPage)
    const links = wrapper.findAll('header.app-header a.app-header__link')
    expect(links.map((link) => link.attributes('href'))).toEqual(PAGE_LINKS)
    expect(wrapper.find('.page-header').exists()).toBe(false)
  })

  it('rendert den Artikel in der aktiven Sprache', async () => {
    const wrapper = mountPage(BlogPage)
    expect(wrapper.findAll('.blog-content')).toHaveLength(1)
    expect(wrapper.get('h1').text()).toContain('Der ultimative Audio Wiedergabeliste Generator')

    useTranslation().setLanguage('en')
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.blog-content')).toHaveLength(1)
    expect(wrapper.get('h1').text()).toContain('The Ultimate Audio Playlist Generator')
  })
})
