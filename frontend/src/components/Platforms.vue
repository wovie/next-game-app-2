<script setup lang="ts">
import _ from 'lodash';

const props = defineProps(['game']);

const relevantPlatforms = [
  { id: 4, name: 'PC', short: 'PC' },
  { id: 7, name: 'Nintendo Switch', short: 'Switch' },
  { id: 187, name: 'PlayStation 5', short: 'PS5' },
  // { id: 1, name: 'Xbox One' },
  // { id: 18, name: 'PlayStation 4' },
  // { id: 186, name: 'Xbox Series S/X' },
];

function platforms() {
  const platforms = _.filter(props.game.platforms, (p: object) => {
    return _.map(relevantPlatforms, 'id').indexOf(p.id) > -1;
  });

  return _.map(platforms, (p) => {
    const { id } = p;
    return _.find(relevantPlatforms, { id }).short;
  })
}
</script>

<template>
  <v-chip-group class="justify-end" variant="outlined">
    <v-chip
      v-for="platform in platforms()"
      label
      size="small"
      :key="platform.id"
      :link="false"
      >{{ platform }}</v-chip
    >
  </v-chip-group>
</template>
