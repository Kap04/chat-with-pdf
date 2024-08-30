import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBP7fHINZh_7HC-Yi869lp5anXD153GJqY",
    authDomain: "chat-with-69fd1.firebaseapp.com",
    projectId: "chat-with-69fd1",
    storageBucket: "chat-with-69fd1.appspot.com",
    messagingSenderId: "26855541245",
    appId: "1:26855541245:web:efab9237bc471ac7e17194",
    measurementId: "G-1CS11EJNTR"
    
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
const db = getFirestore(app);
const storage = getStorage(app)

export { db, storage }


