import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCVnuPfw4U63NHfZrd-qsfOaGgzFkhX624",
  authDomain: "furniture-crm-c1503.firebaseapp.com",
  projectId: "furniture-crm-c1503",
  storageBucket: "furniture-crm-c1503.firebasestorage.app",
  messagingSenderId: "547598912619",
  appId: "1:547598912619:web:6b2259d3c07fc378c9352e",
  measurementId: "G-Z5HLHLQJTT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable robust offline persistence so user data survives browser refresh!
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, offline persistence disabled.');
  } else if (err.code === 'unimplemented') {
    console.warn('Browser does not support offline persistence.');
  }
});

const analytics = getAnalytics(app);

export { auth, db, analytics };
