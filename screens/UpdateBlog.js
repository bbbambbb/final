import { View, Text, SafeAreaView, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const UpdateBlog = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { blogId, obj_picture, object_subtype, color, note, location } = route.params;

    const [subtype, setSubtype] = useState(object_subtype);
    const [colorText, setColor] = useState(color);
    const [noteText, setNote] = useState(note);
    const [locationText, setLocation] = useState(location);
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdate = async () => {
        setIsLoading(true);
        try {
            const token = await AsyncStorage.getItem("authToken");
            const response = await axios.put(
                `http://192.168.1.85:5001/updateBlog/${blogId}`,
                {
                    object_subtype: subtype,
                    color: colorText,
                    note: noteText,
                    location: locationText,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            if (response.status === 200) { 
                Alert.alert("ดำเนินการสำเร็จ", "อัพเดตกระทู้เรียบร้อยแล้ว", [
                    {
                        text: "OK",
                        onPress: () => navigation.goBack('MyBlog'),
                    },
                ]);
            }
        } catch (error) {
            //console.error("เกิดข้อผิดพลาดในการอัพเดตกระทู้", error);
            Alert.alert("กิดข้อผิดพลาด", "อัพเดตกระทู้ไม่สำเร็จ");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Image source={{ uri: obj_picture }} style={styles.blogImage} resizeMode="cover" />
                <Text style={styles.label}>ชนิดสิ่งของ</Text>
                <TextInput
                    style={styles.input}
                    value={subtype}
                    onChangeText={setSubtype}
                    placeholder="Object Subtype"
                />

                <Text style={styles.label}>สี</Text>
                <TextInput
                    style={styles.input}
                    value={colorText}
                    onChangeText={setColor}
                    placeholder="Color"
                />

                <Text style={styles.label}>ตำแหน่งที่ตั้ง</Text>
                <TextInput
                    style={styles.input}
                    value={locationText}
                    onChangeText={setLocation}
                    placeholder="Location"
                />

                <Text style={styles.label}>หมายเหตุ</Text>
                <TextInput
                    style={styles.input}
                    value={noteText}
                    onChangeText={setNote}
                    placeholder="Note"
                    multiline
                />
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleUpdate}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>{isLoading ? 'กำลังอัพเดต...' : 'ยืนยัน'}</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default UpdateBlog;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        padding: 15,
    },
    scrollContainer: {
        flexGrow: 1,
    },
    blogImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginBottom: 15,
    },
    input: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        fontSize: 16,
        borderColor: '#ddd',
        borderWidth: 1,
        color: 'black'
    },
    button: {
        backgroundColor: '#006FFD',
        borderRadius: 10,
        padding: 14,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    label: {
        fontSize: 16,
        paddingLeft: 5,
        paddingBottom: 6
    },
});