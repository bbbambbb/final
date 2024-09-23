import { View, Text, SafeAreaView, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image, Modal, TouchableWithoutFeedback } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { firebase } from "../firebase";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import Ionicons from 'react-native-vector-icons/Ionicons';

const UpdateProfile = () => {
    const navigation = useNavigation();
    const [userId, setUserId] = useState("");
    const [user, setUser] = useState({});
    const [profileImage, setProfileImage] = useState("");
    const [username, setUsername] = useState("");
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [bottomSheetVisible, setBottomSheetVisible] = useState(false);

    const handleMenuPress = () => setBottomSheetVisible(true);
    const handleCloseBottomSheet = () => setBottomSheetVisible(false);

    const deleteProfile = async () => {
        setProfileImage("");
        handleCloseBottomSheet();
    };

    const imageOptions = () => {
        handleCloseBottomSheet();
        pickImage();
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
            setProfileImage(userData.profileImage);
            setUsername(userData.username);
            setFirstname(userData.firstname);
            setLastname(userData.lastname);
        } catch (error) {
            console.log("เกิดข้อผิดพลาดในการแสดงข้อมูลผู้ใช้", error);
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    const uploadFile = async () => {
        try {
            if (!profileImage) return null;

            const { uri } = await FileSystem.getInfoAsync(profileImage);

            if (!uri) {
                throw new Error("Invalid file URI");
            }

            const blob = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = () => resolve(xhr.response);
                xhr.onerror = (e) => reject(new TypeError("Network request failed"));
                xhr.responseType = "blob";
                xhr.open("GET", uri, true);
                xhr.send(null);
            });

            const filename = profileImage.substring(profileImage.lastIndexOf("/") + 1);
            const ref = firebase.storage().ref().child(filename);
            await ref.put(blob);

            const downloadURL = await ref.getDownloadURL();
            return downloadURL;
        } catch (error) {
            console.log("เกิดข้อผิดพลาด:", error);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            const profileImageUrl = profileImage ? await uploadFile() : "";

            const response = await axios.put(`http://192.168.1.85:5001/updateProfile/${userId}`, {
                username,
                firstname,
                lastname,
                profileImage: profileImageUrl
            });

            if (response.status === 200) {
                console.log("อัพเดตโปรไฟล์สำเร็จ");
                navigation.goBack();
            }
        } catch (error) {
            console.log("เกิดข้อผิดพลาดในการอัพเดตข้อมูลผู้ใช้", error);
            Alert.alert("เกิดข้อผิดพลาด", "อัพเดตข้อมูลผู้ใช้ไม่สำเร็จ กรุณาลองอีกครั้ง");
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            "ลบบัญชี",
            "คุณแน่ใจหรือว่าต้องการลบบัญชีนี้?",
            [
                {
                    text: "ยกเลิก",
                    style: "cancel"
                },
                {
                    text: "ตกลง",
                    onPress: async () => {
                        try {
                            const response = await axios.post(`http://10.199.120.190:5001/deleteUser/${userId}`);
                            if (response.status === 200) {
                                console.log("ลบข้อมูลผู้ใช้สำเร็จแล้ว");
                                await AsyncStorage.removeItem("authToken");
                                navigation.navigate('Login');
                            }
                        } catch (error) {
                            console.log("เกิดข้อผิดพลาด ลบข้อมูลผู้ใช้ไม่สำเร็จ", error);
                            Alert.alert("เกิดข้อผิดพลาด", "ลบข้อมูลผู้ใช้ไม่สำเร็จ กรุณาลองอีกครั้ง");
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps={'always'}
                style={{ backgroundColor: 'white', marginLeft: 30, marginRight: 30 }}>
                <View style={styles.imagecontainer}>
                    {profileImage ? (
                        <>
                            <Image style={styles.image} source={{ uri: profileImage }} />
                            <View style={styles.imageOptions}>
                                <TouchableOpacity onPress={handleMenuPress}>
                                    <Text style={styles.imageOptionText}>จัดการรูปภาพ</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <TouchableOpacity onPress={pickImage}>
                            <Image style={styles.image} source={require('../src/image/updateprofile.png')} />
                        </TouchableOpacity>
                    )}
                </View>
                <View>
                    <Text style={styles.username}>{user.username || "ไม่มีข้อมูล"}</Text>
                </View>
                <View style={styles.name}>
                    <Text style={styles.firstname}>{user.firstname || "ไม่มีข้อมูล"}</Text>
                    <Text style={styles.lastname}>{user.lastname || "ไม่มีข้อมูล"}</Text>
                </View>
                <View>
                    <Text style={styles.id}>ID: {user._id || "ไม่มีข้อมูล"}</Text>
                </View>

                <View style={{ marginTop: 20 }}>
                    <View>
                        <Text style={{ fontSize: 16 }}>ชื่อผู้ใช้</Text>
                    </View>
                    <View style={styles.textinput}>
                        <TextInput
                            style={{ fontSize: 16, color: 'black' }}
                            placeholder="กรอกชื่อผู้ใช้"
                            value={username}
                            onChangeText={(text) => setUsername(text)}
                        />
                    </View>
                    <View>
                        <View>
                            <Text style={{ fontSize: 16 }}>ชื่อ</Text>
                        </View>
                        <View style={styles.textinput}>
                            <TextInput
                                style={{ fontSize: 16, color: 'black' }}
                                placeholder="กรอกชื่อ"
                                value={firstname}
                                onChangeText={(text) => setFirstname(text)}
                            />
                        </View>
                    </View>
                    <View>
                        <View>
                            <Text style={{ fontSize: 16 }}>นามสกุล</Text>
                        </View>
                        <View style={styles.textinput}>
                            <TextInput
                                style={{ fontSize: 16, color: 'black' }}
                                placeholder="กรอกนามสกุล"
                                value={lastname}
                                onChangeText={(text) => setLastname(text)}
                            />
                        </View>
                    </View>
                </View>

                <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 30 }}>
                    <TouchableOpacity onPress={handleUpdateProfile} style={styles.btnconfirm}>
                        <Text style={styles.textconfirm}>ยืนยัน</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleDeleteAccount}>
                        <Text style={styles.detele}>ลบบัญชี?</Text>
                    </TouchableOpacity>
                </View>
                <BottomSheetModal visible={bottomSheetVisible} onClose={handleCloseBottomSheet} imageOptions={imageOptions} deleteProfile={deleteProfile} />
            </ScrollView>
        </SafeAreaView>
    );
};

const BottomSheetModal = ({ visible, onClose, imageOptions, deleteProfile }) => {
    return (
        <Modal
            transparent={true}
            animationType="slide"
            visible={visible}
            onRequestClose={onClose}>
            <View style={styles.bottomSheet}>
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.bottomSheetOverlay}></View>
                </TouchableWithoutFeedback>
                <View style={styles.bottomSheetContainer}>
                    <View style={styles.bottomSheetContent}>
                        <TouchableOpacity style={styles.bottomSheetItem} onPress={imageOptions}>
                            <Ionicons name="image-outline" size={20} color="#006FFD" />
                            <Text style={styles.bottomSheetText}>เลือกรูปภาพใหม่</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.bottomSheetItem} onPress={deleteProfile}>
                            <Ionicons name="trash" size={20} color="red" />
                            <Text style={styles.bottomSheetTextCancel}>ลบรูปภาพ</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default UpdateProfile;

const styles = StyleSheet.create({
    container: {
        backgroundColor: "white",
        flex: 1
    },
    textinput: {
        color: "black",
        marginVertical: 10,
        width: '100%',
        backgroundColor: "#F3F8FF",
        padding: 13,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#C5C6CC',
    },
    btnconfirm: {
        marginTop: 25,
        backgroundColor: "#006FFD",
        borderRadius: 13,
        padding: 16,
        marginBottom: 20,
        width: '100%',
    },
    textconfirm: {
        textAlign: 'center',
        color: 'white',
        fontSize: 15,
        fontWeight: 'bold'
    },
    detele: {
        color: '#6F6F6F',
        fontWeight: '500',
        textAlign: 'center',
        fontSize: 14,
        textDecorationLine: 'underline'
    },
    name: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    username: {
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 18,
    },
    firstname: {
        marginEnd: 10,
        fontSize: 18,
        fontWeight: 'bold',
    },
    lastname: {
        fontSize: 18,
        fontWeight: '900',
    },
    id: {
        marginTop: 2,
        marginBottom: 12,
        textAlign: 'center',
        color: '#71727A',
    },
    imagecontainer: {
        marginTop: 45,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
    },
    image: {
        width: 126,
        height: 126,
        borderRadius: 63,
    },
    imageOptions: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
    imageOptionText: {
        marginHorizontal: 10,
        color: '#006FFD',
        fontWeight: 'bold',
    },
    bottomSheet: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    bottomSheetOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    bottomSheetContainer: {
        overflow: 'hidden',
        backgroundColor: 'white',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        elevation: 20,
        shadowColor: '#00000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    bottomSheetContent: {
        backgroundColor: 'white',
        padding: 16,
    },
    bottomSheetItem: {
        flexDirection: 'row',
        paddingVertical: 16,
        alignItems: 'center',
    },
    bottomSheetText: {
        fontSize: 16,
        color: 'black',
        textAlign: 'center',
        marginLeft: 10,
    },
    bottomSheetTextCancel: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
        marginLeft: 10,
    },
});