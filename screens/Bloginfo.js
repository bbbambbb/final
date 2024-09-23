// import { StyleSheet, Text, View, ScrollView, ImageBackground, Dimensions, TouchableOpacity, Modal, TouchableWithoutFeedback, Image, TextInput, FlatList } from 'react-native';
// import React, { useState, useEffect, useCallback } from 'react';
// import { MaterialCommunityIcons, SimpleLineIcons, MaterialIcons, Ionicons } from '@expo/vector-icons';
// import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
// import axios from 'axios';
// import { jwtDecode } from "jwt-decode";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const windowHeight = Dimensions.get('window').height;

// const Bloginfo = () => {
//   const route = useRoute();
//   const navigation = useNavigation();
//   const [userId, setUserId] = useState("");
//   const [user, setUser] = useState(null);
//   const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
//   const [comments, setComments] = useState([]);
//   const [newComment, setNewComment] = useState('');
//   const [commentCount, setCommentCount] = useState(0);
//   const [Loading, setLoading] = useState(true);

//   useEffect(() => {
//     console.log("Route params:", route.params);
//     // Ensure `blogId` is being passed correctly
//     console.log("Blog ID from params:", route.params?.blogId);

//     if (route.params?.blogId) {
//       fetchComments(); // Fetch comments if `blogId` is available
//     }
//   }, [route.params]);

//   const handleMenuPress = () => {
//     setBottomSheetVisible(true);
//   };

//   const handleCloseBottomSheet = () => {
//     setBottomSheetVisible(false);
//   };

//   const reportPost = () => {
//     handleCloseBottomSheet();
//     navigation.navigate('Report', {
//       obj_picture: route.params.obj_picture,
//       object_subtype: route.params.object_subtype,
//       color: route.params.color,
//       location: route.params.location,
//       note: route.params.note
//     });
//   };

//   const contactOwner = () => {
//     handleCloseBottomSheet();
//     navigation.navigate('Chat', { userId: route.params.userId });
//   };

//   const deleteBlog = () => {
//     handleCloseBottomSheet();
//   };

//   const fetchComments = async () => {
//     try {
//       const response = await axios.get(`http://192.168.1.85:5001/blogs/${route.params.blogId}`);
//       setComments(response.data.comments || []);
//       setCommentCount(response.data.commentCount || 0);
//     } catch (error) {
//       console.log("Error fetching comments:", error);
//     }
//   };

//   const postComment = async () => {
//     if (!newComment.trim()) return;

//     try {
//       setLoading(true);
//       await axios.post(`http://192.168.1.85:5001/blogs/${route.params.blogId}/comments`, {
//         userId,
//         comment: newComment
//       });
//       setNewComment(''); // Clear the input after posting
//       await fetchComments(); // Refresh comments
//     } catch (error) {
//       console.log("Error posting comment:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const token = await AsyncStorage.getItem("authToken");
//         if (token) {
//           const decodedToken = jwtDecode(token);
//           const userId = decodedToken.userId;
//           setUserId(userId);
//         }
//       } catch (error) {
//         console.error("Error fetching user data:", error);
//       }
//     };

//     fetchUser();
//   }, []);

//   useFocusEffect(
//     useCallback(() => {
//       if (userId) {
//         fetchUserProfile();
//         fetchComments(); // Fetch comments when the component gains focus
//       }
//     }, [userId])
//   );

//   const fetchUserProfile = async () => {
//     try {
//       const response = await axios.get(`http://192.168.1.85:5001/profile/${userId}`);
//       const userData = response.data.user;
//       setUser(userData);
//     } catch (error) {
//       console.log("Error fetching user profile:", error);
//     }
//   };

//   useEffect(() => {
//     console.log("Route params:", route.params);
//     console.log("Location from params:", route.params?.location);
//   }, [route.params]);

