import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Image, ImageBackground, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import * as firebase from 'firebase';
import '@firebase/firestore'
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import * as Facebook from 'expo-facebook';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

// const recaptchaVerifier = React.useRef(null);

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: null,
            password: null,
            logged: false,
            name: '',
            SignUpPage: false,
            forgetPassword: false,
            ScoreUid: null,
            check: true,
            help: false,
            modalPages: false,
        }
    }


    async componentDidMount() {
    }


    FacebooklogIn = async () => {
        try {
            await Facebook.initializeAsync('2060226984224028');
            const {
              type,
              token,
              expires,
              permissions,
              declinedPermissions,
            } = await Facebook.logInWithReadPermissionsAsync({
              permissions: ['public_profile'],
            });
            if (type === 'success') {
                // Get the user's name using Facebook's Graph API
                const response = await fetch(
                    `https://graph.facebook.com/me?access_token=${token}`
                );
                const user = await response.json()
                const credential = firebase.auth.FacebookAuthProvider.credential(token)
                firebase.auth().signInWithCredential(credential).then((data) => {
                    console.log(firebase.auth().currentUser)
                    const db = firebase.firestore();
                    var userId = firebase.auth().currentUser.uid

                    db.collection("Users").doc(userId).get().then(function (doc) {
                        if (doc.exists) {

                        } else {
                            db.collection("Users").doc(userId).set(user).then((data) => {
                                db.collection("Users").doc(userId).update({
                                    Score: 0
                                })
                            });
                        }
                    }).catch(function (error) {
                        console.log("Error getting document:", error);
                    });
                    this.setState({ name: firebase.auth().currentUser.displayName })
                }).catch((error) => {
                    console.log(error)
                })
            } else {
                alert(`Facebook Login Error: Cancelled`);
            }
          } catch ({ message }) {
            alert(`Facebook Login Error: ${message}`);
          }
    }

    renderModalHelp = () => (
        <View style={styles.modalView}>



            <Text style={{ textAlign: 'center', fontSize: 22, fontWeight: 'bold', marginBottom: 25 }}>Help</Text>

            {this.state.modalPages ? (
                <Text style={{ marginHorizontal: 20, fontWeight: 'bold', textAlign: 'center' }}>You will choose a username to protect anonymite. You are awarded points each time you successfully invite a new user or post a reason to the Dump Trump reason board. To begin, login.</Text>

            ) : (
                    <Text style={{ marginHorizontal: 20, fontWeight: 'bold', textAlign: 'center' }}>DUMPTRUMP APP is a social game app desinged to secure votes needed to beat Donald Trump in the upcoming fall elctions.</Text>

                )
            }

            <TouchableOpacity style={{ marginTop: 10 }} onPress={() => this.setState({ modalPages: !this.state.modalPages })}>
                <MaterialCommunityIcons name={this.state.modalPages ? "arrow-left-thick" : "arrow-right-thick"} size={40} />
            </TouchableOpacity>

            <TouchableOpacity style={{ alignSelf: 'flex-end', marginRight: 10 }} onPress={() => this.setState({ help: false })}>
                <MaterialCommunityIcons name="close-circle" size={25} />
            </TouchableOpacity>

        </View>
    );

    renderModalContent = () => (
        <View style={styles.modalView}>

            <Text style={{ textAlign: 'center', fontSize: 22, fontWeight: 'bold', marginBottom: 25 }}>Forgot Password</Text>

            <View style={styles.inputView} >
                <TextInput
                    style={styles.inputText}
                    placeholder="Email..."
                    placeholderTextColor="#003f5c"
                    onChangeText={text => this.setState({ email: text })} />
            </View>

            <TouchableOpacity onPress={() => this.ForgotPassword()} style={styles.forgotBtn}>
                <Text style={styles.loginText}>Forgot</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => this.setState({ forgetPassword: false })}>
                <Text style={{ fontSize: 17, textAlign: 'center' }}>Cancel</Text>
            </TouchableOpacity>

        </View>
    );


    render() {
        return (
            // <ImageBackground source={require('../assets/background.png')} style={styles.container}>
            <View style={styles.container}>
                <Modal
                    isVisible={this.state.forgetPassword}
                    backdropColor="rgba(0,0,0,0.1)"
                    animationIn="zoomInDown"
                    animationOut="zoomOutUp"
                    animationInTiming={600}
                    animationOutTiming={600}
                    backdropTransitionInTiming={600}
                    backdropTransitionOutTiming={600}
                    onBackdropPress={() => this.setState({ forgetPassword: false })}
                    style={{ overflow: 'scroll' }}>
                    {this.renderModalContent()}
                </Modal>
                <Modal
                    isVisible={this.state.help}
                    backdropColor="rgba(0,0,0,0.1)"
                    animationIn="zoomInDown"
                    animationOut="zoomOutUp"
                    animationInTiming={600}
                    animationOutTiming={600}
                    backdropTransitionInTiming={600}
                    backdropTransitionOutTiming={600}
                    onBackdropPress={() => this.setState({ help: false })}
                    style={{ overflow: 'scroll' }}>
                    {this.renderModalHelp()}
                </Modal>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.container}>
                        <Image source={require('../assets/congress2.png')} style={{ width: windowWidth / 1.5, height: windowWidth / 1.5, marginTop: 60, marginBottom: 10 }} />

                        {
                            !this.state.SignUpPage && (

                                <View>
                                    <View style={{  }}>
                                        <Text style={{ color: '#000', fontSize: 25, textAlign: 'center', fontWeight:'bold' }}>Login</Text>
                                    </View>

                                    <View style={styles.ButtonContainer}>

                                      
                                        <TouchableOpacity onPress={() => this.props.navigation.navigate('PhoneLogin')} style={[styles.loginBtn2, { backgroundColor: '#000' }]}>
                                            <MaterialCommunityIcons name="phone-in-talk" size={35} color='#fff' />
                                            {/* <Text style={styles.loginText}>Google</Text> */}
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.loginBtn2, { backgroundColor: '#3b5998' }]} onPress={() => this.FacebooklogIn()}>
                                            <MaterialCommunityIcons name="facebook" size={35} color='#fff' />

                                            {/* <Text style={styles.loginText}>Facebook</Text> */}
                                        </TouchableOpacity>



                                    </View>

                                    <TouchableOpacity onPress={() => this.setState({ help: true })} style={styles.Helpbtn}>
                                        <MaterialCommunityIcons name="help-circle-outline" size={32} color='#fff' />
                                        {/* <Text style={styles.loginText}>Google</Text> */}
                                    </TouchableOpacity>
                                </View>
                            )
                        }
                    </View>
                </ScrollView>
                </View>
            // </ImageBackground>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 10,
        backgroundColor:'#fff'
    },
    ButtonContainer: {
        marginHorizontal: 20,
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 30,
    },
    logo: {
        fontWeight: "bold",
        fontSize: 50,
        color: "#fb5b5a",
        marginBottom: 40
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
    forgot: {
        color: "white",
        fontSize: 11
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
    Helpbtn: {
        alignSelf: 'center'
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
        marginHorizontal: 10
    },
    loginText: {
        color: "white"
    },
    modalView: {
        width: '95%',
        borderRadius: 10,
        alignSelf: 'center',
        backgroundColor: 'white',
        paddingVertical: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
});
