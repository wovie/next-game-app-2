<script setup lang="ts">
import _ from 'lodash';
import type Game from '../props/Game';
import type Platform from '../props/Platform';

const props = defineProps<{
  game: Game;
}>();

const relevantPlatforms: Platform[] = [
  { id: 27, name: 'PC', shortName: 'PC' },
  { id: 32, name: 'Nintendo Switch', shortName: 'Switch' },
  { id: 3, name: 'PlayStation 5', shortName: 'PS5' },
  // { id: 6, name: 'PlayStation 4' },
  // { id: 2, name: 'Xbox Series X/S', shortName:'XBXS' },
];

function platforms() {
  return _.filter(props.game.platforms, (p: Platform) => {
    return _.map(relevantPlatforms, 'name').indexOf(p.name) > -1;
  });
}
</script>

<template>
  <div class="text-end text-caption">
    {{
      _.map(
        platforms(),
        (p) => _.find(relevantPlatforms, { name: p.name })!.shortName
      ).join(', ')
    }}
  </div>
</template>
