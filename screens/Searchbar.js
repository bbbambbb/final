import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Platform, TextInput, TouchableOpacity, View, FlatList, Text } from 'react-native';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const Searchbar = () => {
    const navigation = useNavigation();

    const [data, setData] = useState([]);
    const [search, setSearch] = useState('');
    const searchRef = useRef();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("http://192.168.1.85:5001/blogs");
                if (response.data && response.data.blogs) {
                    setData(response.data.blogs);
                } else {
                    console.log("Invalid response format:", response.data);
                }
            } catch (error) {
                console.log("error message", error);
            }
        }
        fetchData();
    }, []);

    const SearchEnter = () => {
        if (search !== '') {
            navigation.navigate("Datasearch", { search: search });
        }
    };

    const SearchPress = (selectedWord) => {
        const word = selectedWord.toString().trim();
        if (word !== '') {
            setSearch(word); // แทนที่คำที่กดในช่องค้นหา
            navigation.navigate("Datasearch", { search: word });
        }
    };

    const getFilteredSuggestions = (searchText) => {
        if (!searchText) {
            return [];
        }

        const searchTerms = searchText.toLowerCase().split(' ').filter(term => term.trim() !== '');
        const suggestions = new Set();

        // Check each item in the data
        data.forEach(item => {
            const objectType = item.object_type ? item.object_type.toLowerCase() : '';
            const objectSubtype = item.object_subtype ? item.object_subtype.toLowerCase() : '';
            const color = item.color ? item.color.toLowerCase() : '';
            const note = item.note ? item.note.toLowerCase() : '';
            const location = item.location ? item.location.toLowerCase() : '';

            // Combine fields into a single string for matching
            const combinedFields = `${objectType} ${objectSubtype} ${color} ${note} ${location}`;

            // Check if the combined fields include all search terms
            if (searchTerms.every(term => combinedFields.includes(term))) {
                suggestions.add(combinedFields.trim());
            }
        });

        // Return sorted array of suggestions or an empty array if none matched
        return suggestions.size > 0 ? [...suggestions].sort() : [];
    };


    const navigateToCamera = () => {
        navigation.navigate('Camera');
    };

    return (
        <SafeAreaView style={{ paddingTop: Platform.OS === "android" ? 10 : 0, flex: 1, backgroundColor: "#F5F5F5" }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 }}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <AntDesign name="arrowleft" size={24} color="black" />
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', alignItems: 'center', width: '95%', justifyContent: "space-between" }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', width: "82%", height: 35, borderRadius: 20, marginLeft: 10, backgroundColor: "#FFFF" }}>
                        <TextInput
                            ref={searchRef}
                            placeholder="ค้นหา..."
                            value={search}
                            onChangeText={(txt) => setSearch(txt)}
                            maxLength={500}
                            style={{ flex: 1, paddingStart: 15 }}
                            returnKeyType="search"
                            onSubmitEditing={SearchEnter}
                        />
                        {search !== '' && (
                            <TouchableOpacity
                                style={{ marginRight: 10 }}
                                onPress={() => {
                                    searchRef.current.clear();
                                    setSearch('');
                                }}>
                                <AntDesign name="close" size={24} color="black" />
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', height: 45, marginRight: 10 }}>
                        <TouchableOpacity onPress={navigateToCamera}>
                            <MaterialIcons
                                name="linked-camera"
                                size={28}
                                color="#C5C6CC"
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <FlatList
                data={getFilteredSuggestions(search)}
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => SearchPress(item)}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, marginBottom: 7, marginTop: 20 }}>
                            <FontAwesome
                                style={{ paddingLeft: 7, paddingRight: 15 }}
                                name="search"
                                size={20}
                                color="black"
                            />
                            <Text style={{ flex: 1, flexWrap: 'wrap' }} numberOfLines={5}>{item}</Text>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text></Text>}
            />

        </SafeAreaView>
    );
}

export default Searchbar;