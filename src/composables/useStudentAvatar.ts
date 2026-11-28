import { useUserDataStores } from '@/stores/user_data_stores'

export function useStudentAvatar() {
    const userStore = useUserDataStores()

    function getStudentAvatarUrl(studentId: string): string | null {
        return userStore.userDataById[studentId]?.avatar_url ?? null
    }

    return {
        getStudentAvatarUrl,
    }
}