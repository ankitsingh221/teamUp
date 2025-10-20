// api/messageAPI.js
import { axiosInstance } from './axiosInstance';

export const messageAPI = {
  // Send a message
  sendMessage: async (messageData) => {
    try {
      const response = await axiosInstance.post('/messages', messageData);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error; 
    }
  },

  // Get messages with a specific user
  getMessages: async (userId) => {
    try {
      const response = await axiosInstance.get(`/messages/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching messages for user ${userId}:`, error);
      throw error;
    }
  },

  // Get all conversations
  getConversations: async () => {
    try {
      const response = await axiosInstance.get('/messages/conversations');
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },
};

export default messageAPI;
