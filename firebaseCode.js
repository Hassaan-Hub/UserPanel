import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    sendEmailVerification,
    deleteUser
}
    from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
    getFirestore,
    setDoc,
    doc,
    getDoc,
    collection,
    getDocs,
    serverTimestamp,
    deleteDoc
}
    from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAEVdUx2b6n7NwUpvWBdf9b9LG3rDECL0c",
    authDomain: "mini-practice-project.firebaseapp.com",
    projectId: "mini-practice-project",
    storageBucket: "mini-practice-project.firebasestorage.app",
    messagingSenderId: "328092433716",
    appId: "1:328092433716:web:42e7fba6e1add0553db961",
    measurementId: "G-TG5G79KXBR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
    getAuth,
    db,
    setDoc,
    doc,
    getDoc,
    serverTimestamp,
    deleteDoc,
    collection,
    getDocs,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    deleteUser
};