import { View, Text, SafeAreaView, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { Ionicons } from '@expo/vector-icons';
import { AntDesign } from "@expo/vector-icons";

const UpdatePassword = () => {
    const navigation = useNavigation();
    const [userId, setUserId] = useState("");
    const [user, setUser] = useState(null);
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordVerify, setNewPasswordVerify] = useState(false);
    const [newConfirmPassword, setConfirmNewPassword] = useState("");
    const [newConfirmPasswordVerify, setConfirmNewPasswordVerify] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const toggleShowPassword = () => setShowPassword(!showPassword);
    const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

    const handleNewPassword = (text) => {
        setNewPassword(text);
        setNewPasswordVerify(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/.test(text));
    }

    const handleNewConfirmPassword = (text) => {
        setConfirmNewPassword(text);
        setConfirmNewPasswordVerify(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/.test(text));
    }

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = await AsyncStorage.getItem("authToken");
                if (token) {
                    const decodedToken = jwtDecode(token);
                    console.log("Decoded token:", decodedToken);
                    const userId = decodedToken.userId;
                    setUserId(userId);
                }
            } catch (error) {
                console.error("เกิดข้อผิดพลาดในการแสดงข้อมูลผู้ใช้:", error);
            }
        };

        fetchUser();
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (userId) {
                fetchUserProfile();
            }
        }, [userId])
    );

    const fetchUserProfile = async () => {
        try {
            const response = await axios.get(`http://192.168.1.85:5001/profile/${userId}`);
            const userData = response.data.user;
            setUser(userData);
        } catch (error) {
            console.log("เกิดข้อผิดพลาดในการแสดงข้อมูลผู้ใช้", error);
        }
    };

    const handleUpdatePassword = async () => {
        if (!newPassword || !newConfirmPassword) {
            Alert.alert("กรุณากรอกข้อมูลให้ครบ", "กรุณากรอกข้อมูลให้ครบทุกช่อง");
            return;
        }

        if (!newPasswordVerify || !newConfirmPasswordVerify) {
            Alert.alert("รหัสผ่านไม่ถูกต้อง", "กรุณากรอกรหัสผ่านที่ถูกต้อง");
            return;
        }

        if (newPassword !== newConfirmPassword) {
            Alert.alert("รหัสผ่านไม่ตรงกัน", "กรุณากรอกรหัสผ่านและยืนยันรหัสผ่านให้ตรงกัน");
            return;
        }

        try {
            const response = await axios.put(`http://192.168.1.85:5001/updatePassword/${userId}`,
                { password: newPassword }
            );

            if (response.status === 200) {
                console.log("อัพเดตรหัสผ่านสำเร็จ");
                //Alert.alert("อัพเดตรหัสผ่านสำเร็จ", "รหัสผ่านของคุณถูกอัพเดตเรียบร้อยแล้ว");

                await AsyncStorage.removeItem("authToken");
                navigation.navigate('Login');
            }
        } catch (error) {
            console.log("เกิดข้อผิดพลาดในการอัพเดตรหัส", error);
            Alert.alert("เกิดข้อผิดพลาด", error.response?.data?.message || "เกิดข้อผิดพลาดในการอัพเดตรหัสผ่าน");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps={'always'}
                style={{ backgroundColor: 'white' }}>
                <KeyboardAvoidingView style={{ flex: 1, marginLeft: 30, marginRight: 30 }}>
                    <View style={{ marginTop: 50 }}>
                        <TouchableOpacity onPress={() => navigation.goBack("UserProfile")}>
                            <AntDesign name="left" size={24} color="black" />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 30, fontWeight: "bold", marginTop: 18, marginBottom: 10, }}>
                            อัพเดตรหัสผ่าน
                        </Text>

                        <Text style={{ fontSize: 16, marginBottom: 30, color: '#4D4D4D' }}>อีเมล {user?.email || "ไม่มีข้อมูล"}</Text>
                        <View>
                            <Text style={{ fontSize: 16, }}>รหัสผ่านใหม่<Text style={{ color: 'red' }}>*</Text></Text>
                        </View>
                        <View style={styles.textinputpass}>
                            <TextInput
                                style={styles.textInput}
                                value={newPassword}
                                onChangeText={handleNewPassword}
                                secureTextEntry={!showPassword}
                                placeholder="กรอกรหัสผ่าน" />
                            <TouchableOpacity onPress={toggleShowPassword}>
                                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color={showPassword ? 'black' : "#AFAFB3"} />
                            </TouchableOpacity>
                        </View>
                        {!newPasswordVerify && newPassword.length > 0 && (
                            <Text style={styles.errorText}>
                                ป้อนตัวอักษรพิมพ์ใหญ่ ตัวอักษรพิมพ์เล็ก ตัวเลข อย่างน้อย 1 ตัวและมีอักขระ 6 ตัวขึ้นไป
                            </Text>
                        )}

                        <View>
                            <Text style={{ fontSize: 16, }}>ยืนยันรหัสผ่านใหม่<Text style={{ color: 'red' }}>*</Text></Text>
                        </View>

                        <View style={styles.textinputpass}>
                            <TextInput
                                style={styles.textInput}
                                value={newConfirmPassword}
                                onChangeText={handleNewConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                                placeholder="กรอกรหัสผ่านยืนยัน" />
                            <TouchableOpacity onPress={toggleShowConfirmPassword}>
                                <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={24} color={showConfirmPassword ? 'black' : "#AFAFB3"} />
                            </TouchableOpacity>
                        </View>
                        {!newConfirmPasswordVerify && newConfirmPassword.length > 0 && (
                            <Text style={styles.errorText}>
                                ป้อนตัวอักษรพิมพ์ใหญ่ ตัวอักษรพิมพ์เล็ก ตัวเลข อย่างน้อย 1 ตัวและมีอักขระ 6 ตัวขึ้นไป
                            </Text>
                        )}
                    </View>

                    <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 30 }}>
                        <TouchableOpacity style={styles.btnconfirm} onPress={handleUpdatePassword}>
                            <Text style={styles.textconfirm}>ยืนยัน</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.goBack('UserProfile')}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center', textDecorationLine: 'underline' }}>
                                ยกเลิก
                            </Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "white",
        flex: 1,
    },
    textinputpass: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
        width: '100%',
        backgroundColor: "#F3F8FF",
        padding: 13,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#C5C6CC',
        justifyContent: 'space-between',
    },
    textInput: {
        fontSize: 16,
        color: 'black',
    },
    errorText: {
        width: 400,
        marginBottom: 10,
        color: 'red',
    },
    btnconfirm: {
        marginTop: 25,
        backgroundColor: "#006FFD",
        borderRadius: 13,
        padding: 16,
        marginBottom: 20,
        width: '100%',
        alignItems: 'center',
    },
    textconfirm: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default UpdatePassword;