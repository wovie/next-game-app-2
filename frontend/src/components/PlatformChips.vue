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

// const relevantPlatforms: Platform[] = [
//   { id: 4, name: 'PC', shortName: 'PC' },
//   { id: 7, name: 'Nintendo Switch', shortName: 'Switch' },
//   { id: 187, name: 'PlayStation 5', shortName: 'PS5' },
//   // { id: 1, name: 'Xbox One' },
//   // { id: 18, name: 'PlayStation 4' },
//   // { id: 186, name: 'Xbox Series S/X' },
// ];

const relevantPlatforms: Platform[] = [
  { id: 27, name: 'PC', shortName: 'PC' },
  { id: 32, name: 'Nintendo Switch', shortName: 'Switch' },
  { id: 3, name: 'PlayStation 5', shortName: 'PS5' },
  // { id: 6, name: 'PlayStation 4' },
  // { id: 2, name: 'Xbox Series X/S', shortName:'XBXS' },
];

platforms.value = _.filter(props.game.platforms, (p: Platform) => {
  return _.map(relevantPlatforms, 'name').indexOf(p.name) > -1;
});
</script>

<!-- <template>
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
</template> -->

<template>
  <div class="text-end text-caption">
    {{
      _.map(
        platforms,
        (p) => _.find(relevantPlatforms, { name: p.name })!.shortName
      ).join(', ')
    }}
  </div>
</template>
