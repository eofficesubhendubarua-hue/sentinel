// ─── FIREBASE CONFIGURATION ───────────────────────────────
// IMPORTANT: You must replace this object with your actual Firebase config!
const firebaseConfig = {
    apiKey: "AIzaSyDmjXQDTZI_79LEvpPljNrXrENQSgohr7s",
    authDomain: "sentinel-63009.firebaseapp.com",
    projectId: "sentinel-63009",
    storageBucket: "sentinel-63009.firebasestorage.app",
    messagingSenderId: "979098579301",
    appId: "1:979098579301:web:78378e6f2f1c106960f18c",
    measurementId: "G-0NS1767F0J"
};

// Initialize Firebase
if (firebaseConfig.apiKey === "YOUR_API_KEY") {
    console.error("Firebase is not configured! Please update auth.js with your keys.");
    document.getElementById("auth-error").innerText = "Admin Setup Required: Please add Firebase keys to auth.js";
    document.getElementById("auth-error").style.display = "block";
} else {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();
const githubProvider = new firebase.auth.GithubAuthProvider();

// ─── UI ELEMENTS ──────────────────────────────────────────
const loginOverlay = document.getElementById("login-overlay");
const appContainer = document.getElementById("app-container"); // Assuming we wrap the main app
const userProfilePic = document.getElementById("user-profile-pic");

// ─── AUTH STATE LISTENER ──────────────────────────────────
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in.
        console.log("User is signed in:", user.email);
        loginOverlay.style.display = "none";
        
        // Show profile pic
        if (userProfilePic) {
            userProfilePic.src = user.photoURL || 'https://via.placeholder.com/32';
            userProfilePic.style.display = "block";
            userProfilePic.title = `Logged in as ${user.email}\nClick to logout`;
        }
        
        // Optional: Initialize specific app features now that we are authenticated
        
    } else {
        // No user is signed in.
        console.log("User is signed out.");
        loginOverlay.style.display = "flex";
        
        if (userProfilePic) {
            userProfilePic.style.display = "none";
        }
    }
});

// ─── LOGIN FUNCTIONS ──────────────────────────────────────
function signInWithGoogle() {
    if (firebaseConfig.apiKey === "YOUR_API_KEY") return;
    
    auth.signInWithPopup(googleProvider)
        .then((result) => {
            console.log("Google Sign-In Successful");
        }).catch((error) => {
            console.error("Google Auth Error:", error);
            document.getElementById("auth-error").innerText = error.message;
            document.getElementById("auth-error").style.display = "block";
        });
}

function signInWithGitHub() {
    if (firebaseConfig.apiKey === "YOUR_API_KEY") return;
    
    auth.signInWithPopup(githubProvider)
        .then((result) => {
            console.log("GitHub Sign-In Successful");
        }).catch((error) => {
            console.error("GitHub Auth Error:", error);
            document.getElementById("auth-error").innerText = error.message;
            document.getElementById("auth-error").style.display = "block";
        });
}

function signOut() {
    auth.signOut().then(() => {
        console.log("Signed out successfully.");
    }).catch((error) => {
        console.error("Sign Out Error:", error);
    });
}

// Add logout listener to profile pic if it exists
if (userProfilePic) {
    userProfilePic.addEventListener("click", () => {
        if (confirm("Are you sure you want to log out?")) {
            signOut();
        }
    });
}
