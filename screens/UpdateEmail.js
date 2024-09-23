import { View, Text, SafeAreaView, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { jwtDecode } from "jwt-decode";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { AntDesign } from "@expo/vector-icons";

const UpdateEmail = () => {
  const navigation = useNavigation();
  const [userId, setUserId] = useState("");
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [emailVerify, setEmailVerify] = useState(false);

  const handleEmail = (e) => {
    const emailVar = e.nativeEvent.text;
    setEmail(emailVar);
    setEmailVerify(false);
    if (/^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{3,}$/.test(emailVar)) {
      setEmail(emailVar);
      setEmailVerify(true);
    }
  };

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

  const handleUpdateEmail = async () => {
    if (!email) {
      Alert.alert("เกิดข้อผิดพลาด", "กรุณากรอกอีเมล");
      return;
    }

    if (!emailVerify) {
      Alert.alert("อีเมลไม่ถูกต้อง", "กรุณากรอกอีเมลที่ถูกต้อง");
      return;
    }

    try {
      const response = await axios.put(`http://192.168.1.85:5001/updateEmail/${userId}`, { email });

      if (response.status === 200) {
        if (response.data.email && response.data.verificationToken) {
          console.log("ดำเนินการสำเร็จ", "อีเมลถูกอัพเดทสำเร็จ โปรดตรวจสอบอีเมลของคุณเพื่อยืนยัน");
          //Alert.alert("ดำเนินการสำเร็จ", "อีเมลถูกอัพเดทสำเร็จ โปรดตรวจสอบอีเมลของคุณเพื่อยืนยัน");

          await AsyncStorage.removeItem("authToken");
          navigation.navigate("Login");

        } else {
          Alert.alert("เกิดข้อผิดพลาด", "ข้อมูลการตอบสนองไม่สมบูรณ์");
        }
      } else {
        Alert.alert("เกิดข้อผิดพลาด", "เกิดข้อผิดพลาดในการอัพเดทอีเมล");
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการอัพเดทอีเมล:", error);
      Alert.alert("เกิดข้อผิดพลาด", "เกิดข้อผิดพลาดในการอัพเดทอีเมล");
    }
  }

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
            <Text style={{ fontSize: 30, fontWeight: "bold", marginTop: 18, marginBottom: 18 }}>
              เปลี่ยนอีเมล
            </Text>
            <Text style={{ fontSize: 16, color: '#4D4D4D' }}>
              อีเมลปัจจุบันของคุณคือ <Text style={{ fontWeight: 'bold' }}>{user?.email || "ไม่มีข้อมูล"}</Text> คุณต้องการอัพเดตหรือไม่ อีเมลของคุณจะไม่ปรากฏในข้อมูลส่วนตัวแบบสาธารณะบน Hahai
            </Text>
            <Text style={{ fontSize: 16, marginTop: 15, color: '#4D4D4D' }}>
              หากคุณต้องการเปลี่ยนที่อยู่อีเมล การเชื่อมต่อใดๆที่มีอยู่จะถูกลบออก ตรวจสอบบัญชีที่เชื่อมอีกครั้ง
            </Text>
          </View>

          <Text style={{ fontSize: 16, marginTop: 40 }}>อีเมล<Text style={{ color: 'red' }}>*</Text></Text>
          <View style={styles.textinputpass}>
            <TextInput
              style={{ fontSize: 16, color: 'black' }}
              placeholder="ที่อยู่อีเมล"
              onChange={(e) => handleEmail(e)}>
            </TextInput>
          </View>
          {email.length < 1 ? null : emailVerify ? null : (
            <Text style={{ width: 350, marginBottom: 10, color: "red" }}>
              ต้องมีเครื่องหมาย @ และโดเมนต้องเป็นอักขระอย่างน้อย 3 ตัว
            </Text>
          )}

          <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 30 }}>
            <TouchableOpacity onPress={handleUpdateEmail} style={styles.containerconfirm}>
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
  )
}

export default UpdateEmail

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
  },
  textinputpass: {
    color: "black",
    marginVertical: 10,
    width: '100%',
    backgroundColor: "#F3F8FF",
    padding: 13,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C5C6CC',
  },
  containerconfirm: {
    marginTop: 25,
    backgroundColor: "#006FFD",
    borderRadius: 13,
    padding: 16,
    marginBottom: 20,
    width: 400,
  },
  textconfirm: {
    textAlign: "center",
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  }
})