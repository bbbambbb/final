import { View, Text, SafeAreaView, ScrollView, StyleSheet, TouchableOpacity, TextInput, Pressable, Image, Dimensions, ActivityIndicator, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import { useNavigation, useRoute } from "@react-navigation/native";
import { FontAwesome, Ionicons } from '@expo/vector-icons';

import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

import axios from 'axios';
import { firebase } from "../firebase";
import * as FileSystem from "expo-file-system";

const AddBlog = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const [userId, setUserId] = useState("");
    const [obj_picture, setPicture] = useState("");
    const [object_subtype, setObjsubtype] = useState("");
    const [color, setColor] = useState("");
    const [location, setLocation] = useState("");
    const [note, setNote] = useState("");
    const [isAdding, setIsPosting] = useState(false);
    const { imageUri, labels, labelcolor } = route.params || {};
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const token = await AsyncStorage.getItem("authToken");
            if (token) {
                const decodedToken = jwtDecode(token);
                setUserId(decodedToken.userId);
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
        setPicture(imageUri || "");
    }, [imageUri]);

    useEffect(() => {
        if (labels && labels.length > 0) {
            const sortedLabels = labels
                .sort((a, b) => b.score - a.score)
                .slice(0, 1);
            const labelDescriptions = sortedLabels.map(label => label.description).join(', ');

            if (labelDescriptions === 'อื่นๆ') {
                setObjsubtype('อื่นๆ');
            } else {
                setObjsubtype(labelDescriptions);
            }
        } else {
            setObjsubtype('อื่นๆ');
        }
    }, [labels]);

    useEffect(() => {
        if (labelcolor && labelcolor.length > 0) {
            const sortedColors = labelcolor
                .sort((a, b) => b.score - a.score)
                .slice(0, 1);
            setColor(sortedColors.map(color => `${color.description} (${(color.score * 100).toFixed(2)}%)`).join(', '));
        }
    }, [labelcolor]);

    useEffect(() => {
        if (labelcolor && labelcolor.length > 0) {
            const highestColor = labelcolor.reduce((max, color) => color.score > max.score ? color : max, { score: 0 });
            setColor(highestColor.description);
        }
    }, [labelcolor]);

    const handleSelectLocation = () => {
        navigation.navigate('Map', {
            onLocationSelect: (selectedLocation) => {
                const locationParts = selectedLocation.split(" ");
                if (locationParts.length > 1) {
                    const placeName = locationParts.slice(1).join(" ");
                    setLocation(placeName);
                } else {
                    setLocation(selectedLocation);
                }
            }
        });
    };

    const createBlog = async () => {
        setIsPosting(true);
        try {
            const uploadedUrl = await uploadFile(obj_picture);

            const blogData = {
                obj_picture: uploadedUrl,
                object_subtype: object_subtype,
                color: color,
                location: location,
                note: note,
                userId: userId,
            };

            const response = await axios.post("http://192.168.1.85:5001/create", blogData);
            setIsPosting(false);
            console.log("Blog created", response.data);
            if (response.status === 201) {
                navigation.navigate('Home');
            }
        } catch (error) {
            console.log("Error creating blog", error);
            setIsPosting(false);
        }
    };

    const uploadFile = async (obj_picture) => {
        try {
            const { uri } = await FileSystem.getInfoAsync(obj_picture);

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

            const filename = obj_picture.substring(obj_picture.lastIndexOf("/") + 1);
            const ref = firebase.storage().ref().child(filename);
            await ref.put(blob);
            const downloadURL = await ref.getDownloadURL();
            return downloadURL;
        } catch (error) {
            console.log("Error:", error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.select}>
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <View style={styles.imageContainer}>
                            {imageUri ? (
                                <Image source={{ uri: imageUri }} style={styles.image} />
                            ) : (
                                <FontAwesome name="camera" size={30} color="#A6D4FF" />
                            )}
                        </View>
                    </TouchableOpacity>
                </View>

                <Pressable>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>ชนิดสิ่งของ</Text>
                        <TextInput
                            value={object_subtype}
                            onChangeText={(text) => setObjsubtype(text)}
                            style={styles.textinput}
                        />
                    </View>
                </Pressable>

                <Pressable>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>สี</Text>
                        <TextInput
                            value={color}
                            onChangeText={(text) => setColor(text)}
                            style={styles.textinput}
                        />
                    </View>
                </Pressable>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>ตำแหน่งที่ตั้ง</Text>
                </View>

                <Pressable onPress={handleSelectLocation} style={styles.locationButton}>
                    <View style={styles.locationContainer}>
                        <FontAwesome name="map-marker" size={22} color="#006FFD" style={styles.locationIcon} />
                        <Text style={styles.locationText}>
                            {location || 'เลือกตำแหน่งที่ตั้ง'}
                        </Text>
                    </View>
                </Pressable>

                <Pressable>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>หมายเหตุ</Text>
                        <TextInput
                            value={note}
                            onChangeText={(text) => setNote(text)}
                            multiline={true}
                            numberOfLines={10}
                            style={styles.textarea}
                        />
                    </View>
                </Pressable>

                <Pressable
                    onPress={createBlog}
                    style={styles.containeradd}
                    disabled={isAdding}>
                    {isAdding ? (
                        <>
                            <ActivityIndicator size="small" color="#fff" />
                            <Text style={styles.textadd}>กำลังบันทึก...</Text>
                        </>
                    ) : (
                        <Text style={styles.textadd}>ยืนยัน</Text>
                    )}
                </Pressable>
            </ScrollView>

            <Modal visible={modalVisible} transparent={true} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <Image source={{ uri: imageUri }} style={styles.fullImage} />
                    <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                        <Ionicons name="close" size={40} color="white" />
                    </TouchableOpacity>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default AddBlog;

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1,
    },
    select: {
        width: width * 0.9,
        height: height * 0.27,
        marginTop: 30,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 20,
    },
    imageContainer: {
        width: width * 0.9,
        height: height * 0.27,
        borderRadius: 20,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    textinput: {
        color: "black",
        marginVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        paddingBottom: 12.5,
        paddingTop: 12.5,
        borderColor: '#C5C6CC',
        fontSize: 16,
        paddingLeft: 10,
    },
    textarea: {
        height: 150,
        textAlignVertical: 'top',
        borderRadius: 8,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#C5C6CC',
        color: "black",
        fontSize: 16,
        paddingLeft: 10,
        paddingBottom: 12.5,
        paddingTop: 12.5,
    },
    inputContainer: {
        marginLeft: 23,
        marginRight: 23,
    },
    label: {
        fontSize: 16,
    },
    containeradd: {
        marginTop: 12,
        backgroundColor: '#006FFD',
        borderRadius: 12,
        padding: 15.5,
        marginLeft: 25,
        marginRight: 25,
        marginBottom: 20,
    },
    textadd: {
        color: 'white',
        textAlign: 'center',
    },
    locationButton: {
        marginLeft: 23,
        marginRight: 23,
        marginBottom: 10,
        paddingVertical: 15,
        borderWidth: 1,
        borderColor: '#C5C6CC',
        borderRadius: 8,
        marginTop: 8
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationIcon: {
        marginLeft: 8,
    },
    locationText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#000',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        width: width * 0.9,
        height: height * 0.8,
        resizeMode: 'contain',
    },
    closeButton: {
        position: 'absolute',
        top: 30,
        right: 20,
    },
});