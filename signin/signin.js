import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "../firebaseCode.js";

const auth = getAuth();

const email = document.getElementById('email');
const password = document.getElementById('password');
const signInBtn = document.getElementById('signInBtn');



signInBtn.addEventListener('click', async () => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
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
        console.log(error.code);

        let message = "Kuch gadbad ho gayi!";

        if (error.code === "auth/user-not-found") message = "Email not found!";
        else if (error.code === "auth/wrong-password") message = "Wrong password!";
        else if (error.code === "auth/invalid-email") message = "Invalid email format!";
        else if (error.code === "auth/invalid-credential") message = "Incorrect email or password!";
        else if (error.code === "auth/too-many-requests") message = "Too many attempts! Try again later.";

        Swal.fire({
            icon: "error",
            title: "Login Failed!",
            text: message,
            confirmButtonColor: "#dc2626"
        });
    }
});