import React from "react";
import { StyleSheet, SafeAreaView, Text, View } from "react-native";
import * as firebase from "firebase";
import "@firebase/firestore";
import MainNavigator from "./navigation/MainNavigator";
import * as Font from "expo-font";

var config = {
  apiKey: "AIzaSyD6jwToBOeNvfNhvcCWt4-0F8flrYgAWyk",
  authDomain: "streetcongress-c6ece.firebaseapp.com",
  databaseURL: "https://streetcongress-c6ece.firebaseio.com",
  projectId: "streetcongress-c6ece",
  storageBucket: "streetcongress-c6ece.appspot.com",
  messagingSenderId: "788694505026",
  appId: "1:788694505026:web:b0fe674e67beec357bbfdb",
};
if (!firebase.apps.length) {
  firebase.initializeApp(config);
}

export default function App() {
  // state = {
  //   fontLoaded: false,
  // }

  // async componentDidMount() {
  //   await Font.loadAsync({
  //     PermanentMarker: require('./assets/PermanentMarker.ttf'),
  //   });

  //   this.setState({ fontLoaded: true })
  // }
  return (
    <View style={styles.container}>
      <MainNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
