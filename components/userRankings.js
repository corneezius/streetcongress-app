import React, { useState, useEffect, Component } from "react";
import { View, StyleSheet, Text } from "react-native";
import Leaderboard from "react-native-leaderboard";
import firebase from "firebase";

export class UserRankings extends Component {
  state = {
    data: null
  };

  fetchDataFromFirebase = async () => {
    const query = await firebase.firestore().collection("Users").get();
    const users = query.docs.map((user) => user.data());
    this.setState({ data: users });
  };

  async componentDidMount() {
    await this.fetchDataFromFirebase();
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>
          Total Ranked Users : {this.state.data ? this.state.data.length : 0}
        </Text>
        <Leaderboard
          data={this.state.data}
          sortBy={"Score"}
          labelBy={"username"}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10
  }
});
