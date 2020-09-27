import React, { useState, useEffect, Component } from "react";
import { SafeAreaView, Text, StyleSheet, Dimensions, View } from "react-native";
import { Header } from "../components/Header";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import firebase from "firebase";
import { FontDisplay } from "expo-font";

const { width, height } = Dimensions.get("screen");

const Card = ({ title, message, onDelete }) => (
  <View style={styles.card}>
    <View style={{ flexDirection: "row" }}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <TouchableOpacity onPress={onDelete} style={{ flex: 0.1 }}>
        <Text style={styles.deleteButton}>×</Text>
      </TouchableOpacity>
    </View>
    <View>
      <Text style={styles.cardMessage}>{message}</Text>
    </View>
  </View>
);

export class Notifications extends Component {
  state = {
    data: null
  };

  fetchNotificationsFromFirebase = () => {
    const userID = firebase.auth().currentUser.uid;
    firebase
      .firestore()
      .collection("Users")
      .doc(userID)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const notifications = doc.data().notifications
            ? doc.data().notifications
            : null;
          this.setState({ data: notifications });
        }
      });
  };

  componentDidMount() {
    this.fetchNotificationsFromFirebase();
  }

  deleteNotificationAsync = async (id) => {
    const userID = firebase.auth().currentUser.uid;
    await firebase
      .firestore()
      .collection("Users")
      .doc(userID)
      .get()
      .then((doc) => {
        const notifications = doc
          .data()
          .notifications.filter((noti) => noti.id !== id);
        doc.ref.set({ notifications }, { merge: true });
        this.setState({ data: notifications });
      });
  };

  render() {
    return (
      <SafeAreaView style={{ width, height }}>
        <Header navigation={this.props.navigation} title="Notifications" />
        <View style={styles.container}>
          <Text>Notifications Will Show Up Here...</Text>
          <FlatList
            data={this.state.data}
            renderItem={({ item }) => (
              <Card
                title={item.title}
                message={item.message}
                onDelete={() => this.deleteNotificationAsync(item.id)}
              />
            )}
          />
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10
  },
  card: {
    backgroundColor: "#FFF",
    shadowColor: "#ccc",
    shadowOffset: {
      width: 3,
      height: 3
    },
    borderRadius: 5,
    shadowOpacity: 0.7,
    marginVertical: 5,
    padding: 15,
    width: width / 1.05
  },
  cardTitle: {
    fontWeight: "600"
  },
  cardMessage: {
    fontWeight: "300",
    fontSize: 13
  },
  deleteButton: {
    fontSize: 25,
    color: "#555"
  }
});