//   return (
//     <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
//       <ScrollView
//         style={{ flex: 1 }}
//         contentContainerStyle={{ flexGrow: 1 }}>
//         <ImageBackground
//           style={{
//             resizeMode: "cover",
//             justifyContent: 'flex-start',
//             alignItems: 'center',
//             height: windowHeight * 0.4
//           }}
//           source={{ uri: route.params.obj_picture }}>
//           <View style={{ marginTop: 40, marginLeft: 12, position: 'absolute', top: 0, left: 15 }}>
//             <TouchableOpacity onPress={() => navigation.goBack()}>
//               <MaterialIcons name="arrow-back-ios" size={40} color="black" />
//             </TouchableOpacity>
//           </View>
//         </ImageBackground>
//         <View style={{ backgroundColor: 'white', borderRadius: 10, margin: 20, elevation: 5, padding: 25 }}>
//           <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
//             <View style={styles.Profile}>
//               {route.params.profileImage ? (
//                 <Image
//                   source={{ uri: route.params.profileImage }}
//                   style={styles.profileImage}
//                 />
//               ) : (
//                 <MaterialCommunityIcons name="account-circle" size={50} color="#006FFD" />
//               )}
//               <View style={styles.userInfo}>
//                 <Text style={styles.username}>{route.params.username || "ไม่มีข้อมูล"}</Text>
//                 <View style={styles.nameContainer}>
//                   <Text style={styles.firstname}>{route.params.firstname || "ไม่มีข้อมูล"}</Text>
//                   <Text style={styles.lastname}>{route.params.lastname || "ไม่มีข้อมูล"}</Text>
//                 </View>
//               </View>
//             </View>
//             <TouchableOpacity onPress={handleMenuPress}>
//               <SimpleLineIcons name="menu" size={24} color="black" />
//             </TouchableOpacity>
//           </View>
//           <View style={{ marginTop: 15 }}>
//             <Text style={styles.textdetail}>สิ่งของ: {route.params.object_subtype}</Text>
//             <Text style={styles.textdetail}>สี: {route.params.color}</Text>
//             <Text style={styles.textdetail}>
//               ตำแหน่งที่ตั้ง: {route.params.location || "ไม่พบข้อมูล"}
//             </Text>
//             <Text style={styles.textdetail}>หมายเหตุ: {route.params.note}</Text>
//           </View>
//         </View>


//         <View style={styles.commentSection}>

//           <Text style={styles.commentCount}>ความคิดเห็นทั้งหมด: {comments.length}</Text>
//           <FlatList
//             data={comments}
//             keyExtractor={(item) => item._id}
//             renderItem={({ item }) => (
//               <View style={styles.commentItem}>
//                 <View style={styles.Profile}>
//                   {item.user?.profileImage ? (
//                     <Image
//                       source={{ uri: item.user?.profileImage }}
//                       style={styles.profileImage}
//                     />
//                   ) : (
//                     <MaterialCommunityIcons name="account-circle" size={50} color="#006FFD" />
//                   )}
//                   <View style={styles.userInfo}>
//                     <Text style={styles.username}>{item.user?.username || "ไม่มีข้อมูล"}</Text>
//                     <View style={styles.nameContainer}>
//                       <Text style={styles.firstname}>{item.user?.firstname || "ไม่มีข้อมูล"}</Text>
//                       <Text style={styles.lastname}>{item.user?.lastname || "ไม่มีข้อมูล"}</Text>
//                     </View>
//                   </View>
//                 </View>

//                 <Text style={styles.commentText}>{item.comment}</Text>
//                 <Text style={styles.commentDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
//               </View>
//             )}
//           />
//         </View>

//       </ScrollView>
//       <View style={styles.commentInputContainer}>
//         <TextInput
//           style={styles.commentInput}
//           placeholder="แสดงความคิดเห็น"
//           value={newComment}
//           onChangeText={setNewComment}
//         />
//         <TouchableOpacity style={styles.commentButton} onPress={postComment}>
//           <Text style={styles.commentButtonText}>ส่ง</Text>
//         </TouchableOpacity>
//       </View>
//       <BottomSheetModal visible={bottomSheetVisible} onClose={handleCloseBottomSheet} onReport={reportPost} onContactOwner={contactOwner} />
//     </View>
//   );
// };

