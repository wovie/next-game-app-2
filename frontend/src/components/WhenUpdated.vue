<script setup lang="ts">
const props = defineProps<{
  epoch?: number;
  days?: number;
}>();

function whenUpdated() {
  const daysSinceUpdate =
    props.days !== undefined && props.days >= 0
      ? props.days
      : Math.floor((Date.now() - (props.epoch || 0)) / (1000 * 60 * 60 * 24));

  if (daysSinceUpdate === 0) return 'today';
  else if (daysSinceUpdate === 1) return 'yesterday';
  else if (daysSinceUpdate < 14) return `${daysSinceUpdate} days ago`;
  else if (daysSinceUpdate < 29)
    return `${Math.ceil(daysSinceUpdate / 7)} weeks ago`;
  else if (daysSinceUpdate < 58) return '1 month ago';
  else if (daysSinceUpdate < 377)
    return `${Math.floor(daysSinceUpdate / 29)} months ago`;
  else return 'over a year ago';
}
</script>

<template>
  <span>Updated {{ whenUpdated() }}</span>
</template>
