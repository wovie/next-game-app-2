import { ref } from 'vue';
import { defineStore } from 'pinia';
import jwt_decode from 'jwt-decode';
import UserService from '../services/UserService';

export const useUserStore = defineStore('user', () => {
  const isLoggedIn = ref(false);
  const isAdmin = ref(false);
  const userId = ref('');

  async function setUserCredential(credential: string) {
    const decoded: any = jwt_decode(credential);
    const { sub } = decoded;
    userId.value = sub;
    isAdmin.value = await UserService.isAdmin(credential);
    isLoggedIn.value = userId.value.length > 0;
    return userId.value;
  }

  function canUpdate() {
    return isAdmin.value;
  }

  return { isLoggedIn, isAdmin, setUserCredential, canUpdate };
});
