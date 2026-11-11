import { defineStore } from "pinia";
import { ref } from "vue";
import * as userDataService from "@/service/user_data_service";
import { useAuthStore } from "./auth_stores";
import type { UpdateUserPayload, User } from "@/types/user_type";

export const useUserDataStores = defineStore("users", () => {
  const userData = ref<User | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function getUserData(): Promise<void> {
    const authStore = useAuthStore();
    const currentUser = authStore.currentUser;

    if (!currentUser) {
      error.value = "User is not authenticated.";
      return;
    }

    loading.value = true;
    error.value = null;

    console.time("getUserData");

    try {
      userData.value = await userDataService.getDataUser(currentUser.id);
      console.log("User data:", userData.value);
    } catch (err) {
      const e = err as { message?: string };
      error.value = e.message ?? "User Data Not Found!";
      console.error(err);
    } finally {
      loading.value = false;
      console.timeEnd("getUserData");
    }
  }

  async function updateUserData(payload: UpdateUserPayload): Promise<User> {
    const authStore = useAuthStore();
    const currentUser = authStore.currentUser;

    if (!currentUser) {
      error.value = "User is not authenticated.";
      throw new Error("User is not authenticated.");
    }

    loading.value = true;
    error.value = null;

    try {
      const updatedData = await userDataService.updateDataUser(
        currentUser.id,
        payload
      );
      userData.value = updatedData;
      return updatedData;
    } catch (err) {
      const e = err as { message?: string };
      error.value = e.message ?? "Failed to update profile data.";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateAvatar(file: File) {
    const authStore = useAuthStore()
    const currentUser = authStore.currentUser

    if (!currentUser?.id) {
      throw new Error('User tidak ditemukan')
    }

    loading.value = true
    error.value = null

    try {
      // Ambil avatar lama dari userData
      const oldAvatarUrl = userData.value?.avatar_url || null

      // 1. Upload baru + hapus yang lama (di service)
      const newAvatarUrl = await userDataService.avatarService.replaceAvatar(
        currentUser.id,
        file,
        oldAvatarUrl
      )

      // 2. Update ke database
      const updatedData = await userDataService.updateDataUser(currentUser.id, {
        avatar_url: newAvatarUrl,
      })

      // 3. Update state
      userData.value = updatedData

      return updatedData
    } catch (err) {
      const e = err as { message?: string }
      error.value = e.message ?? "Gagal update avatar"
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearUserData(): void {
    userData.value = null;
    loading.value = false;
    error.value = null;
  }

  return {
    userData,
    loading,
    error,

    getUserData,
    updateUserData,
    updateAvatar,
    clearUserData,
  };
});