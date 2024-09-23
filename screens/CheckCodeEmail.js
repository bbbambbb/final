import { StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AntDesign } from '@expo/vector-icons';
import axios from 'axios';

const CheckCodeEmail = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { email } = route.params;
    const [code, setCode] = useState("");
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        let countdown;
        if (timer > 0) {
            countdown = setInterval(() => {
                setTimer(prevTimer => prevTimer - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }

        return () => clearInterval(countdown);
    }, [timer]);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleVerifyCode = async () => {
        if (!code) {
            Alert.alert("เกิดข้อผิดพลาด", "กรุณากรอกรหัสรีเซ็ตเพื่อตั้งค่ารหัสผ่านใหม่");
            return;
        }
        
        try {
            const response = await axios.post('http://192.168.1.85:5001/verifyResetCode', { email, code }); 
            if (response.data.status === 'ok') {
                //Alert.alert("สำเร็จ", "รหัสรีเซ็ตถูกต้อง");
                navigation.navigate('NewPassword', { email });
            } else {
                Alert.alert("เกิดข้อผิดพลาด", response.data.message);
            }
        } catch (error) {
            //console.error("เกิดข้อผิดพลาดในการตรวจสอบรหัสรีเซ็ต");
            Alert.alert("เกิดข้อผิดพลาด", "มีปัญหาในการตรวจสอบรหัสรีเซ็ต กรุณาลองอีกครั้ง");
        }
    };

    const handleResendCode = async () => {
        if (!canResend) return;
        try {
            const response = await axios.post('http://192.168.1.85:5001/resetPassword', { email });
            if (response.status === 200) {
                //Alert.alert("สำเร็จ", "รหัสรีเซ็ตถูกส่งไปยังอีเมลของคุณแล้ว");
                setTimer(60); 
                setCanResend(false);
            } else {
                Alert.alert("เกิดข้อผิดพลาด", response.data.message || "มีปัญหาในการส่งรหัสรีเซ็ตใหม่ กรุณาลองอีกครั้ง");
            }
        } catch (error) {
            console.error("เกิดข้อผิดพลาดในการส่งรหัสรีเซ็ตใหม่:", error);
            Alert.alert("เกิดข้อผิดพลาด", "มีปัญหาในการส่งรหัสรีเซ็ตใหม่ กรุณาลองอีกครั้ง");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps={'always'}
                style={{ backgroundColor: 'white' }}>
                <View style={{ marginLeft: 30, marginRight: 30 }}>
                    <TouchableOpacity style={{ marginTop: 50 }} onPress={() => navigation.navigate('ForgotPassword')}>
                        <AntDesign name="left" size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 30, fontWeight: 'bold', marginLeft: 4, marginTop: 15 }}>กรุณาตรวจสอบอีเมลของคุณ</Text>
                    <View style={{ marginTop: 15 }}>
                        <Text style={{ fontSize: 16 }}>ได้ทำการส่งรหัสไปที่
                            <Text style={{ fontWeight: 'bold' }}> {email}</Text>
                        </Text>
                    </View>

                    <View style={{ marginTop: 30 }}>
                        <Text style={{ fontSize: 16 }}>รหัสรีเซ็ต<Text style={{ color: 'red' }}>*</Text></Text>
                        <TextInput
                            style={styles.textinput}
                            placeholder="กรอกรหัสรีเซ็ต"
                            value={code}
                            onChangeText={setCode}
                        />
                    </View>

                    <TouchableOpacity style={styles.containersearch} onPress={handleVerifyCode}>
                        <Text style={styles.textsearch}>ยืนยันรหัส</Text>
                    </TouchableOpacity>

                    <View style={styles.timerContainer}>
                        <Text
                            style={[styles.timerText, canResend && { fontWeight: 'bold' }]}
                            onPress={canResend ? handleResendCode : null}
                        >
                            ส่งรหัสอีกครั้ง {canResend ? '' : formatTime(timer)}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

export default CheckCodeEmail

const styles = StyleSheet.create({
    container: {
        backgroundColor: "white",
        flex: 1,
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
    containersearch: {
        marginTop: 25,
        backgroundColor: '#006FFD',
        borderRadius: 13,
        padding: 16,
    },
    textsearch: {
        textAlign: 'center',
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    },
    timerContainer: {
        marginTop: 20,
    },
    timerText: {
        textAlign: 'center',
        color: 'black',
        fontSize: 16,
    }
});