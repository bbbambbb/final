import { StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView } from "react-native";
import React, { useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AntDesign } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const NewPassword = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { email } = route.params;
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordVerify, setnewPasswordVerify] = useState(false);
    const [newConfirmPassword, setConfirmNewPassword] = useState("");
    const [newConfirmPasswordVerify, setConfirmNewPasswordVerify] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const toggleShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    }

    const handleNewPassword = (e) => {
        const passwordVar = e.nativeEvent.text;
        setNewPassword(passwordVar);
        setnewPasswordVerify(false);
        if (/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/.test(passwordVar)) {
            setNewPassword(passwordVar);
            setnewPasswordVerify(true);
        }
    }

    const handleNewConfirmPassword = (e) => {
        const confirmPasswordVar = e.nativeEvent.text;
        setConfirmNewPassword(confirmPasswordVar);
        setConfirmNewPasswordVerify(false);
        if (/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/.test(confirmPasswordVar)) {
            setConfirmNewPassword(confirmPasswordVar);
            setConfirmNewPasswordVerify(true);
        }
    }

    const handleSetNewPassword = async () => {
        if (!newPasswordVerify) {
            Alert.alert("รหัสผ่านไม่ถูกต้อง", "กรุณากรอกรหัสผ่านที่ถูกต้อง");
            return;
        }

        if (newPassword !== newConfirmPassword) {
            Alert.alert("รหัสผ่านไม่ตรงกัน", "กรุณากรอกรหัสผ่านและยืนยันรหัสผ่านให้ตรงกัน");
            return;
        }

        try {
            const response = await axios.post('http://192.168.1.85:5001/newPassword', { email, password: newPassword });
            if (response.status === 200) {
                //Alert.alert("สำเร็จ", "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว");
                navigation.navigate('Login');
            } else {
                Alert.alert("เกิดข้อผิดพลาด", "มีปัญหาในการเปลี่ยนรหัสผ่าน กรุณาลองอีกครั้ง");
            }
        } catch (error) {
            console.error("เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน:", error);
            Alert.alert("เกิดข้อผิดพลาด", error.response?.data?.message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps={'always'}
                style={{ backgroundColor: 'white', marginLeft: 30, marginRight: 30 }}>
                <KeyboardAvoidingView>
                    <View>
                        <TouchableOpacity style={{ marginTop: 50 }} onPress={() => navigation.navigate('CheckCodeEmail', { email })}>
                            <AntDesign name="left" size={24} color="black" />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 30, fontWeight: 'bold', marginLeft: 4, width: 350, marginTop: 15 }}>ตั้งรหัสผ่านใหม่</Text>
                    </View>

                    <View style={{ marginTop: 30 }}>
                        <Text style={{ fontSize: 16 }}>รหัสผ่านใหม่
                            <Text style={{ color: 'red' }}>*</Text>
                        </Text>

                        <View style={styles.textinputpass}>
                            <TextInput
                                style={{ fontSize: 16, color: 'black' }}
                                value={newPassword}
                                onChange={e => handleNewPassword(e)}
                                onChangeText={(text) => setNewPassword(text)}
                                secureTextEntry={!showPassword}
                                placeholder="กรอกรหัสผ่าน" />
                            <TouchableOpacity onPress={toggleShowPassword}>
                                <Ionicons
                                    name={showPassword ? 'eye-off' : 'eye'}
                                    size={24}
                                    color={showPassword ? 'black' : "#AFAFB3"} />
                            </TouchableOpacity>
                        </View>
                        {newPassword.length < 1 ? null : newPasswordVerify ? null : (
                            <Text
                                style={{
                                    width: 350,
                                    marginBottom: 10,
                                    color: 'red',
                                }}>
                                ป้อนตัวอักษรพิมพ์ใหญ่ ตัวอักษรพิมพ์เล็ก ตัวเลข อย่างน้อย 1 ตัวและมีอักขระ 6 ตัวขึ้นไป
                            </Text>
                        )}

                        <Text style={{ fontSize: 16 }}>ยืนยันรหัสผ่านใหม่
                            <Text style={{ color: 'red' }}>*</Text>
                        </Text>

                        <View style={styles.textinputpass}>
                            <TextInput
                                style={{ fontSize: 16, color: 'black' }}
                                value={newConfirmPassword}
                                onChange={e => handleNewConfirmPassword(e)}
                                onChangeText={(text) => setConfirmNewPassword(text)}
                                secureTextEntry={!showConfirmPassword}
                                placeholder="กรอกรหัสผ่านยืนยัน" />
                            <TouchableOpacity onPress={toggleShowConfirmPassword}>
                                <Ionicons
                                    name={showConfirmPassword ? 'eye-off' : 'eye'}

                                    size={24}
                                    color={showConfirmPassword ? 'black' : "#AFAFB3"} />
                            </TouchableOpacity>
                        </View>

                        {newConfirmPassword.length < 1 ? null : newConfirmPasswordVerify ? null : (
                            <Text
                                style={{
                                    width: 350,
                                    marginBottom: 10,
                                    color: 'red',
                                }}>
                                ป้อนตัวอักษรพิมพ์ใหญ่ ตัวอักษรพิมพ์เล็ก ตัวเลข อย่างน้อย 1 ตัวและมีอักขระ 6 ตัวขึ้นไป
                            </Text>
                        )}
                    </View>

                    <TouchableOpacity style={styles.containersearch} onPress={handleSetNewPassword}>
                        <Text style={styles.textconfirm}>ยืนยัน</Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>

            </ScrollView>
        </SafeAreaView>
    );
};

export default NewPassword;

const styles = StyleSheet.create({
    container: {
        backgroundColor: "white",
        flex: 1,
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
    containersearch: {
        marginTop: 25,
        backgroundColor: '#006FFD',
        borderRadius: 13,
        padding: 16,
    },
    textconfirm: {
        textAlign: 'center',
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    }
});