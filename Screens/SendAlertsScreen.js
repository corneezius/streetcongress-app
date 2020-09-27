import React, { useState, useEffect } from "react";
import { StyleSheet, Dimensions, Alert } from "react-native";
import { View, Text } from "react-native";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import firebase, { firestore } from "firebase";
import { StackActions, NavigationActions } from "react-navigation";
const { width, height } = Dimensions.get("window");
import * as Permissions from "expo-permissions";
import * as Notifications from "expo-notifications";

const SendAlertsScreen = (props) => {
  const [message, setMessage] = useState(null);
  const [title, setTitle] = useState(null);

  const saveNotificationToFireStore = () => {
    return new Promise((resolve, reject) => {
      const docRef = firebase.firestore().collection("Users");
      docRef
        .get()
        .then((response) => {
          response.docs.map((doc) => {
            doc.ref.set(
              {
                notifications: doc.data().notifications
                  ? [
                      ...doc.data().notifications,
                      { id: Date.now(), title, message }
                    ]
                  : [{ id: Date.now(), title, message }]
              },
              { merge: true }
            );

            resolve(true);
          });
        })
        .catch((err) => reject(err));
    });
  };

  const sendNotificationsToEveryone = async () => {
    if (message) {
      await saveNotificationToFireStore().then(() => {
        firebase
          .firestore()
          .collection("Users")
          .onSnapshot((querySnapshot) => {
            querySnapshot.docs.map(async (doc) => {
              let response = fetch("https://exp.host/--/api/v2/push/send", {
                method: "POST",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  to: doc.data().token,
                  sound: "default",
                  title: title ? title : "Street Congress",
                  body: message
                })
              });
            });
          });
      });
    } else {
      alert("text is empty");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainView}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={[styles.input, { height: 50, padding: 10 }]}
            placeholder="Message Title Goes Here..."
            onChangeText={(text) => setTitle(text)}
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Your Message</Text>
          <TextInput
            style={styles.input}
            placeholder="Type Your Message Here..."
            onChangeText={(text) => setMessage(text)}
          />
        </View>
        <TouchableOpacity
          onPress={() => sendNotificationsToEveryone()}
          style={styles.button}
        >
          <Text style={styles.buttonText}>SEND</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  mainView: {
    width,
    justifyContent: "flex-start",
    paddingVertical: height / 8,
    alignItems: "center",
    height: height / 1.3
  },
  inputContainer: {
    shadowColor: "#ccc",
    shadowOffset: {
      width: 5,
      height: 5
    },
    shadowOpacity: 0.7
  },
  label: {
    fontSize: 12,
    fontWeight: "300",
    marginLeft: 5
  },
  input: {
    fontSize: 16,
    padding: 5,
    backgroundColor: "#fff",
    height: 80,
    padding: 20,
    overflow: "scroll",
    marginVertical: 10,
    width: width / 1.1,
    borderRadius: 5
  },
  button: {
    width: width / 2.2,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    backgroundColor: "#ff5762",
    borderRadius: 5,
    marginVertical: 25
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white"
  }
});

export default SendAlertsScreen;
