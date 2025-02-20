// firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAC0jTK2pQyhioVYvBs5RY8gbtjYYIk4oA",
  authDomain: "my-bar-app-74cec.firebaseapp.com",
  projectId: "my-bar-app-74cec",
  storageBucket: "my-bar-app-74cec.firebasestorage.app",
  messagingSenderId: "977026952913",
  appId: "1:977026952913:web:fdeb238caaaff7cd969ff0",
  measurementId: "G-S6CZ9GCR5L",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
