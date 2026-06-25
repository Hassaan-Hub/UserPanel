import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from "../firebaseCode.js";
import { db, setDoc, doc, serverTimestamp } from "../firebaseCode.js";

const auth = getAuth();

const name = document.getElementById("name");
const email = document.getElementById("email");
const password = document.getElementById("password");
const age = document.getElementById("age");
const city = document.getElementById("city");
const profession = document.getElementById("profession");
const createBtn = document.getElementById("createBtn");

createBtn.addEventListener("click", async () => {

    try {

        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email.value,
            password.value
        );

        try {
            await sendEmailVerification(userCredential.user);
        } catch (error) {
            console.log(error);
        }

        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
            name: name.value,
            email: email.value,
            age: age.value,
            city: city.value,
            profession: profession.value,
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
        console.log(error.code);

        let message = "Kuch gadbad ho gayi!";

        if (error.code === "auth/email-already-in-use") message = "This email is already registered!";
        else if (error.code === "auth/weak-password") message = "Password is too weak! (6+ characters)";
        else if (error.code === "auth/invalid-email") message = "Invalid email format!";
        
        Swal.fire({
            icon: "error",
            title: "Error!",
            text: message,
            confirmButtonColor: "#dc2626"
        });
    }
});