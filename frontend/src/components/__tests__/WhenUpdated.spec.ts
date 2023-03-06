import { describe, it, expect } from 'vitest';

import { mount } from '@vue/test-utils';
import WhenUpdated from '../WhenUpdated.vue';

describe('WhenUpdated', () => {
  it('returns today', () => {
    const wrapper = mount(WhenUpdated, { props: { days: 0 } });
    expect(wrapper.text()).toContain('today');
  });

  it('returns yesterday', () => {
    const wrapper = mount(WhenUpdated, { props: { days: 1 } });
    expect(wrapper.text()).toContain('yesterday');
  });

  it('returns days', () => {
    const wrapper = mount(WhenUpdated, { props: { days: 2 } });
    expect(wrapper.text()).toContain('2 days ago');
  });

  it('returns days', () => {
    const wrapper = mount(WhenUpdated, { props: { days: 7 } });
    expect(wrapper.text()).toContain('7 days ago');
  });

  it('returns days', () => {
    const wrapper = mount(WhenUpdated, { props: { days: 13 } });
    expect(wrapper.text()).toContain('13 days ago');
  });

  it('returns weeks', () => {
    const wrapper = mount(WhenUpdated, { props: { days: 14 } });
    expect(wrapper.text()).toContain('2 weeks ago');
  });

  it('returns weeks', () => {
    const wrapper = mount(WhenUpdated, { props: { days: 15 } });
    expect(wrapper.text()).toContain('3 weeks ago');
  });

  it('returns weeks', () => {
    const wrapper = mount(WhenUpdated, { props: { days: 22 } });
    expect(wrapper.text()).toContain('4 weeks ago');
  });

  it('returns weeks', () => {
    const wrapper = mount(WhenUpdated, { props: { days: 28 } });
    expect(wrapper.text()).toContain('4 weeks ago');
  });

  it('returns month', () => {
    const wrapper = mount(WhenUpdated, { props: { days: 29 } });
    expect(wrapper.text()).toContain('1 month ago');
  });

  it('returns month', () => {
    const wrapper = mount(WhenUpdated, { props: { days: 50 } });
    expect(wrapper.text()).toContain('1 month ago');
  });

  it('returns months', () => {
    const wrapper = mount(WhenUpdated, { props: { days: 58 } });
    expect(wrapper.text()).toContain('2 months ago');
  });

  it('returns months', () => {
    const wrapper = mount(WhenUpdated, { props: { days: 61 } });
    expect(wrapper.text()).toContain('2 months ago');
  });

  it('returns months', () => {
    const wrapper = mount(WhenUpdated, { props: { days: 300 } });
    expect(wrapper.text()).toContain('10 months ago');
  });

  it('returns months', () => {
    const wrapper = mount(WhenUpdated, { props: { days: 319 } });
    expect(wrapper.text()).toContain('11 months ago');
  });

  it('returns months', () => {
    const wrapper = mount(WhenUpdated, { props: { days: 320 } });
    expect(wrapper.text()).toContain('11 months ago');
  });

  it('returns months', () => {
    const wrapper = mount(WhenUpdated, { props: { days: 347 } });
    expect(wrapper.text()).toContain('11 months ago');
  });

  it('returns months', () => {
    const wrapper = mount(WhenUpdated, { props: { days: 348 } });
    expect(wrapper.text()).toContain('12 months ago');
  });

  it('returns months', () => {
    const wrapper = mount(WhenUpdated, { props: { days: 364 } });
    expect(wrapper.text()).toContain('12 months ago');
  });

  it('returns year', () => {
    const wrapper = mount(WhenUpdated, { props: { days: 377 } });
    expect(wrapper.text()).toContain('over a year ago');
  });
});
