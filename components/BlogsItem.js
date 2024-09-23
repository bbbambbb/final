import { Pressable, StyleSheet, Text, View, Image } from 'react-native';
import React from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';

const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

const getTimeElapsed = (createdAt) => {
  const now = new Date();
  const postDate = new Date(createdAt);
  const differenceInMs = now - postDate;

  const seconds = Math.floor(differenceInMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);

  if (months > 0) return `${months} เดือนที่แล้ว${months > 1 ? 's' : ''}`;
  if (days > 0) return `${days} วันที่แล้ว${days > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} ชั่วโมงที่แล้ว${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `${minutes} นาทีที่แล้ว${minutes > 1 ? 's' : ''}`;
  return `${seconds} วินาทีที่แล้ว${seconds > 1 ? 's' : ''}`;
}

const BlogsItem = ({ item }) => {
  console.log("Blog Item:", item);

  const navigation = useNavigation();
  const location = truncateText(item?.location || '', 17);
  const object_subtype = truncateText(item?.object_subtype || '', 17);
  const username = truncateText(item?.user?.username || '', 17);
  const firstname = truncateText(item?.user?.firstname || '', 17);
  const lastname = truncateText(item?.user?.lastname || '', 17);
  const timeElapsed = getTimeElapsed(item?.createdAt);

  return (
    <Pressable
    onPress={() => {
        // ตรวจสอบข้อมูลที่ส่งไปยังหน้าจอ Bloginfo
        console.log("Navigating to Bloginfo with params:", {
            blogId: item?._id, // Ensure consistency in the field name
            username: item.user?._id,
            profileImage: item.user?.profileImage,
            username: item.user?.username,
            firstname: item.user?.firstname,
            lastname: item.user?.lastname,
            obj_picture: item?.obj_picture,
            object_subtype: item?.object_subtype,
            color: item?.color,
            note: item?.note,
            location: item?.location,
            comments: item?.comments, 
            reply: item?.comment?.replies
        });

        // นำทางไปยังหน้าจอ Bloginfo
        navigation.navigate('Bloginfo', {
            blogId: item?._id, // Ensure consistency in the field name
            username: item.user?._id,
            profileImage: item.user?.profileImage,
            username: item.user?.username,
            firstname: item.user?.firstname,
            lastname: item.user?.lastname,
            obj_picture: item?.obj_picture,
            object_subtype: item?.object_subtype,
            color: item?.color,
            note: item?.note,
            location: item?.location,
            comments: item?.comments  // Ensure that this is an array of comments
        });
    }}
    
      style={{
        marginHorizontal: 10,
        marginVertical: 25,
        backgroundColor: "#FFFF",
        borderRadius: 20,
        paddingBottom: 20,
        marginLeft: 14
      }}
    >
      <Image style={{
        width: 160,
        height: 160,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        marginBottom: 10
      }}
        source={{ uri: item?.obj_picture }}
      />

      <Text
        style={{
          fontWeight: "bold",
          color: "black",
          marginLeft: 10,
          marginBottom: 5
        }}
      >
        {username}
      </Text>

      <Text
        style={{
          marginLeft: 10,
        }}
      >
        {object_subtype}
      </Text>

      <Text
        style={{
          color: "gray",
          marginLeft: 10,
        }}
      >
        {location}
      </Text>

      <Text
        style={{
          color: "gray",
          marginLeft: 10,
          marginTop: 5,
        }}
      >
        {timeElapsed}
      </Text>
    </Pressable>
  );
}

export default BlogsItem;