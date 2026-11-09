import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { Session, User } from "@supabase/supabase-js";

import * as authService from "@/service/auth_service";
import { useUserDataStores } from "./user_data_stores";
import { useOrganizationStore } from "./organization_stores";
import { AuthIntent, ErrorWithMessage, LoginMethod, OtpType, SignUpFormErrors, UserRole } from "@/types/auth_type";

function getErrorMessage(
    error: unknown,
    fallback = "Something went wrong.",
): string {
    if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as ErrorWithMessage).message === "string"
    ) {
        return (error as ErrorWithMessage).message;
    }

    return fallback;
}

function getStoredAuthIntent(): AuthIntent {
    const value = sessionStorage.getItem("authIntent");

    return value === "signup" || value === "login-otp" ? value : null;
}

// =========================================================
// Store
// =========================================================

export const useAuthStore = defineStore("auth", () => {
    // =====================================================
    // SIGN UP FORM STATE
    // =====================================================

    const email = ref(sessionStorage.getItem("signupEmail") ?? "");
    const password = ref("");

    const fullname = ref("");
    const nickname = ref("");
    const phoneNumber = ref("");
    const role = ref<UserRole>("student");

    // =====================================================
    // OTP STATE
    // =====================================================

    const otp = ref("");
    const authIntent = ref<AuthIntent>(getStoredAuthIntent());

    // =====================================================
    // AUTH STATE
    // =====================================================

    const session = ref<Session | null>(null);
    const user = ref<User | null>(null);

    const currentUser = computed(() => user.value);
    const isInitialized = ref(false);

    // =====================================================
    // UI STATE
    // =====================================================

    const loading = ref(false);
    const error = ref<string | null>(null);
    const errors = ref<SignUpFormErrors>({});

    // =====================================================
    // ROUTER
    // =====================================================

    const route = useRoute();
    const router = useRouter();

    const authMode = computed(() => route.name);

    // =====================================================
    // LOGIN METHOD
    // =====================================================

    const loginMethod = ref<LoginMethod>("password");

    // =====================================================
    // AUTH INTENT
    // =====================================================

    function setAuthIntent(intent: AuthIntent): void {
        authIntent.value = intent;

        if (intent) {
            sessionStorage.setItem("authIntent", intent);
        } else {
            sessionStorage.removeItem("authIntent");
        }
    }

    // =====================================================
    // SIGN UP VALIDATION
    // =====================================================

    function validateSignUpForm(): boolean {
        const validationErrors: SignUpFormErrors = {};

        if (!role.value) {
            validationErrors.role =
                "Please choose how you want to use Lingua.";
        }

        const normalizedEmail = email.value.trim();

        if (!normalizedEmail) {
            validationErrors.email = "Email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            validationErrors.email = "Please enter a valid email address.";
        }

        if (!password.value.trim()) {
            validationErrors.password = "Password is required.";
        } else if (password.value.length < 8) {
            validationErrors.password =
                "Password minimum is 8 characters.";
        }

        if (!fullname.value.trim()) {
            validationErrors.fullname = "Full name is required.";
        }

        const normalizedPhone = phoneNumber.value.trim();

        if (!normalizedPhone) {
            validationErrors.phoneNumber = "Phone number is required.";
        } else if (!/^[0-9+\-\s()]+$/.test(normalizedPhone)) {
            validationErrors.phoneNumber = "Please enter a valid phone number.";
        }

        errors.value = validationErrors;

        return Object.keys(validationErrors).length === 0;
    }

    // =====================================================
    // SIGN UP
    // =====================================================

    async function signUp(
        userEmail: string,
        userPassword: string,
        userRole: UserRole,
        userFullname: string,
        userNickname: string,
        userPhone: string,
    ): Promise<Awaited<ReturnType<typeof authService.signUp>>> {
        loading.value = true;
        error.value = null;

        try {
            email.value = userEmail;
            password.value = userPassword;
            role.value = userRole;
            fullname.value = userFullname;
            nickname.value = userNickname;
            phoneNumber.value = userPhone;

            sessionStorage.setItem("signupEmail", userEmail);

            return await authService.signUp(
                userEmail,
                userPassword,
                userFullname,
                userNickname,
                userPhone,
                userRole,
            );
        } catch (err: unknown) {
            error.value = getErrorMessage(err, "Failed to sign up.");
            throw err;
        } finally {
            loading.value = false;
        }
    }

    // =====================================================
    // HANDLE SIGN UP
    // =====================================================

    async function handleSignUp(): Promise<void> {
        if (!validateSignUpForm()) return;

        loading.value = true;
        errors.value = {};

        try {
            await signUp(
                email.value.trim(),
                password.value,
                role.value,
                fullname.value.trim(),
                nickname.value.trim(),
                phoneNumber.value.trim(),
            );

            setAuthIntent("signup");

            await router.push({ name: "auth-verify" });
        } catch (err: unknown) {
            console.error("SIGNUP ERROR:", err);

            const message = getErrorMessage(err, "Failed to sign up.");

            if (message.toLowerCase().includes("already")) {
                errors.value.email =
                    "This email is already registered. Please log in instead.";
                return;
            }

            errors.value.general = message;
        } finally {
            loading.value = false;
        }
    }

    // =====================================================
    // VERIFY OTP
    // =====================================================

    async function verifyOtpCode(
        userEmail: string,
        token: string,
    ): Promise<Awaited<ReturnType<typeof authService.verifyOtp>>> {
        loading.value = true;
        error.value = null;

        try {
            const data = await authService.verifyOtp(
                userEmail,
                token,
            );

            session.value = data.session;
            user.value = data.user;

            return data;
        } catch (err: unknown) {
            error.value = getErrorMessage(
                err,
                "Invalid verification code.",
            );
            throw err;
        } finally {
            loading.value = false;
        }
    }

    // =====================================================
    // HANDLE VERIFY
    // =====================================================

    async function handleVerify(): Promise<void> {
        const normalizedEmail = email.value.trim();

        if (!normalizedEmail) {
            errors.value.general = "Verification email is missing.";
            return;
        }

        const token = otp.value.trim();

        if (!token) {
            errors.value.otp = "Verification code is required.";
            return;
        }

        if (!/^\d{6}$/.test(token)) {
            errors.value.otp = "Verification code must be 6 digits.";
            return;
        }

        errors.value = {};
        error.value = null;
        loading.value = true;

        try {
            const otpType: OtpType =
                authIntent.value === "login-otp" ? "email" : "signup";

            const data = await authService.verifyOtp(
                normalizedEmail,
                token,
            );

            session.value = data.session;
            user.value = data.user;

            sessionStorage.removeItem("signupEmail");
            setAuthIntent(null);

            password.value = "";

            await router.push({ name: "organization-setup" });
        } catch (err: unknown) {
            const message = getErrorMessage(
                err,
                "Invalid verification code.",
            );

            error.value = message;
            errors.value.otp = message;
        } finally {
            loading.value = false;
        }
    }

    // =====================================================
    // SIGN OUT
    // =====================================================

    async function signOut(): Promise<void> {
        loading.value = true;
        error.value = null;

        try {
            await authService.signOut();

            const userDataStore = useUserDataStores();
            const organizationStore = useOrganizationStore();

            userDataStore.clearUserData();
            organizationStore.clearOrganization();

            session.value = null;
            user.value = null;

            otp.value = "";
            password.value = "";

            sessionStorage.removeItem("signupEmail");
            setAuthIntent(null);

            await router.replace({ name: "auth-login" });
        } catch (err: unknown) {
            error.value = getErrorMessage(err, "Failed to sign out.");
            throw err;
        } finally {
            loading.value = false;
        }
    }

    // =====================================================
    // LISTEN TO AUTH CHANGES
    // =====================================================

    function listenToAuthChanges() {
        const {
            data: { subscription },
        } = authService.onAuthStateChange(
            (event: string, currentSession: Session | null) => {
                console.log("AUTH EVENT:", event);

                session.value = currentSession;
                user.value = currentSession?.user ?? null;
            },
        );

        return subscription;
    }

    // =====================================================
    // INITIALIZE AUTH
    // =====================================================

    async function initializeAuth(): Promise<void> {
        loading.value = true;

        try {
            console.log("AUTH INITIALIZATION START");

            const currentSession = await authService.getSession();

            session.value = currentSession;
            user.value = currentSession?.user ?? null;

            console.log("USER AFTER INITIALIZATION:", user.value);
        } catch (err: unknown) {
            console.error("AUTH INITIALIZATION ERROR:", err);

            error.value = getErrorMessage(
                err,
                "Failed to initialize authentication.",
            );

            session.value = null;
            user.value = null;
        } finally {
            loading.value = false;
            isInitialized.value = true;

            console.log(
                "AUTH INITIALIZATION FINISHED:",
                isInitialized.value,
            );
        }
    }

    // =====================================================
    // VALIDATE CURRENT USER
    // =====================================================

    async function validateCurrentUser(): Promise<void> {
        try {
            const currentUserData = await authService.getUser();

            if (!currentUserData) {
                await signOut();
            }
        } catch (err: unknown) {
            console.error("AUTH VALIDATION ERROR:", err);

            session.value = null;
            user.value = null;

            await router.push({ name: "auth-login" });
        }
    }

    // =====================================================
    // SIGN IN WITH EMAIL-PASSWORD
    // =====================================================

    async function handlePasswordSignIn(): Promise<void> {
        loading.value = true;
        error.value = null;

        try {
            const result = await authService.signInWithEmailPassword(
                email.value.trim(),
                password.value,
            );

            session.value = result.session;
            user.value = result.user;

            password.value = "";

            await router.push({ name: "organization-setup" });
        } catch (err: unknown) {
            error.value = getErrorMessage(err, "Unable to sign in.");
        } finally {
            loading.value = false;
        }
    }

    // =====================================================
    // SIGN IN WITH EMAIL-OTP
    // =====================================================

    async function handleOtpSignIn(): Promise<void> {
        loading.value = true;
        error.value = null;

        try {
            const normalizedEmail = email.value.trim();

            if (!normalizedEmail) {
                throw new Error("Please enter your email address.");
            }

            await authService.signInWithEmailOtp(normalizedEmail);

            email.value = normalizedEmail;
            otp.value = "";

            setAuthIntent("login-otp");

            await router.push({ name: "auth-verify" });
        } catch (err: unknown) {
            error.value = getErrorMessage(
                err,
                "Unable to send the login code.",
            );
        } finally {
            loading.value = false;
        }
    }

    // =====================================================
    // RESEND OTP
    // =====================================================

    async function handleResendOtp(): Promise<boolean> {
        loading.value = true;
        error.value = null;
        errors.value = {};

        try {
            const normalizedEmail = email.value.trim();

            if (!normalizedEmail) {
                throw new Error("Verification email is missing.");
            }

            if (authIntent.value === "login-otp") {
                await authService.signInWithEmailOtp(normalizedEmail);
            } else if (authIntent.value === "signup") {
                await authService.resendOtp(normalizedEmail);
            } else {
                throw new Error("Invalid authentication flow.");
            }

            return true;
        } catch (err: unknown) {
            error.value = getErrorMessage(
                err,
                "Failed to resend verification code.",
            );
            throw err;
        } finally {
            loading.value = false;
        }
    }

    // =====================================================
    // RETURN
    // =====================================================

    return {
        // Signup form
        email,
        password,
        fullname,
        nickname,
        phoneNumber,
        role,

        // OTP
        otp,
        authIntent,

        // Auth state
        session,
        user,
        currentUser,
        isInitialized,

        // UI state
        loading,
        error,
        errors,

        // Router
        route,
        router,
        authMode,

        // Login method
        loginMethod,

        // Auth intent
        setAuthIntent,

        // Signup
        signUp,
        handleSignUp,
        validateSignUpForm,

        // OTP
        verifyOtpCode,
        handleVerify,
        handleResendOtp,

        // Session
        initializeAuth,
        listenToAuthChanges,
        validateCurrentUser,

        // Sign out
        signOut,

        // Sign in
        handlePasswordSignIn,
        handleOtpSignIn,
    };
});
