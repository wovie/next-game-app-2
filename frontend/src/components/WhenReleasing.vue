<script setup lang="ts">
const props = defineProps<{
  epoch?: number;
  days?: number;
}>();

const daysUntilRelease =
  props.days !== undefined && props.days >= 0
    ? props.days
    : Math.floor((props.epoch! - Date.now()) / (1000 * 60 * 60 * 24));

function whenReleasing() {
  if (daysUntilRelease === 0) return 'today';
  else if (daysUntilRelease === 1) return 'tomorrow';
  else return `${daysUntilRelease} days`;
}
</script>

<template>
  <span>{{ whenReleasing() }}</span>
</template>
