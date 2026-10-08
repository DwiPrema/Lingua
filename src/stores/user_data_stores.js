import { defineStore } from "pinia";
import { ref } from "vue";
import * as userDataService from "@/service/user_data_service";
import { useAuthStore } from "./auth_stores";

export const useUserDataStores = defineStore('users', () => {
    const userData = ref(null)
    const loading = ref(false)
    const error = ref(null)

    async function getUserData() {
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
            userData.value = await userDataService.getDataUser(
                currentUser.id
            );

            console.log("User data:", userData.value);
        } catch (err) {
            error.value = err.message ?? "User Data Not Found!";
            console.error(err);
        } finally {
            loading.value = false;
            console.timeEnd("getUserData");
        }
    }

    return {
        userData,
        loading,
        error,

        getUserData
    }
})