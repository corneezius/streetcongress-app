import React from "react";
import { Image, View, Text, StyleSheet, Dimensions } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5
} from "@expo/vector-icons";

const { width, height } = Dimensions.get("screen");

export const Header = ({ navigation, title, homeBtnDisabled }) => (
  <View style={styles.header}>
    <View
      style={{
        flex: 0.3,
        flexDirection: "row"
      }}
    >
      <View style={{ flex: 0.5, alignItems: "center" }}>
        <TouchableOpacity
          disabled={homeBtnDisabled}
          onPress={() => navigation.openDrawer()}
        >
          <Ionicons name="md-home" size={26} />
        </TouchableOpacity>
      </View>
      <View style={{ flex: 0.5, alignItems: "center" }}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <FontAwesome5 name="clipboard-list" size={26} />
        </TouchableOpacity>
      </View>
    </View>
    <View
      style={{
        flex: 0.4,
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <Text style={styles.title}>{title}</Text>
    </View>
    <View style={{ flex: 0.3, flexDirection: "row" }}>
      <View style={{ flex: 0.5, alignItems: "center" }}>
        <TouchableOpacity onPress={() => navigation.navigate("LeaderBoard")}>
          <Image
            source={require("../assets/scoreboard.png")}
            style={{ width: 26, height: 26 }}
          />
        </TouchableOpacity>
      </View>
      <View style={{ flex: 0.5, alignItems: "center" }}>
        <TouchableOpacity onPress={() => navigation.navigate("Notifications")}>
          <MaterialCommunityIcons name="bell" size={26} />
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    position: "relative",
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: "#fff",
    shadowColor: "#ccc",
    shadowOffset: {
      width: 3,
      height: 3
    },
    shadowOpacity: 0.8,
    width: width,
    padding: 10
  },
  title: {
    fontSize: 18,
    fontWeight: "600"
  }
});

// title: title,
// headerStyle: {},
// // headerTintColor: '#5d599',
// headerTitleStyle: {
//   fontWeight: "bold",
//   textAlign: "center"
// },
// headerRight: () => (
//   <TouchableOpacity
//     style={{ marginRight: 15 }}
//     onPress={() => firebase.auth().signOut()}
//   >
//     <MaterialCommunityIcons name="logout" color="grey" size={26} />
//   </TouchableOpacity>
// ),
// headerLeft: () => (
//   <TouchableOpacity
//     style={{ marginLeft: 15 }}
//     onPress={() => navigation.navigate("LeaderBoard")}
//   >
//     <Image
//       source={require("../assets/scoreboard.png")}
//       style={{ width: 26, height: 26 }}
//     />
//   </TouchableOpacity>
// )
// );
