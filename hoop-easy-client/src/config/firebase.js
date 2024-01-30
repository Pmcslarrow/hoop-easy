import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";
const {
    REACT_APP_APIKEY,
    REACT_APP_DOMAIN,
    REACT_APP_PROJECTID,
    REACT_APP_BUCKET,
    REACT_APP_MSI,
    REACT_APP_APPID,
    REACT_APP_MEASUREMENT
} = process.env

console.log(
    "LOGGING THE FIREBASE VARIABLES REACT_APP_: ",
    REACT_APP_APIKEY,
    REACT_APP_DOMAIN,
    REACT_APP_PROJECTID,
    REACT_APP_BUCKET,
    REACT_APP_MSI,
    REACT_APP_APPID,
    REACT_APP_MEASUREMENT
)

const firebaseConfig = {
    apiKey: REACT_APP_APIKEY,
    authDomain: REACT_APP_DOMAIN,
    projectId: REACT_APP_PROJECTID,
    storageBucket: REACT_APP_BUCKET,
    messagingSenderId: REACT_APP_MSI,
    appId: REACT_APP_APPID,
    measurementId: REACT_APP_MEASUREMENT
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);



