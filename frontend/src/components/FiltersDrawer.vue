<script setup lang="ts">
import { useFilterStore } from '@/stores/filter';

const filterStore = useFilterStore();
</script>

<template>
  <v-container class="v-col-lg-5">
    <v-row>
      <v-col cols="4">
        <v-form @submit.prevent="filterStore.applyFilters()">
          <v-text-field
            variant="solo"
            v-model="filterStore.searchTitle"
            density="compact"
            clearable
            hide-details
            label="Game name"
          />
        </v-form>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="text-right">
        <v-btn @click="filterStore.clearFilters()">clear filters</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
