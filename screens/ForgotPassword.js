import { StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity, Alert, ScrollView } from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from '@expo/vector-icons';
import axios from 'axios';

const ForgotPassword = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState("");

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert("เกิดข้อผิดพลาด", "กรุณากรอกอีเมลเพื่อตั้งค่ารหัสผ่านใหม่");
            return;
        }

        try {
            const userData = {
                email: email,
            };
            const response = await axios.post('http://192.168.1.85:5001/resetPassword', userData);

            if (response.data.status === 'ok') {
                //Alert.alert("สำเร็จ", "รหัสรีเซ็ตถูกส่งไปยังอีเมลของคุณแล้ว");
                navigation.navigate('CheckCodeEmail', { email: email });
            } else {
                Alert.alert("เกิดข้อผิดพลาด", response.data.message);
            }
        } catch (error) {
            console.error("เกิดข้อผิดพลาดขึ้น:");
            Alert.alert("เกิดข้อผิดพลาดขึ้น", error.response?.data?.message || error.message);
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
                    <View>
                        <TouchableOpacity style={{ marginTop: 50 }} onPress={() => navigation.navigate('Login')}>
                            <AntDesign name="left" size={24} color="black" />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 30, fontWeight: 'bold', marginTop: 15 }}>ค้นหาบัญชีของคุณ</Text>
                        <View style={{ marginTop: 15 }}>
                            <Text style={{ fontSize: 16 }}>โปรดป้อนอีเมลของคุณ</Text>
                        </View>
                    </View>

                    <View style={{ marginTop: 30 }}>
                        <Text style={{ fontSize: 16 }}>อีเมล
                            <Text style={{ color: 'red' }}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.textinput}
                            placeholder="ที่อยู่อีเมล"
                            value={email}
                            onChangeText={setEmail} />
                    </View>

                    <TouchableOpacity style={styles.containersearch} onPress={handleResetPassword}>
                        <Text style={styles.textsearch}>ค้นหาบัญชี</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default ForgotPassword

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
});