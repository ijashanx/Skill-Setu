import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider, RecaptchaVerifier, signInWithPopup, signInWithPhoneNumber } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
let auth;
let googleProvider;
let yahooProvider;

try {
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    yahooProvider = new OAuthProvider('yahoo.com');
  } else {
    console.warn("Firebase API Key is missing. Social login will not work.");
  }
} catch (error) {
  console.error("Firebase initialization error", error);
}

export { app, auth, googleProvider, yahooProvider };

export const setupRecaptcha = (containerId) => {
  return new RecaptchaVerifier(auth, containerId, {
    'size': 'invisible',
  });
};

export { signInWithPopup, signInWithPhoneNumber };
