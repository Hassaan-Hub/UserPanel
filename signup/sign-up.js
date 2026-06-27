import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "../firebaseCode.js";
import { db, setDoc, doc, serverTimestamp } from "../firebaseCode.js";

const auth = getAuth();

// DOM Elements
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const ageInput = document.getElementById("age");
const cityInput = document.getElementById("city");
const professionInput = document.getElementById("profession");
const createBtn = document.getElementById("createBtn");
const togglePasswordBtn = document.getElementById('togglePassword');
const eyeIcon = document.getElementById('eyeIcon');

// SVG paths for Eye states
const EYE_SVG = `
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
`;

const EYE_OFF_SVG = `
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
`;

// Clean Mapping of Firebase Errors
const FIREBASE_ERROR_MESSAGES = {
    "auth/email-already-in-use": "This email is already registered!",
    "auth/weak-password": "Password is too weak! (Must be 6+ characters)",
    "auth/invalid-email": "Invalid email format!",
    "auth/network-request-failed": "Network error! Please check your connection."
};

// 1. Password Visibility Toggle Logic
if (togglePasswordBtn && passwordInput && eyeIcon) {
    togglePasswordBtn.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        
        // Change SVGs
        eyeIcon.innerHTML = isPassword ? EYE_OFF_SVG : EYE_SVG;
        
        // Active color class toggles
        if (isPassword) {
            togglePasswordBtn.classList.remove('text-white/30');
            togglePasswordBtn.classList.add('text-violet-400');
        } else {
            togglePasswordBtn.classList.remove('text-violet-400');
            togglePasswordBtn.classList.add('text-white/30');
        }
    });
}

// 2. Loading State Helper for UX Feedback
const setSubmitting = (isSubmitting) => {
    if (isSubmitting) {
        createBtn.disabled = true;
        createBtn.innerHTML = `
            <span class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
            </span>
        `;
    } else {
        createBtn.disabled = false;
        createBtn.innerHTML = `
            <span class="shimmer-effect"></span>
            Sign Up
        `;
    }
};

// 3. Register Event Listener
createBtn.addEventListener("click", async () => {
    const nameVal = nameInput.value.trim();
    const emailVal = emailInput.value.trim();
    const passwordVal = passwordInput.value.trim();
    const ageVal = ageInput.value.trim();
    const cityVal = cityInput.value.trim();
    const professionVal = professionInput.value.trim();

    // Check if any field is empty before creating requests
    if (!nameVal || !emailVal || !passwordVal || !ageVal || !cityVal || !professionVal) {
        Swal.fire({
            icon: "warning",
            title: "Required Fields",
            text: "Please fill out all the details before signing up.",
            confirmButtonColor: "#6d28d9"
        });
        return;
    }

    try {
        setSubmitting(true);

        const userCredential = await createUserWithEmailAndPassword(
            auth,
            emailVal,
            passwordVal
        );

        // Verification email sending block
        try {
            await sendEmailVerification(userCredential.user);
        } catch (verifError) {
            console.warn("Verification email sending failed: ", verifError);
        }

        const user = userCredential.user;

        // Save user data to Firestore
        await setDoc(doc(db, "users", user.uid), {
            name: nameVal,
            email: emailVal,
            age: ageVal,
            city: cityVal,
            profession: professionVal,
            uid: user.uid,
            timestamp: serverTimestamp()
        });

        await Swal.fire({
            icon: "success",
            title: "Account Created!",
            text: "Verification email bhi bhej diya, check karo 📧",
            confirmButtonColor: "#6d28d9",
            confirmButtonText: "Login karo"
        });

        window.location.href = "../signin/sign-in.html";

    } catch (error) {
        console.error("Firebase Signup Error Code:", error.code);

        const friendlyMessage = FIREBASE_ERROR_MESSAGES[error.code] || "Kuch gadbad ho gayi!";

        Swal.fire({
            icon: "error",
            title: "Error!",
            text: friendlyMessage,
            confirmButtonColor: "#dc2626"
        });
    } finally {
        setSubmitting(false);
    }
});