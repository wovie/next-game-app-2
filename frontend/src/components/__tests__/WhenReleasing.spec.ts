import { describe, it, expect } from 'vitest';

import { mount } from '@vue/test-utils';
import WhenReleasing from '../WhenReleasing.vue';

describe('WhenReleasing', () => {
  it('returns today', () => {
    const wrapper = mount(WhenReleasing, { props: { days: 0 } });
    expect(wrapper.text()).toContain('today');
  });

  it('returns tomorrow', () => {
    const wrapper = mount(WhenReleasing, { props: { days: 1 } });
    expect(wrapper.text()).toContain('tomorrow');
  });

  it('returns days', () => {
    const wrapper = mount(WhenReleasing, { props: { days: 2 } });
    expect(wrapper.text()).toContain('2 days');
  });

  it('returns days', () => {
    const wrapper = mount(WhenReleasing, { props: { days: 30 } });
    expect(wrapper.text()).toContain('30 days');
  });

  it('returns days', () => {
    const wrapper = mount(WhenReleasing, { props: { days: 100 } });
    expect(wrapper.text()).toContain('100 days');
  });
});
