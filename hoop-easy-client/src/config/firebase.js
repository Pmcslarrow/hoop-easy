import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";
const {
    APIKEY,
    DOMAIN,
    PROJECTID,
    BUCKET,
    MSI,
    APPID,
    MEASUREMENT
} = process.env

console.log(
    "LOGGING THE FIREBASE VARIABLES: ",
    APIKEY,
    DOMAIN,
    PROJECTID,
    BUCKET,
    MSI,
    APPID,
    MEASUREMENT
)

const firebaseConfig = {
    apiKey: APIKEY,
    authDomain: DOMAIN,
    projectId: PROJECTID,
    storageBucket: BUCKET,
    messagingSenderId: MSI,
    appId: APPID,
    measurementId: MEASUREMENT
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);



