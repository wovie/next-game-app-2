<script setup lang="ts">
import GameService from '../services/GameService';

const props = defineProps(['game', 'columns']);
const emit = defineEmits(['gameDeleted']);

const howLongToBeatUrl = `https://howlongtobeat.com/game/${props.game.howLongToBeatId}`;

async function deleteGame(id: number) {
  await GameService.deleteGame(id);
  emit('gameDeleted');
}
</script>

<template>
  <tr class="expanded-row">
    <td :colspan="columns.length">
      <v-container fluid>
        <v-row>
          <v-col>
            <v-text-field
              density="compact"
              label="OpenCritic"
              v-model="game.openCriticId"
              variant="outlined"
              v-if="Date.now() - game.released > 0"
            >
              <template v-slot:details>
                <v-btn
                  variant="plain"
                  density="compact"
                  :href="game.openCriticUrl"
                  size="small"
                  target="_blank"
                  class="text-caption pa-0"
                  >{{ game.openCriticUrl }}
                </v-btn>
              </template>
            </v-text-field>
          </v-col>
          <v-col>
            <v-text-field
              density="compact"
              label="HowLongToBeat"
              v-model="game.howLongToBeatId"
              variant="outlined"
              v-if="Date.now() - game.released > 0"
            >
              <template v-slot:details>
                <v-btn
                  variant="plain"
                  density="compact"
                  :href="howLongToBeatUrl"
                  size="small"
                  target="_blank"
                  class="text-caption pa-0"
                  v-if="game.howLongToBeatId"
                  >{{ howLongToBeatUrl }}
                </v-btn>
              </template>
            </v-text-field>
          </v-col>
        </v-row>
        <v-row class="mt-0">
          <v-col class="text-right py-1">
            <v-btn
              @click="deleteGame(game._id)"
              color="error"
              size="small"
              icon="mdi-delete"
            >
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </td>
  </tr>
</template>

<style>
.expanded-row .v-messages {
  display: none;
}
</style>
