<script setup lang="ts">
import { ref } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { useDeckStore } from '@/stores/deck';
import { useUserStore } from '@/stores/user';
import DeckService from '@/services/DeckService';

const settingsStore = useSettingsStore();
const userStore = useUserStore();
const deckStore = useDeckStore();
const panels = ref([0]);

async function deleteDeck() {
  await DeckService.deleteDeck(settingsStore.deck);
  settingsStore.showSettings();
  deckStore.getDecks();
}
</script>

<template>
  <v-container class="v-col-lg-5">
    <v-card-text class="text-h6">
      <v-icon icon="mdi-playlist-star"></v-icon>
      {{ settingsStore.deck.name }}
    </v-card-text>
    <v-expansion-panels v-model="panels">
      <v-expansion-panel title="Filters">
        <v-expansion-panel-text>
          <v-row>
            <v-col cols="4">
              <v-form @submit.prevent="settingsStore.applyFilters()">
                <v-text-field
                  variant="solo"
                  v-model="settingsStore.searchTitle"
                  density="compact"
                  clearable
                  hide-details
                  label="Name"
                />
              </v-form>
            </v-col>
          </v-row>
          <v-row>
            <v-col class="text-right">
              <v-btn @click="settingsStore.clearFilters()">Clear</v-btn>
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel
        title="Settings"
        v-if="settingsStore.deck._id && userStore.isLoggedIn"
      >
        <v-expansion-panel-text>
          <v-row>
            <v-col>
              <v-text-field
                label="Rename"
                density="compact"
                variant="outlined"
                hide-details
                prepend-inner-icon="mdi-playlist-edit"
                v-model="settingsStore.deck.name"
              ></v-text-field>
            </v-col>
            <v-spacer></v-spacer>
            <v-col class="text-right">
              <v-btn
                @click="deleteDeck()"
                color="error"
                prepend-icon="mdi-playlist-remove"
              >
                Delete
              </v-btn>
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>
