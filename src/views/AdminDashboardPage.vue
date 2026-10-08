<script setup>
import { onMounted } from "vue";
import { useUserDataStores } from "@/stores/user_data_stores";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth_stores";

const userDataStore = useUserDataStores();
const authStore = useAuthStore();

const {userData, loading, error} = storeToRefs(userDataStore)

onMounted(async () => {
    await userDataStore.getUserData();
});
</script>

<template>
    <div v-if="loading">
        <h1 class="text-white"></h1>
    </div>

    <p v-else-if="error">
        {{ error }}
    </p>

    <div v-else-if="userData">
        <h1 class="text-white">Welcome, {{ userData.fullname }}!</h1>
        <button class="text-white" @click="authStore.signOut()">
            Sign Out
        </button>
    </div>
</template>