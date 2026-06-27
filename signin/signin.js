import { getAuth, signInWithEmailAndPassword } from "../firebaseCode.js";

const auth = getAuth();

// DOM Elements
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signInBtn = document.getElementById('signInBtn');
const togglePasswordBtn = document.getElementById('togglePassword');
const eyeIcon = document.getElementById('eyeIcon');

// SVG icon paths for Eye states
const EYE_SVG = `
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
`;

const EYE_OFF_SVG = `
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
`;

// Clean Mapping of Firebase Errors (No dirty if/else needed)
const FIREBASE_ERROR_MESSAGES = {
    "auth/user-not-found": "Email not found!",
    "auth/wrong-password": "Wrong password!",
    "auth/invalid-email": "Invalid email format!",
    "auth/invalid-credential": "Incorrect email or password!",
    "auth/too-many-requests": "Too many login attempts! Please try again later."
};

// 1. Password Visibility Toggle Logic
if (togglePasswordBtn && passwordInput && eyeIcon) {
    togglePasswordBtn.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        
        // Change Icon SVGs
        eyeIcon.innerHTML = isPassword ? EYE_OFF_SVG : EYE_SVG;
        
        // Eye icon color toggle
        if (isPassword) {
            togglePasswordBtn.classList.remove('text-white/30');
            togglePasswordBtn.classList.add('text-violet-400');
        } else {
            togglePasswordBtn.classList.remove('text-violet-400');
            togglePasswordBtn.classList.add('text-white/30');
        }
    });
}

// 2. Loading State Helper (UX improvements to prevent duplicate clicks)
const setSubmitting = (isSubmitting) => {
    if (isSubmitting) {
        signInBtn.disabled = true;
        signInBtn.innerHTML = `
            <span class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
            </span>
        `;
    } else {
        signInBtn.disabled = false;
        signInBtn.innerHTML = `
            <span class="shimmer-effect"></span>
            Login
        `;
    }
};

// 3. User Sign In Event
signInBtn.addEventListener('click', async () => {
    const emailVal = emailInput.value.trim();
    const passwordVal = passwordInput.value.trim();

    // Field check before contacting database (saves API calls)
    if (!emailVal || !passwordVal) {
        Swal.fire({
            icon: "warning",
            title: "Empty Fields",
            text: "Please fill in both Email and Password fields.",
            confirmButtonColor: "#6d28d9"
        });
        return;
    }

    try {
        setSubmitting(true);
        const userCredential = await signInWithEmailAndPassword(auth, emailVal, passwordVal);
        const user = userCredential.user;

        await Swal.fire({
            icon: "success",
            title: "Welcome Back!",
            text: `Khush amdeed ${user.email} 🎉`,
            confirmButtonColor: "#6d28d9",
            timer: 1500,
            showConfirmButton: false
        });

        window.location.href = "../newWindow/newWindow.html";

    } catch (error) {
        console.error("Login Failed Code:", error.code);

        const friendlyMessage = FIREBASE_ERROR_MESSAGES[error.code] || "Kuch gadbad ho gayi! Dobara koshish karein.";

        Swal.fire({
            icon: "error",
            title: "Login Failed!",
            text: friendlyMessage,
            confirmButtonColor: "#dc2626"
        });
    } finally {
        setSubmitting(false);
    }
});