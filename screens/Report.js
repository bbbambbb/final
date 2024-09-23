import { View, Text, SafeAreaView, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Report = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const [userId, setUserId] = useState("");
    const [user, setUser] = useState({});
    const [report, setReport] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = await AsyncStorage.getItem("authToken");
                if (token) {
                    const decodedToken = jwtDecode(token);
                    const userId = decodedToken.userId;
                    setUserId(userId);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
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
            console.log("Error fetching user profile", error);
        }
    };

    const handleSubmitReport = async () => {
        if (report.trim() === "") {
            Alert.alert("Error", "Please provide details for the report.");
            return;
        }
        
        try {
            const token = await AsyncStorage.getItem("authToken");
            const blogId = route.params?.blogId;
            const userId = await AsyncStorage.getItem("userId"); 
    
            if (!userId || !blogId) {
                Alert.alert("เกิดข้อผิดพลาด", "ไม่พบข้อมูล");
                return;
            }
    
            //console.log("Sending report with:", { report, userId, blogId });
    
            const response = await axios.post(
                'http://192.168.1.85:5001/report',
                {
                    report,
                    userId,
                    blogId,
                },
            );
            //console.log("Report submission response:", response.data);
            Alert.alert("ดำเนินการสำเร็จ", "รายงานกระทู้ไม่พึงประสงค์สำเร็จ");
            navigation.goBack();
        } catch (error) {
            //.error("เกิดข้อผิดพลาดในการรายงานกระทู้ไม่พึงประสงค์", error);
            Alert.alert("เกิดข้อผิดพลาด", "รายงานกระทู้ไม่พึงประสงค์ไม่สำเร็จ");
        }
    };
    
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps='always'
                style={{ backgroundColor: 'white' }}
            >
                <View style={styles.profileContainer}>
                    {user.profileImage ? (
                        <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
                    ) : (
                        <MaterialCommunityIcons name="account-circle" size={70} color="#D2E3FF" />
                    )}
                    <View style={styles.userInfo}>
                        <View style={styles.nameContainer}>
                            <Text style={styles.firstname}>{user.firstname || "No data"}</Text>
                            <Text style={styles.lastname}>{user.lastname || "No data"}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.reportDetailsContainer}>
                    {route.params?.obj_picture ? (
                        <Image source={{ uri: route.params.obj_picture }} style={styles.blogImage} />
                    ) : (
                        <Text style={styles.noImageText}>No image available</Text>
                    )}
                    <Text style={styles.reportTitle}>รายละเอียดกระทู้</Text>
                    <Text style={styles.reportDetail}>สิ่งของ: {route.params?.object_subtype}</Text>
                    <Text style={styles.reportDetail}>สี: {route.params?.color}</Text>
                    <Text style={styles.reportDetail}>ตำแหน่งที่ตั้ง: {route.params?.location || "ไม่พบข้อมูล"}</Text>
                    <Text style={styles.reportDetail}>หมายเหตุ: {route.params?.note}</Text>
                </View>

                <View style={styles.textareaContainer}>
                    <TextInput
                        style={styles.textarea}
                        multiline
                        numberOfLines={15}
                        placeholder="กรอกรายละเอียดการรายงาน"
                        value={report}
                        onChangeText={setReport}
                    />
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReport}>
                    <Text style={styles.submitButtonText}>ส่งรายงาน</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

export default Report;

const styles = StyleSheet.create({
    scrollViewContent: {
        flexGrow: 1,
        padding: 20,
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    profileImage: {
        width: 70,
        height: 70,
        borderRadius: 35,
    },
    userInfo: {
        marginLeft: 10,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    firstname: {
        marginEnd: 10,
        fontSize: 16,
        fontWeight: 'bold',
    },
    lastname: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    reportDetailsContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    reportTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    blogImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginBottom: 10,
    },
    noImageText: {
        fontSize: 16,
        color: 'gray',
        marginBottom: 10,
    },
    reportDetail: {
        fontSize: 16,
        marginBottom: 5,
    },
    textareaContainer: {
        marginVertical: 20,
    },
    textarea: {
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
        textAlignVertical: 'top',
        color: 'black',
    },
    submitButton: {
        backgroundColor: '#006FFD',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 13,
        alignItems: 'center',
        marginBottom: 15
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
    },
});