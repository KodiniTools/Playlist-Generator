import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import OnboardingBanner from '../OnboardingBanner.vue'
import { useTranslation } from '../../composables/useTranslation'

describe('OnboardingBanner', () => {
  beforeEach(() => {
    useTranslation().setLanguage('de')
  })

  it('zeigt drei nummerierte Schritte, solange keine Dateien da sind', () => {
    const wrapper = mount(OnboardingBanner, { props: { hasFiles: false } })
    expect(wrapper.get('[role="region"]').attributes('aria-label')).toBe('Kurzanleitung')
    const steps = wrapper.findAll('.onboarding__step')
    expect(steps.map((step) => step.get('.onboarding__number').text())).toEqual(['1', '2', '3'])
    expect(steps.map((step) => step.get('.onboarding__label').text())).toEqual([
      'Dateien hinzufügen',
      'Reihenfolge festlegen',
      'Wiedergabeliste speichern',
    ])
    expect(wrapper.findAll('.onboarding__arrow')).toHaveLength(2)
  })

  it('verschwindet, sobald Dateien vorhanden sind', () => {
    const wrapper = mount(OnboardingBanner, { props: { hasFiles: true } })
    expect(wrapper.find('.onboarding').exists()).toBe(false)
  })
})