// const BottomSheetModal = ({ visible, onClose, onReport, onContactOwner }) => {
//   return (
//     <Modal
//       transparent={true}
//       animationType="slide"
//       visible={visible}
//       onRequestClose={onClose}>
//       <View style={styles.bottomSheet}>
//         <TouchableWithoutFeedback onPress={onClose}>
//           <View style={styles.bottomSheetOverlay}></View>
//         </TouchableWithoutFeedback>
//         <View style={styles.bottomSheetContainer}>
//           <View style={styles.bottomSheetContent}>
//             <TouchableOpacity style={styles.bottomSheetItem} onPress={onContactOwner}>
//               <Ionicons name="chatbubble-outline" size={20} color="#006FFD" />
//               <Text style={styles.bottomSheetText}>ติดต่อกับเจ้าของกระทู้</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.bottomSheetItem} onPress={onReport}>
//               <Ionicons name="flag-outline" size={20} color="red" />
//               <Text style={styles.bottomSheetTextCancel}>รายงานกระทู้</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// export default Bloginfo;

// const styles = StyleSheet.create({
//   Profile: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   profileImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//   },
//   userInfo: {
//     marginLeft: 8,
//   },
//   username: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   nameContainer: {
//     flexDirection: 'row',
//   },
//   firstname: {
//     fontSize: 14,
//   },
//   lastname: {
//     fontSize: 14,
//     marginLeft: 5,
//   },
//   textdetail: {
//     fontSize: 14,
//     marginBottom: 5,
//   },
//   commentSection: {
//     backgroundColor: 'white',
//     borderRadius: 10,
//     margin: 20,
//     elevation: 5,
//     padding: 15,
//   },
//   commentCount: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   commentItem: {
//     padding: 10,
//     borderBottomColor: '#ccc',
//     borderBottomWidth: 1,
//   },
//   commentText: {
//     fontSize: 14,
//   },
//   commentInputContainer: {
//     flexDirection: 'row',
//     padding: 10,
//     backgroundColor: 'white',
//     borderTopColor: '#ccc',
//     borderTopWidth: 1,
//   },
//   commentInput: {
//     flex: 1,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     borderRadius: 20,
//     paddingHorizontal: 10,
//     height: 40,
//   },
//   commentButton: {
//     backgroundColor: '#006FFD',
//     borderRadius: 20,
//     marginLeft: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   commentButtonText: {
//     color: 'white',
//     fontSize: 16,
//   },
//   bottomSheet: {
//     flex: 1,
//     justifyContent: 'flex-end',
//   },
//   bottomSheetOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   bottomSheetContainer: {
//     backgroundColor: 'white',
//     padding: 16,
//   },
//   bottomSheetContent: {
//     borderTopLeftRadius: 10,
//     borderTopRightRadius: 10,
//   },
//   bottomSheetItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 10,
//   },
//   bottomSheetText: {
//     marginLeft: 10,
//     fontSize: 16,
//   },
//   bottomSheetTextCancel: {
//     marginLeft: 10,
//     fontSize: 16,
//     color: 'red',
//   },
// });

