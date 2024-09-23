import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Image, FlatList, ActivityIndicator, StatusBar, Alert,ScrollView } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MyBlog = () => {
    const navigation = useNavigation();
    const [userId, setUserId] = useState("");
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = await AsyncStorage.getItem("authToken");
                if (token) {
                    const decodedToken = jwtDecode(token);
                    setUserId(decodedToken.userId);
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
                fetchData();
            }
        }, [userId])
    );

    const fetchData = async () => {
        try {
            const response = await axios.get(`http://192.168.1.85:5001/userBlogs/${userId}`);
            if (response.data.message) {
                setMessage(response.data.message);
                setData([]);
            } else if (response.data && Array.isArray(response.data)) {
                setData(response.data.reverse());
                setMessage("");
            } else {
                setMessage("Error fetching data");
            }
        } catch (error) {
            console.log("Error fetching data:", error);
            setMessage("Data not found");
        } finally {
            setIsLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.blogItem}>
            <TouchableOpacity
                onPress={() =>
                    navigation.navigate('Bloginfo', {
                        blogId: item._id,
                        obj_picture: item.obj_picture,
                        object_subtype: item.object_subtype,
                        color: item.color,
                        note: item.note,
                        location: item.location
                    })
                }
            >
                <Image source={{ uri: item.obj_picture }} style={styles.blogImage} resizeMode="cover" />
            </TouchableOpacity>
            <View style={styles.blogContent}>
                <Text style={styles.blogText}>ชนิดสิ่งของ: {item.object_subtype}</Text>
                <Text style={styles.blogText}>สถานที่: {item.location}</Text>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.btnEditContainer}
                    onPress={() =>
                        navigation.navigate('UpdateBlog', {
                            blogId: item._id,
                            obj_picture: item.obj_picture,
                            object_subtype: item.object_subtype,
                            color: item.color,
                            note: item.note,
                            location: item.location
                        })
                    }
                >
                    <Text style={styles.textedit}>แก้ไข</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.btnDeleteContainer}
                    onPress={() => handleDeleteBlog(item._id)}
                >
                    <Text style={styles.textdelete}>ลบกระทู้</Text>
                </TouchableOpacity>
            </View>
        </View>
    );


    const handleDeleteBlog = (blogId) => {
        console.log(`ลบกระทู้ที่มี ID: ${blogId}`);
        Alert.alert(
            "ยืนยันการลบ",
            "คุณแน่ใจหรือไม่ว่าต้องการลบกระทู้นี้",
            [
                {
                    text: "ยกเลิก",
                    style: "ยกเลิก",
                },
                {
                    text: "ยืนยัน",
                    onPress: async () => {
                        try {
                            await axios.delete(`http://192.168.1.85:5001/deleteBlog/${blogId}`);
                            setData(prevData => prevData.filter(blog => blog._id !== blogId));
                            Alert.alert("ดำเนินการสำเร็จ", "ลบกระทู้เรียบร้อยแล้ว");
                        } catch (error) {
                            //console.log("เกิดข้อผิดพลาดในการลบกระทู้", error);
                            Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถลบกระทู้ได้ กรุณาลองอีกครั้ง");
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {message ? (
                <View style={styles.messageContainer}>
                    <Text>{message}</Text>
                </View>
            ) : (
                <FlatList
                    data={data}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id.toString()}
                />
            )}
        </SafeAreaView>
    );
};

export default MyBlog;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    btnDeleteContainer: {
        backgroundColor: '#FF4C4C',
        borderRadius: 10,
        padding: 13,
        flex: 1,
        marginLeft: 10,
    },
    btnEditContainer: {
        backgroundColor: '#FFA500', // สีของปุ่มแก้ไข
        borderRadius: 10,
        padding: 13,
        flex: 1,
        marginRight: 10,
    },
    textedit: {
        textAlign: 'center',
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    textdelete: {
        textAlign: 'center',
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    blogItem: {
        backgroundColor: 'white',
        borderRadius: 10,
        overflow: 'hidden',
        margin: 15,
    },
    blogImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
    },
    blogContent: {
        padding: 15,
    },
    blogText: {
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
    },
});