// Import the functions you need from the SDKs you need
import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAunnND1hshsiwwXqJAJ0d9a5oB9ryDY6s",
    authDomain: "finalproject-2cac4.firebaseapp.com",
    projectId: "finalproject-2cac4",
    storageBucket: "finalproject-2cac4.firebasestorage.app",
    messagingSenderId: "128135548975",
    appId: "1:128135548975:web:2f4f0f11d765e5bba176da"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app);

export { app, auth, db, functions };
export default db;
//to have firebase working

//npm install firebase

//npm install -g firebase-tools
