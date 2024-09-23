import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    KeyboardAvoidingView,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
} from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";

import { AntDesign } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

export default function Register() {
    const [username, setUsername] = useState("");
    const [usernameVerify, setUsernameVerify] = useState("");
    const [email, setEmail] = useState("");
    const [emailVerify, setEmailVerify] = useState(false);
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [password, setPassword] = useState("");
    const [passwordVerify, setPasswordVerify] = useState(false);
    const [confirmPasswordVerify, setconfirmPasswordVerify] = useState(false);
    const [confirmpassword, setConfirmpassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigation = useNavigation();

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const toggleShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleUsername = (e) => {
        const usernameVar = e.nativeEvent.text;
        setUsername(usernameVar);
        setUsernameVerify(false);

        if (usernameVar.length > 3) {
            setUsernameVerify(true);
        }
    };

    // const handleUsername = (e) => {
    //     const usernameVar = e.nativeEvent.text;
    //     setUsername(usernameVar);
    //     setUsernameVerify(false);
    
    //     // เช็คความยาวของ username ว่ามากกว่า 3 ตัวอักษรหรือไม่
    //     if (usernameVar.length > 3) {
    //         // นับจำนวนตัวเลขใน username
    //         const digitCount = (usernameVar.match(/\d/g) || []).length;
            
    //         // ตรวจสอบว่ามีตัวเลขอย่างน้อย 2 ตัว
    //         if (digitCount >= 2) {
    //             setUsernameVerify(true);
    //         }
    //     }
    // };

    const handleEmail = (e) => {
        const emailVar = e.nativeEvent.text;
        setEmail(emailVar);
        setEmailVerify(false);
        if (/^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{3,}$/.test(emailVar)) {
            setEmail(emailVar);
            setEmailVerify(true);
        }
    };

    const handlePassword = (e) => {
        const passwordVar = e.nativeEvent.text;
        setPassword(passwordVar);
        setPasswordVerify(false);
        if (/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/.test(passwordVar)) {
            setPassword(passwordVar);
            setPasswordVerify(true);
        }
    };

    const handleConfirmPassword = (e) => {
        const confirmPasswordVar = e.nativeEvent.text;
        setConfirmpassword(confirmPasswordVar);
        setconfirmPasswordVerify(false);
        if (/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/.test(confirmPasswordVar)) {
            setConfirmpassword(confirmPasswordVar);
            setconfirmPasswordVerify(true);
        }
    };

    const handleRegister = async () => {
        if (
            !username ||
            !email ||
            !firstname ||
            !lastname ||
            !password ||
            !confirmpassword
        ) {
            Alert.alert("กรุณากรอกข้อมูลให้ครบ", "กรุณากรอกข้อมูลให้ครบทุกช่อง");
            return;
        }

        if (!emailVerify) {
            Alert.alert("อีเมลไม่ถูกต้อง", "กรุณากรอกอีเมลที่ถูกต้อง");
            return;
        }

        if (!passwordVerify) {
            Alert.alert("รหัสผ่านไม่ถูกต้อง", "กรุณากรอกรหัสผ่านที่ถูกต้อง");
            return;
        }

        if (password !== confirmpassword) {
            Alert.alert(
                "รหัสผ่านไม่ตรงกัน",
                "กรุณากรอกรหัสผ่านและยืนยันรหัสผ่านให้ตรงกัน"
            );
            return;
        }

        try {
            const userData = {
                username,
                email,
                firstname,
                lastname,
                password,
            };

            const response = await axios.post("http://192.168.1.85:5001/register", userData);

            if (response.data.status === "ok") {
                navigation.navigate("RegVerifyemail", {
                    email: response.data.email,
                    verificationToken: response.data.verificationToken,
                });
            } else {
                Alert.alert("การลงทะเบียนล้มเหลว", response.data.message);
            }
        } catch (error) {
            console.error("การลงทะเบียนไม่สำเร็จ:", error);
            Alert.alert(
                "ลงทะเบียนไม่สำเร็จ",
                error.response?.data?.message || "เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองอีกครั้ง"
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps={"always"}
                style={{ backgroundColor: "white" }}
            >
                <View style={{ marginLeft: 30, marginRight: 30 }}>
                    <TouchableOpacity
                        style={{ marginTop: 50 }}
                        onPress={() => navigation.navigate("Login")}
                    >
                        <AntDesign name="left" size={24} color="black" />
                    </TouchableOpacity>
                    <Text
                        style={{
                            fontSize: 30,
                            fontWeight: "bold",
                            marginLeft: 4,
                            width: 350,
                            marginTop: 15,
                        }}
                    >
                        สร้างบัญชีของคุณ
                    </Text>
                    <KeyboardAvoidingView>
                        <View style={{ marginTop: 35 }}>
                            <Text style={{ fontSize: 16 }}>
                                ชื่อผู้ใช้
                                <Text style={{ color: "red" }}>*</Text>
                            </Text>
                            <TextInput
                                value={username}
                                onChange={(e) => handleUsername(e)}
                                onChangeText={(text) => setUsername(text)}
                                style={styles.textinput}
                                placeholder="กรอกชื่อผู้ใช้"
                            />
                        </View>
                        {username.length < 1 ? null : usernameVerify ? null : (
                            <Text style={{ width: 350, marginBottom: 10, color: "red" }}>
                                ชื่อผู้ใช้ต้องมีมากกว่า 3 ตัวอักษร
                            </Text>
                        )}

                        <View>
                            <Text style={{ fontSize: 16 }}>
                                อีเมล
                                <Text style={{ color: "red" }}>*</Text>
                            </Text>
                            <TextInput
                                value={email}
                                onChangeText={(text) => setEmail(text)}
                                onChange={(e) => handleEmail(e)}
                                style={styles.textinput}
                                placeholder="ที่อยู่อีเมล"
                            />
                        </View>
                        {email.length < 1 ? null : emailVerify ? null : (
                            <Text style={{ width: 350, marginBottom: 10, color: "red" }}>
                                ต้องมีเครื่องหมาย @ และโดเมนต้องเป็นอักขระอย่างน้อย 3 ตัว
                            </Text>
                        )}
                        <View>
                            <Text style={{ fontSize: 16 }}>
                                ชื่อ
                                <Text style={{ color: "red" }}>*</Text>
                            </Text>
                            <TextInput
                                value={firstname}
                                onChangeText={(text) => setFirstname(text)}
                                style={styles.textinput}
                                placeholder="กรอกชื่อ"
                            />
                        </View>

                        <View>
                            <Text style={{ fontSize: 16 }}>
                                นามสกุล
                                <Text style={{ color: "red" }}>*</Text>
                            </Text>
                            <TextInput
                                value={lastname}
                                onChangeText={(text) => setLastname(text)}
                                style={styles.textinput}
                                placeholder="กรอกนามสกุล"
                            />
                        </View>

                        <View>
                            <Text style={{ fontSize: 16 }}>
                                รหัสผ่าน
                                <Text style={{ color: "red" }}>*</Text>
                            </Text>
                        </View>

                        <View style={styles.textinputpass}>
                            <TextInput
                                style={{ fontSize: 16, color: 'black' }}
                                value={password}
                                onChange={(e) => handlePassword(e)}
                                onChangeText={(text) => setPassword(text)}
                                secureTextEntry={!showPassword}
                                placeholder="กรอกรหัสผ่าน"
                            />
                            <TouchableOpacity onPress={toggleShowPassword}>
                                <Ionicons
                                    name={showPassword ? "eye-off" : "eye"}
                                    size={24}
                                    color={showPassword ? "black" : "#AFAFB3"}
                                />
                            </TouchableOpacity>
                        </View>
                        {password.length < 1 ? null : passwordVerify ? null : (
                            <Text style={{ width: 350, marginBottom: 10, color: "red" }}>
                                ป้อนตัวอักษรพิมพ์ใหญ่ ตัวอักษรพิมพ์เล็ก ตัวเลข อย่างน้อย 1
                                ตัวและมีอักขระ 6 ตัวขึ้นไป
                            </Text>
                        )}

                        <View>
                            <Text style={{ fontSize: 16 }}>
                                ยืนยันรหัสผ่าน
                                <Text style={{ color: "red" }}>*</Text>
                            </Text>
                        </View>

                        <View style={styles.textinputpass}>
                            <TextInput
                                style={{ fontSize: 16, color: 'black' }}
                                value={confirmpassword}
                                onChange={(e) => handleConfirmPassword(e)}
                                onChangeText={(text) => setConfirmpassword(text)}
                                secureTextEntry={!showConfirmPassword}
                                placeholder="กรอกรหัสผ่านยืนยัน"
                            />
                            <TouchableOpacity onPress={toggleShowConfirmPassword}>
                                <Ionicons
                                    name={showConfirmPassword ? "eye-off" : "eye"}
                                    size={24}
                                    color={showConfirmPassword ? "black" : "#AFAFB3"}
                                />
                            </TouchableOpacity>
                        </View>

                        {confirmpassword.length < 1 ? null : confirmPasswordVerify ? null : (
                            <Text style={{ width: 350, marginBottom: 10, color: "red" }}>
                                ป้อนตัวอักษรพิมพ์ใหญ่ ตัวอักษรพิมพ์เล็ก ตัวเลข อย่างน้อย 1 ตัวและมีอักขระ 6 ตัวขึ้นไป
                            </Text>
                        )}

                        <TouchableOpacity onPress={handleRegister} style={styles.containerreg}>
                            <Text style={styles.textreg}>ยืนยันการลงทะเบียน</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.textlogin}>มีบัญชีอยู่แล้ว?
                                <Text style={{ color: '#006FFD', fontWeight: 'bold' }}> เข้าสู่ระบบ</Text>
                            </Text>
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "white",
        alignItems: "center",
        justifyContent: "center",
    },
    textinput: {
        color: "black",
        marginVertical: 10,
        width: '100%',
        backgroundColor: "#F3F8FF",
        padding: 13,
        borderRadius: 8,
        borderColor: "#C5C6CC",
        borderWidth: 1,
        fontSize: 16,
    },
    containerreg: {
        marginTop: 25,
        backgroundColor: "#006FFD",
        borderRadius: 13,
        padding: 16,
        marginBottom: 30,
    },
    textreg: {
        textAlign: "center",
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    textinputpass: {
        flexDirection: "row",
        alignItems: "center",
        color: "black",
        marginVertical: 10,
        width: '100%',
        backgroundColor: "#F3F8FF",
        padding: 13,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#C5C6CC",
        justifyContent: "space-between",
    },
    textlogin: {
        textAlign: 'center',
        fontSize: 16,
    }
});
