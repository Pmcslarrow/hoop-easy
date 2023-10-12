import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
apiKey: "AIzaSyBmsbmk53EnltYsNE6cVrJSKJuNrPwzVnI",
authDomain: "hoopeasy-c7c25.firebaseapp.com",
projectId: "hoopeasy-c7c25",
storageBucket: "hoopeasy-c7c25.appspot.com",
messagingSenderId: "492922655536",
appId: "1:492922655536:web:066ca23ea0ae2ae29beef5",
measurementId: "G-VNCRPP69MC"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);