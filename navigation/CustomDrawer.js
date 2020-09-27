import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  Button,
  StyleSheet,
  TouchableOpacity,
  Clipboard,
  Alert
} from "react-native";
import * as firebase from "firebase";
import * as Linking from "expo-linking";

import "@firebase/firestore";
import { TextInput } from "react-native-gesture-handler";
export default function CustomDrawer(props) {
  const [name, setname] = useState("");
  const [providedUserID, setProvidedUserID] = useState(null);
  const [currentScoreOfProvidedUser, setCurrentScoreOfProvidedUser] = useState(
    null
  );
  const [referralVisible, setReferralVisibility] = useState(true);
  const [username, setUserName] = useState(null);
  const [isSuperUser, setSuperUser] = useState(false);
  const checkEligibility = () => {
    firebase
      .firestore()
      .collection("Users")
      .doc(firebase.auth().currentUser.uid)
      .onSnapshot((doc) => {
        if (doc.exists && doc.data())
          if (doc.data().gotPointsForLinkShare) {
            skipReferral();
          }
      });
  };

  const CheckForSuperUser = () => {
    firebase
      .firestore()
      .collection("Users")
      .doc(firebase.auth().currentUser.uid)
      .onSnapshot((doc) => {
        if (doc.exists) if (doc.data().isSuperUser) setSuperUser(true);
      });
  };

  const getUserID = () => {
    return new Promise((resolve) => {
      firebase
        .firestore()
        .collection("Users")
        .where("username", "==", username)
        .onSnapshot((querySnapShot) => {
          querySnapShot.forEach((doc) => {
            setProvidedUserID(doc.id);
            setCurrentScoreOfProvidedUser(doc.data().Score);
            resolve({ id: doc.id, data: doc.data() });
          });
        });
    });
  };

  const getCurrentUserInfo = () => {
    return new Promise((resolve) => {
      firebase
        .firestore()
        .collection("Users")
        .doc(firebase.auth().currentUser.uid)
        .onSnapshot((doc) => {
          resolve({ id: doc.id, data: doc.data() });
        });
    });
  };

  const givePointsToProvidedUsername = async () => {
    const user = await getUserID();
    const userData = await firebase
      .firestore()
      .collection("Users")
      .doc(user.id)
      .get();

    userData.ref
      .set(
        {
          Score: currentScoreOfProvidedUser + 50,
          voters: userData.data().voters ? userData.data().voters + 1 : 1
        },
        { merge: true }
      )
      .then(() => Alert.alert(`Congrats, You are rewarded with 20 points`));
  };

  const verifyUsername = () => {
    return new Promise((resolve, reject) => {
      firebase
        .firestore()
        .collection("Users")
        .doc(firebase.auth().currentUser.uid)
        .onSnapshot((doc) => {
          // if (doc.data().username == username)
          //   reject(`You cannot choose your own username`);
          // else
          resolve(true);
        });
    });
  };

  const skipReferral = () => {
    setReferralVisibility(false);
  };

  const [score, setScore] = useState("");

  DeleteAccount = () => {
    Alert.alert(
      "",
      "Are you sure you want to delete?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        {
          text: "Yes",
          onPress: () => {
            var user = firebase.auth().currentUser;

            user
              .delete()
              .then(function () {
                console.log("Deleted");
                props.navigation.navigate("Register");
              })
              .catch(function (error) {
                Alert.alert(
                  "You need to login again for security reason to delete you account"
                );
                SignOut();
                console.log(error);
              });
          }
        }
      ],
      { cancelable: false }
    );
  };

  const handleSubmit = () => {
    verifyUsername().then(
      () => {
        givePointsToProvidedUsername();
      },
      (msg) => {
        Alert.alert(msg);
      }
    );
  };

  SignOut = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        props.navigation.navigate("Register");
      })
      .catch((error) => {});
  };

  // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user != null) {
        var userId = firebase.auth().currentUser.uid;
        const db = firebase.firestore();
        db.collection("Users")
          .doc(userId)
          .onSnapshot(function (doc) {
            if (doc.data()) {
              setScore(doc.data().Score);
              console.log("Current data: ", doc.data());
            }
          });
        if (user.email != null) {
          setname(user.email);
        } else {
          setname(user.displayName);
        }
      }
    });
  }, []);

  useEffect(() => checkEligibility());

  useEffect(() => CheckForSuperUser(), []);

  var userId = firebase.auth().currentUser.uid;
  let redirectUrl = Linking.makeUrl("", { uid: userId });
  // let redirectUrl = Linking.makeUrl()
  let { path, queryParams } = Linking.parse(redirectUrl);
  return (
    <View style={styles.container}>
      <View
        style={{
          backgroundColor: "#4863A0",
          marginTop: 50,
          height: 200,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 20
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold", marginVertical: 10 }}>
          {name || "undefined"}
        </Text>
        <Text style={{ color: "#fff", fontWeight: "bold" }}>
          Score: {score}
        </Text>
        <TouchableOpacity
          onPress={() => {
            Clipboard.setString(redirectUrl);
            Alert.alert("copied");
          }}
          style={{ marginTop: 20 }}
        >
          <Text
            style={{
              textAlign: "center",
              color: "#fff",
              fontSize: 16,
              fontWeight: "bold",
              textDecorationLine: "underline"
            }}
          >
            Copy Link
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginHorizontal: 20, flex: 1 }}>
        <View style={{ display: referralVisible ? "flex" : "none" }}>
          <TextInput
            style={styles.input}
            onChangeText={(text) => setUserName(text)}
            placeholder="Reference Username"
          />
          <TouchableOpacity
            onPress={() => handleSubmit()}
            style={[
              styles.Row,
              { backgroundColor: "#4863A0", marginVertical: 5 }
            ]}
          >
            <Text
              style={{
                fontSize: 16,
                textAlign: "center",
                padding: 8,
                color: "#fff"
              }}
            >
              SUBMIT
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            props.navigation.closeDrawer();
            props.navigation.navigate("Home");
          }}
        >
          <Text style={styles.buttonText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            props.navigation.closeDrawer();
            props.navigation.navigate("LeaderBoard");
          }}
        >
          <Text style={styles.buttonText}>Leaderboard</Text>
        </TouchableOpacity>

        {isSuperUser ? (
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              props.navigation.closeDrawer();
              props.navigation.navigate("SendAlertsScreen");
            }}
          >
            <Text style={styles.buttonText}>Send Notification</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={styles.button} onPress={() => DeleteAccount()}>
          <Text style={styles.buttonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => SignOut()} style={styles.Row}>
        <Text
          style={{
            fontSize: 16,
            textAlign: "center",
            padding: 10,
            color: "#fff"
          }}
        >
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000"
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    marginVertical: 5,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold"
  },
  buttonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff"
  },
  Title: {
    fontSize: 26,
    fontWeight: "bold",
    paddingHorizontal: 20
  },
  Row: {
    width: "100%",
    backgroundColor: "#ff5762"
  },
  button: {
    paddingVertical: 20
  }
});
