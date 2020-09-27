import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Clipboard,
  SafeAreaView,
  ActivityIndicator
} from "react-native";
import firebase from "firebase";
import "@firebase/firestore";

import {
  StackActions,
  NavigationAction,
  NavigationActions,
} from "react-navigation";

// const recaptchaVerifier = React.useRef(null);

let Score = true;

export default class UserNameUpdate extends React.Component {
  static navigationOptions = {
    title: "Username",
  };
  constructor(props) {
    super(props);
    this.state = {
      username: null,
      check: true,
    };
  }


  componentDidMount = async () => {
    let checkAuth = false;
    var user = firebase.auth().currentUser.uid;
    const db = firebase.firestore();
    let _this = this
    await db
      .collection("Users")
      .doc(user)
      .get()
      .then(function (doc) {
        let that = this;
        if (doc.exists) {
          console.log('-----data----', doc.data())
          let username = doc.data().username;
          if (doc.data().Score) {
            Score = false;
          }
          if (username) {
            checkAuth = true;
          } else {
            console.log("No such document!222");
          }
        } else {
          console.log("No such document!");
        }
        _this.setState({ check: false })
      })
      .catch(function (error) {
        _this.setState({ check: false })
        console.log("Error getting document:", error);
      });

    firebase
      .firestore()
      .collection("Users")
      .doc(firebase.auth().currentUser.uid)
      .onSnapshot((doc) => {
        if (doc.exists) {
          if (doc.data().username) {
            const resetAction = StackActions.reset({
              index: 0,
              actions: [NavigationActions.navigate({ routeName: "Home" })],
            });
            this.props.navigation.dispatch(resetAction);
          }
        }
      });

  }

  Update = async () => {
    this.setState({ check: false });
    if (this.state.username !== null && this.state.username !== "") {
      firebase
        .auth()
        .currentUser.updateProfile({ displayName: this.state.username });
      console.log("worked");
      const db = firebase.firestore();
      let that = this;
      await db
        .collection("Users")
        .where("username", "==", this.state.username)
        .get()
        .then(function (querySnapshot) {
          querySnapshot.forEach(function (doc) {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data());
            that.setState({ check: true });
            Alert.alert("Already Taken");
            return;
          });
        })
        .catch(function (error) {
          console.log("Error getting documents: ", error);
        });

      if (!this.state.check) {
        var userId = firebase.auth().currentUser.uid;
        firebase.auth();
        const db = firebase.firestore();
        let obj;
        if (Score) {
          obj = {
            username: this.state.username,
            Score: 0,
          };
        } else {
          obj = {
            username: this.state.username,
          };
        }

        db.collection("Users")
          .doc(userId)
          .set(obj, { merge: true })
          .then((data) => {
            const resetAction = StackActions.reset({
              index: 0,
              actions: [NavigationActions.navigate({ routeName: "Home" })],
            });
            this.props.navigation.dispatch(resetAction);
          });
      }
    }
  };

  render() {
    if (this.state.check) {
      return (
        <View style={{flex:1, justifyContent: 'center', alignItems:'center'}}>
          <ActivityIndicator size="large" />
        </View>
      )
    }
    return (
      <View style={styles.container}>
        <Text style={styles.logo}>Update Username</Text>
        <View style={styles.inputView}>
          <TextInput
            style={styles.inputText}
            placeholder="Username"
            placeholderTextColor="#003f5c"
            onChangeText={(text) =>
              this.setState({ username: text }, () => {
                console.log(this.state.username);
              })
            }
          />
        </View>

        <TouchableOpacity onPress={() => this.Update()}>
          <Text style={styles.loginText}>Next</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#003f5c",
    alignItems: "center",
    justifyContent: "center",
  },
  ButtonContainer: {
    margin: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  logo: {
    fontWeight: "bold",
    fontSize: 40,
    color: "#fb5b5a",
    marginBottom: 40,
  },
  inputView: {
    width: "80%",
    backgroundColor: "#465881",
    borderRadius: 25,
    height: 50,
    marginBottom: 20,
    justifyContent: "center",
    padding: 20,
  },
  inputText: {
    height: 50,
    color: "white",
  },
  loginBtn: {
    width: "80%",
    backgroundColor: "#fb5b5a",
    borderRadius: 25,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    marginBottom: 5,
  },
  forgotBtn: {
    width: "80%",
    backgroundColor: "#fb5b5a",
    borderRadius: 25,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  loginBtn2: {
    width: 50,
    height: 50,
    backgroundColor: "#fb5b5a",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
  },
  loginText: {
    color: "white",
  },
});
