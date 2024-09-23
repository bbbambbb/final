import { StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView } from "react-native";
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from "jwt-decode";
import { Ionicons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import axios from 'axios';

const ConfirmPassword = () => {
  const navigation = useNavigation();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => setShowPassword(!showPassword);

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

  const handleConfirmPassword = async () => {
    if (!password) {
      Alert.alert("เกิดข้อผิดพลาด", "กรุณากรอกรหัสผ่านก่อนเข้าสู่ระบบ");
      return;
    }

    try {
      const response = await axios.post(`http://192.168.1.85:5001/confirmPassword/${userId}`, { password });
      if (response.data.message === "ยืนยันรหัสผ่านสำเร็จ") {
        //console.log("ดำเนินการสำเร็จ", "ยืนยันรหัสผ่านเรียบร้อย");
        //Alert.alert("ดำเนินการสำเร็จ", "ยืนยันรหัสผ่านเรียบร้อย");
        navigation.navigate('UpdateEmail');
      }
    } catch (error) {
      //console.error("เกิดข้อผิดพลาด", error);
      Alert.alert("เกิดข้อผิดพลาด", error.response?.data?.message || "การยืนยันรหัสผ่านไม่สำเร็จ");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps={'always'}
        style={{ backgroundColor: 'white', marginLeft: 30, marginRight: 30 }}>
        <KeyboardAvoidingView style={{ flex: 1, }}>
          <View>
            <TouchableOpacity style={{ marginTop: 50 }} onPress={() => navigation.goBack('UserProfile')}>
              <AntDesign name="left" size={24} color="black" />
            </TouchableOpacity>
            <Text style={{ fontSize: 30, fontWeight: 'bold', marginLeft: 4, width: 350, marginTop: 15 }}>ยืนยันรหัสผ่าน</Text>
            <Text style={{ fontSize: 16, marginTop: 15, marginBottom: 30, color: '#4D4D4D' }}>ป้อนรหัสผ่าน Hahai ของคุณเพื่อดำเนินการ</Text>
          </View>

          <View>
            <Text style={{ fontSize: 16, }}>รหัสผ่าน<Text style={{ color: 'red' }}>*</Text></Text>
          </View>
          <View style={styles.textinputpass}>
            <TextInput
              style={styles.textInput}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholder="กรอกรหัสผ่าน" />
            <TouchableOpacity onPress={toggleShowPassword}>
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color={showPassword ? 'black' : "#AFAFB3"} />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 30 }}>
            <TouchableOpacity style={styles.btnconfirm} onPress={handleConfirmPassword}>
              <Text style={styles.textconfirm}>ถัดไป</Text>
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

export default ConfirmPassword

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
  errorText: {
    width: 400,
    marginBottom: 10,
    color: 'red',
  },
  textInput: {
    fontSize: 16,
    color: 'black',
  },
})