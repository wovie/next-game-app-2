<script setup lang="ts">
import { ref } from 'vue';
import type { Ref } from 'vue';
import _ from 'lodash';
import type Game from '../props/Game';
import type Platform from '../props/Platform';

const props = defineProps<{
  game: Game;
}>();

const platforms: Ref<Platform[]> = ref([]);

const relevantPlatforms: Platform[] = [
  { id: 4, name: 'PC', short: 'PC' },
  { id: 7, name: 'Nintendo Switch', short: 'Switch' },
  { id: 187, name: 'PlayStation 5', short: 'PS5' },
  // { id: 1, name: 'Xbox One' },
  // { id: 18, name: 'PlayStation 4' },
  // { id: 186, name: 'Xbox Series S/X' },
];

platforms.value = _.filter(props.game.platforms, (p: Platform) => {
  return _.map(relevantPlatforms, 'id').indexOf(p.id) > -1;
});
</script>

<template>
  <v-chip-group class="justify-end" variant="outlined">
    <v-chip
      v-for="platform in platforms"
      label
      size="small"
      :key="platform.id"
      :link="false"
      class="mr-0 ml-1"
    >
      {{ _.find(relevantPlatforms!, { id: platform.id })?.short }}
    </v-chip>
  </v-chip-group>
</template>
