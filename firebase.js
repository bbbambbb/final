import { initializeApp } from "firebase/app";
import firebase from "firebase/compat/app";
import "firebase/compat/storage"

const firebaseConfig = {
  apiKey: "AIzaSyCB3N2R_0ZiJyupO52-gpqLmCOOVPuHuUw",
  authDomain: "hahaiapp-7b310.firebaseapp.com",
  projectId: "hahaiapp-7b310",
  storageBucket: "hahaiapp-7b310.appspot.com",
  messagingSenderId: "92175497922",
  appId: "1:92175497922:web:b1d5aee48a6d323cced95b"
};

//Initialize Firebase
if(!firebase.apps.length){
  firebase.initializeApp(firebaseConfig)
}

export {firebase};