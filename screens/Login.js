import { StyleSheet, Text, View, SafeAreaView, Image, KeyboardAvoidingView, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import React, { useState, useCallback, useEffect } from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from '@expo/vector-icons';

export default function Login({ props }) {
    const navigation = useNavigation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    useFocusEffect(
        useCallback(() => {
            setPassword("");
        }, [])
    );

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const authToken = await AsyncStorage.getItem("authToken");
                if (authToken) {
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'BottomTabs' }],
                    });
                }
            } catch (error) {
                console.error("เกิดข้อผิดพลาดในการตรวจสอบ token:", error);
            }
        };

        checkAuthStatus();
    }, []);

    const clearStates = () => {
        setEmail("");
        setPassword("");
    };

    const handleForgotPass = () => {
        clearStates();
        navigation.navigate('ForgotPassword');
    }

    const handleLogin = async () => {
        if (!email) {
            Alert.alert("เกิดข้อผิดพลาด", "กรุณากรอกอีเมลก่อนเข้าสู่ระบบ");
            return;
        }

        if (!password) {
            Alert.alert("เกิดข้อผิดพลาด", "กรุณากรอกรหัสผ่านก่อนเข้าสู่ระบบ");
            return;
        }

        const userData = {
            email: email,
            password: password,
        };

        try {
            const response = await axios.post('http://192.168.1.85:5001/login', userData);
            if (response.data.status === 'ok') {
                const token = response.data.token;
                await AsyncStorage.setItem("authToken", token);
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'BottomTabs' }],
                });
            } else {
                Alert.alert("เข้าสู่ระบบไม่สำเร็จ", response.data.message);
            }
        } catch (error) {
            Alert.alert("เกิดข้อผิดพลาด", error.response?.data?.message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior="padding" style={styles.flexContainer}>
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <View style={styles.containerimage}>
                        <Image style={styles.imagehahai} source={require('../src/image/textopen.png')} />
                    </View>
                    <View style={styles.formContainer}>
                        <Text style={{ fontSize: 16 }}>อีเมล</Text>
                        <TextInput
                            value={email}
                            onChangeText={(text) => setEmail(text)}
                            style={styles.textinput}
                            placeholder="กรอกอีเมล"
                        />

                        <Text style={{ fontSize: 16 }}>รหัสผ่าน</Text>
                        <View style={styles.textinputpass}>
                            <TextInput
                                style={{ fontSize: 16, color: 'black' }}
                                value={password}
                                onChangeText={(text) => setPassword(text)}
                                secureTextEntry={!showPassword}
                                placeholder="กรอกรหัสผ่าน"
                            />
                            <TouchableOpacity onPress={toggleShowPassword}>
                                <Ionicons
                                    name={showPassword ? 'eye-off' : 'eye'}
                                    size={24}
                                    color={showPassword ? 'black' : "#AFAFB3"}
                                />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity onPress={handleLogin} style={styles.containerlogin}>
                            <Text style={styles.textlogin}>เข้าสู่ระบบ</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleForgotPass}>
                            <Text style={styles.textpwd}>ลืมรหัสผ่านใช่หรือไม่</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.textreg}>หากคุณยังไม่มีบัญชี?
                                <Text style={{ color: '#006FFD', fontWeight: 'bold' }}> ลงทะเบียน</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    flexContainer: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    containerimage: {
        marginTop: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imagehahai: {
        width: 245,
        height: 245,
    },
    formContainer: {
        flex: 1,
        marginLeft: 30,
        marginRight: 30,
    },
    textinput: {
        color: "black",
        marginVertical: 10,
        width: '100%',
        backgroundColor: "#F3F8FF",
        padding: 13,
        borderRadius: 8,
        borderColor: '#C5C6CC',
        borderWidth: 1,
        fontSize: 16,
    },
    containerlogin: {
        marginTop: 25,
        backgroundColor: '#006FFD',
        borderRadius: 13,
        padding: 16,
    },
    textlogin: {
        textAlign: 'center',
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    },
    textpwd: {
        textAlign: 'center',
        marginTop: 25,
        fontSize: 16,
    },
    textreg: {
        textAlign: 'center',
        fontSize: 16,
    },
    textinputpass: {
        flexDirection: 'row',
        alignItems: 'center',
        color: "black",
        marginVertical: 10,
        width: '100%',
        backgroundColor: "#F3F8FF",
        padding: 13,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#C5C6CC',
        justifyContent: 'space-between',
    },
    bottomContainer: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: 50,
    },
});