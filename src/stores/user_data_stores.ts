
import { defineStore } from "pinia";
import { ref } from "vue";
import * as userDataService from "@/service/user_data_service";
import { useAuthStore } from "./auth_stores";
import type { UpdateUserPayload, User } from "@/types/user_type";

export const useUserDataStores = defineStore("users", () => {
  const userData = ref<User | null>(null);
  const userDataById = ref<Record<string, User>>({});

  const loading = ref(false);
  const error = ref<string | null>(null);

  // =====================================================
  // Get current authenticated user
  // =====================================================

  async function getUserData(): Promise<void> {
    const authStore = useAuthStore();
    const currentUser = authStore.currentUser;

    if (!currentUser) {
      error.value = "User is not authenticated.";
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const user = await userDataService.getDataUser(currentUser.id);

      userData.value = user;
      userDataById.value[currentUser.id] = user;
    } catch (err) {
      const e = err as { message?: string };
      error.value = e.message ?? "User Data Not Found!";
      console.error("getUserData:", err);
    } finally {
      loading.value = false;
    }
  }

  // =====================================================
  // Get user by ID
  // =====================================================

  async function getUserDataById(id: string): Promise<User | null> {
    if (!id) return null;

    const cachedUser = userDataById.value[id];

    if (cachedUser) return cachedUser;

    error.value = null;

    try {
      const user = await userDataService.getDataUser(id);

      userDataById.value[id] = user;

      return user;
    } catch (err) {
      const e = err as { message?: string };
      error.value = e.message ?? "User Data Not Found!";

      console.error(`getUserDataById (${id}):`, err);

      return null;
    }
  }

  // =====================================================
  // Update user profile
  // =====================================================

  async function updateUserData(
    payload: UpdateUserPayload
  ): Promise<User> {
    const authStore = useAuthStore();
    const currentUser = authStore.currentUser;

    if (!currentUser) {
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
      userDataById.value[currentUser.id] = updatedData;

      return updatedData;
    } catch (err) {
      const e = err as { message?: string };
      error.value = e.message ?? "Failed to update profile data.";

      throw err;
    } finally {
      loading.value = false;
    }
  }

  // =====================================================
  // Update avatar
  // =====================================================

  async function updateAvatar(file: File): Promise<User> {
    const authStore = useAuthStore();
    const currentUser = authStore.currentUser;

    if (!currentUser?.id) {
      throw new Error("User tidak ditemukan.");
    }

    loading.value = true;
    error.value = null;

    try {
      // Get existing storage path, not public URL
      const oldAvatarPath = userData.value?.avatar_url ?? null;

      // Upload new avatar and receive its storage path
      const newAvatarPath =
        await userDataService.avatarService.replaceAvatar(
          currentUser.id,
          file,
          oldAvatarPath
        );

      // Save storage path to database
      const updatedData = await userDataService.updateDataUser(
        currentUser.id,
        {
          avatar_url: newAvatarPath,
        }
      );

      // Update Pinia state and cache
      userData.value = updatedData;
      userDataById.value[currentUser.id] = updatedData;

      return updatedData;
    } catch (err) {
      const e = err as { message?: string };
      error.value = e.message ?? "Gagal update avatar.";

      console.error("updateAvatar:", err);

      throw err;
    } finally {
      loading.value = false;
    }
  }

  // =====================================================
  // Clear user data
  // =====================================================

  function clearUserData(): void {
    userData.value = null;
    userDataById.value = {};
    loading.value = false;
    error.value = null;
  }

  return {
    userData,
    userDataById,
    loading,
    error,

    getUserData,
    getUserDataById,
    updateUserData,
    updateAvatar,
    clearUserData,
  };
});
