// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDML3hjuFXJ7lpqbspai9Tgx3xcMtETiwE",
  authDomain: "my-bag-24dde.firebaseapp.com",
  projectId: "my-bag-24dde",
  storageBucket: "my-bag-24dde.firebasestorage.app",
  messagingSenderId: "746892004427",
  appId: "1:746892004427:web:64ced54a47f598666411ce",
  measurementId: "G-QV1TC1XSLQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
});

// Initialize Analytics (optional)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { analytics };
export default app;
