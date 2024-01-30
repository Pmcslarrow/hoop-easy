import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";

console.log(
    "LOGGING THE FIREBASE VARIABLES: ",
    process.env.APIKEY,
    process.env.DOMAIN,
    process.env.PROJECTID,
    process.env.BUCKET,
    process.env.MSI,
    process.env.APPID,
    process.env.MEASUREMENT
)

const firebaseConfig = {
    apiKey: process.env.APIKEY,
    authDomain: process.env.DOMAIN,
    projectId: process.env.PROJECTID,
    storageBucket: process.env.BUCKET,
    messagingSenderId: process.env.MSI,
    appId: process.env.APPID,
    measurementId: process.env.MEASUREMENT
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);



