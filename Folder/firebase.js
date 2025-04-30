import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPopup,
    signInAnonymously,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCuekxnXZTzMyntyS4vT4CVQgZz4PfRsQ0",
    authDomain: "logi-sign.firebaseapp.com",
    projectId: "logi-sign",
    storageBucket: "logi-sign.firebasestorage.app",
    messagingSenderId: "266014109011",
    appId: "1:266014109011:web:91e0b8feea1e9269cc45a6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("guestLoginBtn").addEventListener("click", async () => {
        try {
            const userCredential = await signInAnonymously(auth);
            console.log("Guest logged in:", userCredential.user);

            localStorage.setItem("loggedInUser", JSON.stringify({
                uid: userCredential.user.uid,
                type: "guest",
                isAnonymous: true
                
            }));

            document.body.setAttribute("data-authenticated", "true");

            alert("Guest logged in!");

            const redirectPage = localStorage.getItem("redirectAfterLogin") || "project.html";
            localStorage.removeItem("redirectAfterLogin");
            window.location.href = redirectPage;
        } catch (error) {
            console.error("Guest login failed:", error.message);
        }
    });

    document.getElementById("signup-btn").addEventListener("click", async () => {
        const name = document.getElementById("signup-name").value.trim();
        const email = document.getElementById("signup-email").value.trim();
        const password = document.getElementById("signup-password").value.trim();

        if (!name || !email || !password) {
            showToast(`All fields are required!`, "error");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            handleLogin(userCredential.user);
        } catch (error) {
            showToast(`${error.message}`, "error");
        }
    });

    document.getElementById("login-btn").addEventListener("click", async () => {
        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value.trim();

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            handleLogin(userCredential.user);
        } catch (error) {
            showToast(`${error.message}`, "error");
        }
    });

    document.getElementById("forgot-password").addEventListener("click", async () => {
        const email = document.getElementById("login-email").value.trim();

        if (!email) {
            alert("⚠️ Enter your email to reset password.");
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            alert("📩 Password reset link sent! Check your email.");
        } catch (error) {
            showToast(`${error.message}`, "error");
        }
    });

    document.getElementById("google-login").addEventListener("click", async () => {
        const provider = new GoogleAuthProvider();

        try {
            const userCredential = await signInWithPopup(auth, provider);
            handleLogin(userCredential.user);
        } catch (error) {
            showToast(`${error.message}`, "error");
        }
    });

    document.getElementById("facebook-login").addEventListener("click", async () => {
        const provider = new FacebookAuthProvider();

        try {
            const userCredential = await signInWithPopup(auth, provider);
            handleLogin(userCredential.user);
        } catch (error) {
            showToast(`${error.message}`, "error");
        }
    });

    document.getElementById("logout-btn").addEventListener("click", () => {
        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("selectedProduct");
        alert("🔒 Logged out successfully!");
        window.location.href = "firebase.html";
    });

    checkUserStatus(); // Make sure we check user's auth status after DOM is ready
});

function handleLogin(user) {
    console.log("User Logged In:", user);

    // Check if the user is signing up (name, email, password available)
    const name = document.getElementById("signup-name")?.value.trim();
    const email = document.getElementById("signup-email")?.value.trim();
    const password = document.getElementById("signup-password")?.value.trim();

    
    const userDetails = {
        uid: user.uid,
        type: user.isAnonymous ? "guest" : "user",
        name: name || "No Name Provided",
        email: email || user.email || "No Email Provided", 
        password: password || "No Password Provided", 
        isAnonymous: user.isAnonymous || false,
    };

    localStorage.setItem("loggedInUser", JSON.stringify(userDetails));

   
    const redirectPage = localStorage.getItem("redirectAfterLogin") || "project.html";
    localStorage.removeItem("redirectAfterLogin");
    window.location.href = redirectPage;}

function checkUserStatus() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("User is logged in:", user);

            const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
            if (storedUser && storedUser.isAnonymous) {
                console.log("Guest user detected.");
            }

            document.body.setAttribute("data-authenticated", "true");
        } else {
            console.log("User is NOT logged in");
            document.body.setAttribute("data-authenticated", "false");
        }
    });
}

function showToast(message, type = "success") {
    Swal.fire({
        toast: true,
        position: "top-end",
        icon: type,
        title: message,
        showConfirmButton: false,
        timer: 3000
    });
}
