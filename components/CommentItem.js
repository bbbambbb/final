import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const CommentItem = ({ comment, onEdit, onDelete, isOwner, currentUser, userToken, blogId }) => {
  const canEditOrDelete = isOwner || comment.user === currentUser;

  const handleDelete = async () => {
    try {
      if (!userToken) return;  // Ensure userToken is available
      const response = await axios.delete(`http://192.168.1.85:5001/blogs/${blogId}/comments/${comment.id}`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });

      if (response.status === 200) {
        onDelete(comment.id);  // Notify parent component about the deletion
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleEdit = async (newCommentText) => {
    try {
      if (!userToken) return;  // Ensure userToken is available
      const response = await axios.put(`http://192.168.1.85:5001/blogs/${blogId}/comments/${comment.id}`, {
        text: newCommentText,
      }, {
        headers: { Authorization: `Bearer ${userToken}` }
      });

      if (response.status === 200) {
        onEdit(comment.id, newCommentText);  // Notify parent component about the edit
      }
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.author}>{comment.user}</Text>
        <Text style={styles.date}>{new Date(comment.createdAt).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.content}>{comment.comment}</Text>

      {canEditOrDelete && (
        <View style={styles.actions}>
          {comment.user === currentUser && (
            <TouchableOpacity onPress={() => handleEdit(comment.comment)} style={styles.actionButton}>
              <Ionicons name="pencil" size={20} color="#4CAF50" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
            <Ionicons name="trash" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  author: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  content: {
    fontSize: 14,
    color: '#333',
    marginVertical: 5,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionButton: {
    marginHorizontal: 5,
  },
});

export default CommentItem;
