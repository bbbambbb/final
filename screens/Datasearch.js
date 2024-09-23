import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Platform, TextInput, TouchableOpacity, View, FlatList, Text, ScrollView } from 'react-native';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import BlogsItem from '../components/BlogsItem';

const Datasearch = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { search } = route.params || {};
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState(search ? String(search) : '');
    const searchRef = useRef();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 30;


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://192.168.1.85:5001/blogs');
                if (response.data && response.data.blogs) {
                    setData(response.data.blogs);
                } else {
                    console.log("Invalid response format:", response.data);
                }
            } catch (error) {
                console.log("error message", error);
            }
        };
        fetchData();
    }, []);

    const getFilteredData = () => {
        if (!searchTerm) {
            return [];
        }

        const searchTerms = searchTerm.toLowerCase().split(' ').filter(term => term.trim() !== '');
        const filteredData = data.filter(item => {
            const objectType = item.object_type ? item.object_type.toLowerCase() : '';
            const objectSubtype = item.object_subtype ? item.object_subtype.toLowerCase() : '';
            const color = item.color ? item.color.toLowerCase() : '';
            const note = item.note ? item.note.toLowerCase() : '';
            const location = item.location ? item.location.toLowerCase() : '';

            const combinedFields = `${objectType} ${objectSubtype} ${color} ${note} ${location}`.toLowerCase();

            return searchTerms.every(term => combinedFields.includes(term));
        });

        return filteredData.reverse();
    };


    const filteredData = getFilteredData();
    // คำนวณข้อมูลที่จะแสดงในแต่ละหน้า
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = filteredData.slice(startIndex, endIndex);

    const navigateToHome = () => {
        navigation.navigate('Home');
    };

    const navigateToCamera = () => {
        navigation.navigate('Camera');
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    const handleNextPage = () => {
        if (endIndex < filteredData.length) {
            setCurrentPage(prevPage => prevPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prevPage => prevPage - 1);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 }}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <AntDesign name="arrowleft" size={24} color="black" style={{ marginTop: 10 }} />
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', alignItems: 'center', width: '95%', justifyContent: "space-between" }}>
                    <TouchableOpacity onPress={() => navigation.navigate('BottomTabs', { screen: 'searchbar' })}>
                        <View style={{ marginTop: 10 }}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '100%',
                                    justifyContent: "space-between"
                                }}>
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        width: "92.5%",
                                        height: 35,
                                        borderRadius: 20,
                                        marginLeft: 10,
                                        backgroundColor: "#FFFF"
                                    }}>
                                    <TextInput
                                        placeholder="ค้นหา..."
                                        value={searchTerm}
                                        maxLength={500}
                                        style={{ flex: 1, paddingStart: 15 }}
                                        editable={false}
                                    />

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
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView>
                <FlatList style={styles.list}
                    data={getFilteredData()}
                    keyExtractor={(item, index) => index.toString()}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity
                            onPress={() => {
                                navigation.navigate('Bloginfo');
                            }}
                        >
                            <BlogsItem item={item} key={index} />
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <View>
                            <TouchableOpacity onPress={navigateToHome}>
                                <Ionicons style={styles.emptyicon} name="search-circle-sharp" size={100} color="black" />
                                <Text style={styles.emptyText}> ไม่พบสิ่งของที่คุณตามหา กรุณาลองใหม่อีกครั้ง</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    numColumns={2}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                />

                {/* ซ่อน paginationContainer ถ้าไม่มีข้อมูล */}
                {getFilteredData().length > 0 && (
                    <View style={styles.paginationContainer}>
                        {currentPage > 1 && (
                            <TouchableOpacity onPress={handlePreviousPage} style={styles.arrowButton}>
                                <AntDesign name="left" size={24} color="#006FFD" />
                            </TouchableOpacity>
                        )}
                        <Text style={styles.pageNumber}>{currentPage}</Text>
                        {currentData.length === itemsPerPage && endIndex < filteredData.length && (
                            <TouchableOpacity onPress={handleNextPage} style={styles.arrowButton}>
                                <AntDesign name="right" size={24} color="#006FFD" />
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </ScrollView>

        </SafeAreaView >
    );
}

export default Datasearch;
const styles = StyleSheet.create({

    emptyText: {
        textAlign: 'center',
        marginTop: 10,
        fontSize: 18,
        color: '#555',
    },
    emptyicon: {
        textAlign: 'center',
        marginTop: 50,
        color: '#556',
    },
    list: {
        marginHorizontal: 10,
        marginVertical: 25,
        borderRadius: 20,
        paddingBottom: 20,
        marginLeft: 14
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    arrowButton: {
        paddingHorizontal: 10,
    },
    pageNumber: {
        fontSize: 18,
        color: '#000000',

    },
});