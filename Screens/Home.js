import React, { useState, useEffect } from "react";
import {
  Alert,
  TextInput,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  Share,
  View,
  Image,
  Platform,
  SafeAreaView
} from "react-native";

import * as Linking from "expo-linking";

const { width, height } = Dimensions.get("screen");

import * as Permissions from "expo-permissions";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import DraggableFlatList from "react-native-draggable-flatlist";

import * as firebase from "firebase";
import "@firebase/firestore";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Header } from "../components/Header";

export default class HomeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    title: "Home",
    headerStyle: {},
    // headerTintColor: '#5d599',
    headerTitleStyle: {
      fontWeight: "bold",
      textAlign: "center"
    },
    headerRight: () => (
      <TouchableOpacity
        style={{ marginRight: 15 }}
        onPress={() => firebase.auth().signOut()}
      >
        <MaterialCommunityIcons name="logout" color="grey" size={26} />
      </TouchableOpacity>
    ),
    headerLeft: () => (
      <TouchableOpacity
        style={{ marginLeft: 15 }}
        onPress={() => navigation.navigate("LeaderBoard")}
      >
        <Image
          source={require("../assets/scoreboard.png")}
          style={{ width: 26, height: 26 }}
        />
      </TouchableOpacity>
    )
  });

  state = {
    logged: false,
    name: "",
    Post: false,
    Description: "",
    messages: [],
    data: [],
    help: false,
    numberOfVotes: 0,
    userRank: null
  };

  onShare = async () => {
    var userId = firebase.auth().currentUser.uid;
    let url = Linking.makeUrl("", { uid: userId });
    try {
      const result = await Share.share({
        message: url
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };

  registerForPushNotifications = async () => {
    let user = firebase.auth().currentUser.uid;
    let token;
    if (Constants.isDevice) {
      const { status: existingStatus } = await Permissions.getAsync(
        Permissions.NOTIFICATIONS
      );
      let finalStatus = existingStatus;
      console.log("-===--", finalStatus);
      if (existingStatus !== "granted") {
        const { status } = await Permissions.askAsync(
          Permissions.NOTIFICATIONS
        );
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      const db = firebase.firestore();
      db.collection("Users")
        .doc(user)
        .set(
          {
            token: token ? token : ""
          },
          { merge: true }
        )
        .then((data) => {});

      console.log(token);
    } else {
      alert("Must use physical device for Push Notifications");
    }
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C"
      });
    }

    return token;

    // let token;
    // if (Constants.isDevice) {
    //   const { status: existingStatus } = await Permissions.getAsync(
    //     Permissions.NOTIFICATIONS
    //   );
    //   let finalStatus = existingStatus;
    //   if (existingStatus !== "granted") {
    //     const { status } = await Permissions.askAsync(
    //       Permissions.NOTIFICATIONS
    //     );
    //     finalStatus = status;
    //   }
    //   if (finalStatus !== "granted") {
    //     alert("Failed to get push token for push notification!");
    //     return;
    //   }
    //   token = (await Notifications.getExpoPushTokenAsync()).data;
    //   console.log('-----------', token);
    // } else {
    //   alert("Must use physical device for Push Notifications");
    // }

    // if (Platform.OS === "android") {
    //   Notifications.setNotificationChannelAsync("default", {
    //     name: "default",
    //     importance: Notifications.AndroidImportance.MAX,
    //     vibrationPattern: [0, 250, 250, 250],
    //     lightColor: "#FF231F7C",
    //   });
    // }

    // await firebase
    //   .firestore()
    //   .collection("Users")
    //   .doc(firebase.auth().currentUser.uid)
    //   .update({ expoToken: token })
    //   .then(() => {
    //     console.log(token);
    //   });

    // return token;
  };

  getNumberOfVotersForCurrentUser = async () => {
    const userID = firebase.auth().currentUser.uid;
    const userData = await firebase
      .firestore()
      .collection("Users")
      .doc(userID)
      .get();
    const numberOfVotes = userData.data().votes ? userData.data().votes : 0;
    this.setState({ numberOfVotes });
  };

  async componentDidMount() {
    let token = await this.registerForPushNotifications();
    let user = firebase.auth().currentUser.uid;

    let _this = this;
    await firebase
      .database()
      .ref("Submitted")
      .child(user)
      .once("value", (snapshot) => {
        if (snapshot.val() && snapshot.val().user == user) {
          _this.setState({ help: true });
        }
      });
    firebase
      .database()
      .ref("Score")
      .once("value", (snapshot) => {
        const data = snapshot.val();
        const count = snapshot.numChildren();
        if (snapshot.val()) {
          const initMessages = [];
          Object.keys(data).forEach((message) =>
            initMessages.push(data[message])
          );
          this.setState({ messages: initMessages, data: initMessages }, () =>
            console.log(this.state.data)
          );
        }
      });

    this.getNumberOfVotersForCurrentUser();
    this.getCurrentUsersRank();
  }

  componentDidUpdate() {
    if (this.state.help) {
      this.props.navigation.navigate("LeaderBoard");
    }
  }

  submit = () => {
    let score = this.state.data.length;
    let user = firebase.auth().currentUser.uid;
    let _this = this;
    this.state.data.forEach(function (item) {
      _this.state.messages.forEach(function (data, index) {
        if (data.Node == item.Node) {
          firebase
            .database()
            .ref("Score")
            .child(data.Node)
            .update({
              Score: score + item.Score
            })
            .then((data) => {
              if (_this.state.messages.length - 1 == index) {
                _this.setState({ help: true });
                firebase.database().ref("Submitted").child(user).set({
                  user: user
                });
              }
            })
            .catch((error) => {
              //error callback
              console.log("Upload Not Successfully" + error);
            });
        }
      });
      score = score - 1;
    });
  };

  getCurrentUsersRank = async () => {
    const userID = firebase.auth().currentUser.uid;

    const userData = await firebase
      .firestore()
      .collection("Users")
      .orderBy("Score", "desc")
      .get();

    const currentUserRank = userData.docs.findIndex(
      (user) => user.id === userID
    );
    this.setState({ userRank: currentUserRank + 1 });
  };

  renderModalHelp = () => (
    <View style={styles.modalView}>
      <Text
        style={{
          textAlign: "center",
          fontSize: 22,
          fontWeight: "bold",
          marginBottom: 15
        }}
      >
        Submitted
      </Text>

      <Text
        style={{
          textAlign: "center",
          fontWeight: "bold",
          flex: 1,
          marginBottom: 10
        }}
      >
        You casted your vote
      </Text>

      <TouchableOpacity
        style={{ marginBottom: 10 }}
        onPress={() => {
          this.onShare();
        }}
      >
        <MaterialCommunityIcons name="share-variant" color="grey" size={26} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          this.setState({ help: false });
          this.props.navigation.navigate("LeaderBoard");
        }}
      >
        <Text style={{ fontWeight: "bold" }}>View Score</Text>
      </TouchableOpacity>
    </View>
  );

  renderItem = ({ item, index, drag, isActive }) => {
    return (
      <TouchableOpacity
        style={{
          height: 42,
          backgroundColor: isActive ? "blue" : "#b58b8b",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 5,
          marginVertical: 8
        }}
        onLongPress={drag}
      >
        <Text
          style={{
            fontWeight: "bold",
            color: "white",
            fontSize: 18
          }}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  render() {
    var userId = firebase.auth().currentUser.uid;
    return (
      <SafeAreaView style={{ width, height }}>
        <Header navigation={this.props.navigation} title="Home" />
        <View style={{ flex: 1, marginHorizontal: 25 }}>
          {this.state.help ? (
            <View style={styles.modalView}>
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 22,
                  fontWeight: "bold",
                  marginBottom: 15
                }}
              >
                Submitted
              </Text>

              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "bold",
                  flex: 1,
                  marginBottom: 10
                }}
              >
                You casted your vote
              </Text>

              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  alignItems: "center",
                  zIndex: -10
                }}
              >
                <View style={{ flexDirection: "row", marginTop: height / 4 }}>
                  <View
                    style={{
                      flex: 0.5,
                      alignItems: "center",
                      borderColor: "#aaa",
                      borderWidth: 0.7,
                      padding: 5
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: 18,
                        color: "#555"
                      }}
                    >
                      Voters Gained
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 0.5,
                      alignItems: "center",
                      borderColor: "#aaa",
                      borderWidth: 0.7,
                      padding: 5
                    }}
                  >
                    <Text
                      style={{
                        color: "#000",
                        fontWeight: "bold",
                        fontSize: 18
                      }}
                    >
                      {this.state.numberOfVotes}
                    </Text>
                  </View>
                </View>
                <View style={{ marginVertical: 20, flexDirection: "row" }}>
                  <View
                    style={{
                      flex: 0.5,
                      alignItems: "center",
                      borderColor: "#aaa",
                      borderWidth: 0.7,
                      padding: 5
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "bold",
                        fontSize: 18,
                        color: "#555"
                      }}
                    >
                      User Rank
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 0.5,
                      alignItems: "center",
                      borderColor: "#aaa",
                      borderWidth: 0.7,
                      padding: 5
                    }}
                  >
                    <Text
                      style={{
                        color: "#000",
                        fontWeight: "bold",
                        fontSize: 18
                      }}
                    >
                      {this.state.userRank}
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: "row", marginVertical: 50 }}>
                  <TouchableOpacity
                    style={{ flex: 0.5, alignItems: "center" }}
                    onPress={() => {
                      this.props.navigation.navigate("LeaderBoard");
                    }}
                  >
                    <Image
                      source={require("../assets/scoreboard.png")}
                      style={{ width: 26, height: 26 }}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flex: 0.5, alignItems: "center" }}
                    onPress={() => {
                      this.onShare();
                    }}
                  >
                    <MaterialCommunityIcons
                      name="share-variant"
                      color="grey"
                      size={26}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, textAlign: "center" }}>
                Press item and drag accordingly
              </Text>
              {/* <Modal
                                isVisible={this.state.help}
                                backdropColor="rgba(0,0,0,1)"
                                animationIn="zoomInDown"
                                animationOut="zoomOutUp"
                                animationInTiming={600}
                                animationOutTiming={600}
                                backdropTransitionInTiming={600}
                                backdropTransitionOutTiming={600}
                                // onBackdropPress={() => this.setState({ help: false })}
                                style={{ overflow: 'scroll' }}>
                                {this.renderModalHelp()}
                            </Modal> */}
              <DraggableFlatList
                showsVerticalScrollIndicator={false}
                data={this.state.data}
                renderItem={this.renderItem}
                keyExtractor={(item, index) => index.toString()}
                onDragEnd={({ data }) => this.setState({ data })}
              />
              <TouchableOpacity
                style={{
                  backgroundColor: "#685353",
                  paddingVertical: 8,
                  marginTop: 20
                }}
                onPress={this.submit}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    color: "white",
                    textAlign: "center",
                    fontSize: 20
                  }}
                >
                  Submit
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  Title: {
    fontSize: 30,
    fontWeight: "bold",
    paddingHorizontal: 20
  },
  modalView: {
    flex: 1,
    width: "95%",
    borderRadius: 10,
    alignSelf: "center",
    backgroundColor: "white",
    paddingVertical: 20,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20
  },
  inputView: {
    width: "80%",
    backgroundColor: "#465881",
    borderRadius: 25,
    height: 50,
    marginBottom: 20,
    justifyContent: "center",
    padding: 20
  },
  inputText: {
    height: 50,
    color: "white"
  },
  forgotBtn: {
    width: "80%",
    backgroundColor: "#fb5b5a",
    borderRadius: 25,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10
  }
});
