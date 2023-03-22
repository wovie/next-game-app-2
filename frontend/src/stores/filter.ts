import { reactive, ref } from 'vue';
import { defineStore } from 'pinia';

export const useFilterStore = defineStore('filter', () => {
  const filters: any[] = reactive([]);
  const showDrawer = ref(false);
  const searchTitle = ref('');
  const run = ref(false);

  function showFilters() {
    showDrawer.value = true;
  }

  function applyFilters() {
    showDrawer.value = false;

    if (searchTitle.value && searchTitle.value.length) {
      run.value = true;
    } else {
      run.value = false;
    }
  }

  function clearFilters() {
    searchTitle.value = '';
    applyFilters();
  }

  return {
    filters,
    showFilters,
    showDrawer,
    searchTitle,
    applyFilters,
    run,
    clearFilters,
  };
});
