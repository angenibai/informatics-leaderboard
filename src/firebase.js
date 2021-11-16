// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "@firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB6BojpgFnwqbh-Tm_7V5Dfl5C-TDdh6YA",
  authDomain: "informatics-leaderboard.firebaseapp.com",
  projectId: "informatics-leaderboard",
  storageBucket: "informatics-leaderboard.appspot.com",
  messagingSenderId: "504323977696",
  appId: "1:504323977696:web:ccd6c0e2eb8436cd10bb85",
  measurementId: "G-SS4085VMPZ",
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
export const analytics = getAnalytics(firebase);
export const db = getFirestore();

export default firebase;
