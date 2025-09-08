// firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB9kYwwfdqPze3EMYpdBeZs3yCSGHQaORw",
  authDomain: "kantobar-3db93.firebaseapp.com",
  projectId: "kantobar-3db93",
  storageBucket: "kantobar-3db93.firebasestorage.app",
  messagingSenderId: "81541137450",
  appId: "1:81541137450:web:cea3f90a732b8edcac2f53",
  measurementId: "G-Q432ECZKS5",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
