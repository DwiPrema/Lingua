import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as authService from "@/service/auth_service";

export const useAuthStore = defineStore("auth", () => {
    // =========================================================
    // SIGN UP FORM STATE
    // =========================================================

    const email = ref(
        sessionStorage.getItem("signupEmail") || ""
    );

    const password = ref("");

    const fullname = ref("");
    const nickname = ref("");
    const phoneNumber = ref("");
    const role = ref("student");

    // =========================================================
    // OTP STATE
    // =========================================================

    const otp = ref("");

    const authIntent = ref(
        sessionStorage.getItem("authIntent") || null
    );

    // =========================================================
    // AUTH STATE
    // =========================================================

    const session = ref(null);
    const user = ref(null);

    const currentUser = computed(() => user.value);

    const isInitialized = ref(false);

    // =========================================================
    // UI STATE
    // =========================================================

    const loading = ref(false);
    const error = ref(null);
    const errors = ref({});

    // =========================================================
    // ROUTER
    // =========================================================

    const route = useRoute();
    const router = useRouter();

    const authMode = computed(() => route.name);


    // =========================================================
    // LOGIN METHOD
    // =========================================================

    const loginMethod = ref('password')

    // =========================================================
    // AUTH INTENT
    // =========================================================

    function setAuthIntent(intent) {
        authIntent.value = intent;

        if (intent) {
            sessionStorage.setItem(
                "authIntent",
                intent
            );
        } else {
            sessionStorage.removeItem(
                "authIntent"
            );
        }
    }

    // =========================================================
    // SIGN UP VALIDATION
    // =========================================================

    function validateSignUpForm() {
        errors.value = {};

        // ROLE
        if (!role.value) {
            errors.value.role =
                "Please choose how you want to use Lingua.";
        }

        // EMAIL
        if (!email.value.trim()) {
            errors.value.email =
                "Email is required.";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                email.value
            )
        ) {
            errors.value.email =
                "Please enter a valid email address.";
        }

        // PASSWORD
        if (!password.value.trim()) {
            errors.value.password =
                "Password is required.";
        } else if (password.value.length < 8) {
            errors.value.password =
                "Password minimum is 8 characters.";
        }

        // FULL NAME
        if (!fullname.value.trim()) {
            errors.value.fullname =
                "Full name is required.";
        }

        // PHONE
        if (!phoneNumber.value.trim()) {
            errors.value.phoneNumber =
                "Phone number is required.";
        } else if (
            !/^[0-9+\-\s()]+$/.test(
                phoneNumber.value
            )
        ) {
            errors.value.phoneNumber =
                "Please enter a valid phone number.";
        }

        return (
            Object.keys(errors.value).length === 0
        );
    }

    // =========================================================
    // SIGN UP
    // =========================================================

    async function signUp(
        userEmail,
        userPassword,
        userRole,
        userFullname,
        userNickname,
        userPhone
    ) {
        loading.value = true;
        error.value = null;

        try {
            email.value = userEmail;
            password.value = userPassword;
            role.value = userRole;
            fullname.value = userFullname;
            nickname.value = userNickname;
            phoneNumber.value = userPhone;

            sessionStorage.setItem(
                "signupEmail",
                userEmail
            );

            const data =
                await authService.signUp(
                    userEmail,
                    userPassword,
                    userFullname,
                    userNickname,
                    userPhone,
                    userRole
                );

            return data;

        } catch (err) {
            error.value =
                err?.message ||
                "Failed to sign up.";

            throw err;

        } finally {
            loading.value = false;
        }
    }

    // =========================================================
    // HANDLE SIGN UP
    // =========================================================

    async function handleSignUp() {
        // Validate form
        if (!validateSignUpForm()) {
            return;
        }

        loading.value = true;
        errors.value = {};

        try {
            await signUp(
                email.value,
                password.value,
                role.value,
                fullname.value,
                nickname.value,
                phoneNumber.value
            );

            setAuthIntent("signup");

            await router.push({
                name: "auth-verify",
            });

        } catch (err) {
            console.error(
                "SIGNUP ERROR:",
                err
            );

            const message =
                err?.message ||
                "Failed to sign up.";

            if (
                message
                    .toLowerCase()
                    .includes("already")
            ) {
                errors.value.email =
                    "This email is already registered. Please log in instead.";

                return;
            }

            errors.value.general = message;

        } finally {
            loading.value = false;
        }
    }

    // =========================================================
    // VERIFY OTP
    // =========================================================

    async function verifyOtpCode(
        userEmail,
        token
    ) {
        loading.value = true;
        error.value = null;

        try {
            const data =
                await authService.verifyOtp(
                    userEmail,
                    token
                );

            // verifyOtp mengembalikan session + user
            session.value = data.session;
            user.value = data.user;

            return data;

        } catch (err) {
            error.value =
                err?.message ||
                "Invalid verification code.";

            throw err;

        } finally {
            loading.value = false;
        }
    }

    // =========================================================
    // HANDLE VERIFY
    // =========================================================


    async function handleVerify() {
        if (!email.value?.trim()) {
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
            const otpType =
                authIntent.value === "login-otp"
                    ? "email"
                    : "signup";

            const data = await authService.verifyOtp(
                email.value.trim(),
                token,
                otpType
            );

            session.value = data.session;
            user.value = data.user;

            sessionStorage.removeItem("signupEmail");
            setAuthIntent(null);

            password.value = "";

            await router.push({
                name: "organization-setup",
            });

        } catch (err) {
            errors.value.otp =
                err?.message || "Invalid verification code.";
        } finally {
            loading.value = false;
        }
    }


    // =========================================================
    // SIGN OUT
    // =========================================================

    async function signOut() {
        loading.value = true;
        error.value = null;

        try {
            await authService.signOut();

            session.value = null;
            user.value = null;

            otp.value = "";
            password.value = "";

            sessionStorage.removeItem(
                "signupEmail"
            );

            setAuthIntent(null);

            await router.push({
                name: "auth-login",
            });

        } catch (err) {
            error.value =
                err?.message ||
                "Failed to sign out.";

            throw err;

        } finally {
            loading.value = false;
        }
    }

    // =========================================================
    // LISTEN TO AUTH CHANGES
    // =========================================================

    function listenToAuthChanges() {
        const {
            data: { subscription },
        } = authService.onAuthStateChange(
            (event, currentSession) => {

                console.log(
                    "AUTH EVENT:",
                    event
                );

                console.log(
                    "AUTH SESSION:",
                    currentSession
                );

                session.value =
                    currentSession;

                user.value =
                    currentSession?.user ??
                    null;
            }
        );

        return subscription;
    }

    // =========================================================
    // INITIALIZE AUTH
    // =========================================================

    async function initializeAuth() {
        try {
            loading.value = true;

            console.log(
                "AUTH INITIALIZATION START"
            );

            const currentSession =
                await authService.getSession();

            console.log(
                "SESSION FROM SUPABASE:",
                currentSession
            );

            session.value =
                currentSession;

            user.value =
                currentSession?.user ??
                null;

            console.log(
                "USER AFTER INITIALIZATION:",
                user.value
            );

        } catch (err) {
            console.error(
                "AUTH INITIALIZATION ERROR:",
                err
            );

            error.value = err;

            session.value = null;
            user.value = null;

        } finally {
            loading.value = false;
            isInitialized.value = true;

            console.log(
                "AUTH INITIALIZATION FINISHED:",
                isInitialized.value
            );
        }
    }

    // =========================================================
    // VALIDATE CURRENT USER
    // =========================================================

    async function validateCurrentUser() {
        try {
            const user =
                await authService.getUser()

            if (!user) {
                await signOut()
            }

        } catch (err) {
            console.error(
                "AUTH VALIDATION ERROR:",
                err
            )

            session.value = null
            user.value = null

            await router.push({
                name: "auth-login",
            })
        }
    }

    // =========================================================
    // SIGN IN WITH EMAIL-PASSWORD
    // =========================================================


    async function handlePasswordSignIn() {
        loading.value = true
        error.value = null

        try {
            const result = await authService.signInWithEmailPassword(
                email.value.trim(),
                password.value
            )

            session.value = result.session
            user.value = result.user

            password.value = ''

            await router.push({ name: 'organization-setup' })
        } catch (err) {
            error.value = err.message || 'Unable to sign in.'
        } finally {
            loading.value = false
        }
    }

    // =========================================================
    // SIGN IN WITH EMAIL-OTP
    // =========================================================

    async function handleOtpSignIn() {
        loading.value = true
        error.value = null

        try {
            const normalizedEmail = email.value.trim()

            if (!normalizedEmail) {
                throw new Error('Please enter your email address.')
            }

            await authService.signInWithEmailOtp(normalizedEmail)

            email.value = normalizedEmail
            otp.value = ''

            setAuthIntent('login-otp')

            await router.push({ name: 'auth-verify' })
        } catch (err) {
            error.value = err.message || 'Unable to send the login code.'
        } finally {
            loading.value = false
        }
    }

    // =========================================================
    // RETURN
    // =========================================================

    return {
        // Signup
        email,
        password,
        fullname,
        nickname,
        phoneNumber,
        role,

        // OTP
        otp,
        authIntent,

        // Auth
        session,
        user,
        currentUser,
        isInitialized,

        // UI
        loading,
        error,
        errors,

        // Router
        route,
        router,
        authMode,

        // LOGIN METHOD
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

        // Session
        initializeAuth,
        listenToAuthChanges,

        // Sign out
        signOut,

        // Sign in with email password
        handlePasswordSignIn,

        //Sign in with email otp
        handleOtpSignIn,

        // Validate Current User
        validateCurrentUser,
    };
});