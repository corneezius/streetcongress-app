import * as React from "react";
import {
  Image,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  StatusBar,
  SafeAreaView
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import * as Linking from "expo-linking";
import * as firebase from "firebase";
import "@firebase/firestore";
const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Header } from "../components/Header";

import Leaderboard from "react-native-leaderboard";
import { UserRankings } from "../components/userRankings";

const { width, height } = Dimensions.get("screen");

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      TotalVotes: 0,
      data: [],
      selectedTab: false
    };
  }

  async getDate() {
    const snapshot = await firebase.firestore().collection("events").get();
    return snapshot.docs.map((doc) => doc.data());
  }

  async componentDidMount() {
    let that = this;
    await firebase
      .database()
      .ref("Submitted")
      .once("value")
      .then(function (snapshot) {
        that.setState({ TotalVotes: snapshot.numChildren() });
      });
    firebase
      .database()
      .ref("Score")
      .on("value", (snapshot) => {
        const data = snapshot.val();
        const count = snapshot.numChildren();
        if (snapshot.val()) {
          const initMessages = [];
          Object.keys(data).forEach((message) =>
            initMessages.push(data[message])
          );

          var result = initMessages.sort(function (a, b) {
            return b.Score - a.Score;
          });
          // let data2 = data.sort(function (a, b) { return b.Score - a.Score });
          this.setState({ data: result });
        }
      });
  }

  render() {
    return (
      <SafeAreaView style={{ width, height }}>
        <Header navigation={this.props.navigation} title="LeaderBoards" />

        <View style={styles.tabs}>
          <TouchableOpacity
            onPress={() => this.setState({ selectedTab: false })}
            style={[
              styles.tabButton,
              { flex: 0.5, alignItems: "center" },
              this.state.selectedTab === false ? styles.selectedTab : null
            ]}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: this.state.selectedTab === false ? "white" : "black"
                }
              ]}
            >
              Survey Results
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.setState({ selectedTab: true })}
            style={[
              styles.tabButton,
              { flex: 0.5, alignItems: "center" },
              this.state.selectedTab === true ? styles.selectedTab : null
            ]}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: this.state.selectedTab === true ? "white" : "black"
                }
              ]}
            >
              User Rankings
            </Text>
          </TouchableOpacity>
        </View>
        {this.state.selectedTab ? (
          <UserRankings />
        ) : (
          <View style={styles.container}>
            <Text
              style={{ textAlign: "center", fontSize: 16, marginVertical: 8 }}
            >
              Total Votes: {this.state.TotalVotes}
            </Text>
            <Leaderboard
              data={this.state.data}
              sortBy="Score"
              labelBy="label"
            />
          </View>
        )}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  tabs: {
    width,
    flexDirection: "row"
  },

  tabButton: {
    backgroundColor: "rgba(150,150,150,0.3)",
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5
  },

  selectedTab: {
    backgroundColor: "#4863A0"
  },

  tabText: {
    fontWeight: "600"
  },

  container: {
    flex: 1
    // backgroundColor: '#fff',
    // justifyContent: 'center',
    // alignItems: 'center'
  },
  Title: {
    fontSize: 30,
    fontWeight: "bold",
    paddingHorizontal: 20
  },
  row: {
    padding: 15,
    marginBottom: 5,
    backgroundColor: "skyblue"
  }
});