import { StyleSheet, Text, View, ScrollView, ImageBackground, Dimensions, TouchableOpacity, Modal, TouchableWithoutFeedback, Image, TextInput, FlatList } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { MaterialCommunityIcons, SimpleLineIcons, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";

const windowHeight = Dimensions.get('window').height;

const Bloginfo = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [userId, setUserId] = useState("");
  const [user, setUser] = useState(null);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentCount, setCommentCount] = useState(0);
  const [Loading, setLoading] = useState(true);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedComment, setEditedComment] = useState('');

  useEffect(() => {
    console.log("Route params:", route.params);
    // Ensure `blogId` is being passed correctly
    console.log("Blog ID from params:", route.params?.blogId);

    if (route.params?.blogId) {
      fetchComments(); // Fetch comments if `blogId` is available
    }
  }, [route.params]);

  const handleMenuPress = () => {
    setBottomSheetVisible(true);
  };

  const handleCloseBottomSheet = () => {
    setBottomSheetVisible(false);
  };

  const reportPost = () => {
    handleCloseBottomSheet();
    navigation.navigate('Report', {
      obj_picture: route.params.obj_picture,
      object_subtype: route.params.object_subtype,
      color: route.params.color,
      location: route.params.location,
      note: route.params.note
    });
  };

  const contactOwner = () => {
    handleCloseBottomSheet();
    navigation.navigate('Chat', { userId: route.params.userId });
  };

  const deleteBlog = () => {
    handleCloseBottomSheet();
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`http://192.168.1.85:5001/blogs/${route.params.blogId}`);
      setComments(response.data.comments || []);
      setCommentCount(response.data.commentCount || 0);
    } catch (error) {
      console.log("Error fetching comments:", error);
    }
  };

  const postComment = async () => {
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      await axios.post(`http://192.168.1.85:5001/blogs/${route.params.blogId}/comments`, {
        userId,
        comment: newComment
      });
      setNewComment(''); // Clear the input after posting
      await fetchComments(); // Refresh comments
    } catch (error) {
      console.log("Error posting comment:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await axios.delete(`http://192.168.1.85:5001/blogs/${route.params.blogId}/comments/${commentId}`, {
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem("authToken")}`
        }
      });
      await fetchComments(); // Refresh comments
    } catch (error) {
      console.log("Error deleting comment:", error);
    }
  };

  const editComment = async (commentId) => {
    try {
      await axios.put(`http://192.168.1.85:5001/blogs/${route.params.blogId}/comments/${commentId}`, {
        comment: editedComment
      });
      setEditingCommentId(null); // Clear the editing state
      setEditedComment('');
      await fetchComments(); // Refresh comments
    } catch (error) {
      console.log("Error editing comment:", error);
    }
  };


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
        fetchComments(); // Fetch comments when the component gains focus
      }
    }, [userId])
  );

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`http://192.168.1.85:5001/profile/${userId}`);
      const userData = response.data.user;
      setUser(userData);
    } catch (error) {
      console.log("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    console.log("Route params:", route.params);
    console.log("Location from params:", route.params?.location);
  }, [route.params]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}>
        <ImageBackground
          style={{
            resizeMode: "cover",
            justifyContent: 'flex-start',
            alignItems: 'center',
            height: windowHeight * 0.4
          }}
          source={{ uri: route.params.obj_picture }}>
          <View style={{ marginTop: 40, marginLeft: 12, position: 'absolute', top: 0, left: 15 }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back-ios" size={40} color="black" />
            </TouchableOpacity>
          </View>
        </ImageBackground>
        <View style={{ backgroundColor: 'white', borderRadius: 10, margin: 20, elevation: 5, padding: 25 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={styles.Profile}>
              {route.params.profileImage ? (
                <Image
                  source={{ uri: route.params.profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <MaterialCommunityIcons name="account-circle" size={50} color="#006FFD" />
              )}
              <View style={styles.userInfo}>
                <Text style={styles.username}>{route.params.username || "ไม่มีข้อมูล"}</Text>
                <View style={styles.nameContainer}>
                  <Text style={styles.firstname}>{route.params.firstname || "ไม่มีข้อมูล"}</Text>
                  <Text style={styles.lastname}>{route.params.lastname || "ไม่มีข้อมูล"}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={handleMenuPress}>
              <SimpleLineIcons name="menu" size={24} color="black" />
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: 15 }}>
            <Text style={styles.textdetail}>สิ่งของ: {route.params.object_subtype}</Text>
            <Text style={styles.textdetail}>สี: {route.params.color}</Text>
            <Text style={styles.textdetail}>
              ตำแหน่งที่ตั้ง: {route.params.location || "ไม่พบข้อมูล"}
            </Text>
            <Text style={styles.textdetail}>หมายเหตุ: {route.params.note}</Text>
          </View>
        </View>


        <View style={styles.commentSection}>

          <Text style={styles.commentCount}>ความคิดเห็นทั้งหมด: {comments.length}</Text>
          <FlatList
            data={comments}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={styles.commentItem}>
                <View style={styles.Profile}>
                  {item.user?.profileImage ? (
                    <Image source={{ uri: item.user?.profileImage }} style={styles.profileImage} />
                  ) : (
                    <MaterialCommunityIcons name="account-circle" size={50} color="#006FFD" />
                  )}
                  <View style={styles.userInfo}>
                    <Text style={styles.username}>{item.user?.username || "ไม่มีข้อมูล"}</Text>
                    <View style={styles.nameContainer}>
                      <Text style={styles.firstname}>{item.user?.firstname || "ไม่มีข้อมูล"}</Text>
                      <Text style={styles.lastname}>{item.user?.lastname || "ไม่มีข้อมูล"}</Text>
                    </View>
                  </View>
                </View>

                {editingCommentId === item._id ? (
                  <View>
                    <TextInput
                      style={styles.commentInput}
                      value={editedComment}
                      onChangeText={setEditedComment}
                    />
                    <TouchableOpacity onPress={() => editComment(item._id)}>
                      <Text style={styles.commentButtonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <Text style={styles.commentText}>{item.comment}</Text>
                    <Text style={styles.commentDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>

                    {(userId === item.user._id || userId === route.params.userId) && (
                      <View style={styles.commentActions}>
                        <TouchableOpacity onPress={() => {
                          setEditingCommentId(item._id);
                          setEditedComment(item.comment);
                        }}>
                          <Text style={styles.actionText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteComment(item._id)}>
                          <Text style={styles.actionText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}

                {/* Render replies if needed */}
              </View>
            )}
          />

        </View>

      </ScrollView>
      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="แสดงความคิดเห็น"
          value={newComment}
          onChangeText={setNewComment}
        />
        <TouchableOpacity style={styles.commentButton} onPress={postComment}>
          <Text style={styles.commentButtonText}>ส่ง</Text>
        </TouchableOpacity>
      </View>
      <BottomSheetModal visible={bottomSheetVisible} onClose={handleCloseBottomSheet} onReport={reportPost} onContactOwner={contactOwner} />
    </View>
  );
};

const BottomSheetModal = ({ visible, onClose, onReport, onContactOwner }) => {
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
            <TouchableOpacity style={styles.bottomSheetItem} onPress={onContactOwner}>
              <Ionicons name="chatbubble-outline" size={20} color="#006FFD" />
              <Text style={styles.bottomSheetText}>ติดต่อกับเจ้าของกระทู้</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bottomSheetItem} onPress={onReport}>
              <Ionicons name="flag-outline" size={20} color="red" />
              <Text style={styles.bottomSheetTextCancel}>รายงานกระทู้</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default Bloginfo;

const styles = StyleSheet.create({
  Profile: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    marginLeft: 8,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  nameContainer: {
    flexDirection: 'row',
  },
  firstname: {
    fontSize: 14,
  },
  lastname: {
    fontSize: 14,
    marginLeft: 5,
  },
  textdetail: {
    fontSize: 14,
    marginBottom: 5,
  },
  commentSection: {
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 20,
    elevation: 5,
    padding: 15,
  },
  commentCount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  commentItem: {
    padding: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  commentText: {
    fontSize: 14,
  },
  commentInputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    borderTopColor: '#ccc',
    borderTopWidth: 1,
  },
  commentInput: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    height: 40,
  },
  commentButton: {
    backgroundColor: '#006FFD',
    borderRadius: 20,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  commentButtonText: {
    color: 'white',
    fontSize: 16,
  },
  bottomSheet: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheetContainer: {
    backgroundColor: 'white',
    padding: 16,
  },
  bottomSheetContent: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  bottomSheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  bottomSheetText: {
    marginLeft: 10,
    fontSize: 16,
  },
  bottomSheetTextCancel: {
    marginLeft: 10,
    fontSize: 16,
    color: 'red',
  },
});
