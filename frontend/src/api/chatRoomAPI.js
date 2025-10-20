import { axiosInstance } from './axiosInstance';

export const chatRoomAPI = {
  createChatRoom: async (chatRoomData) => {
    try {
      const response = await axiosInstance.post('/chatrooms', chatRoomData);
      return response.data;
    } catch (error) {
      console.error('Error creating chat room:', error);
      throw error;
    }
  },

  getUserChatRooms: async () => {
    try {
      const response = await axiosInstance.get('/chatrooms');
      return response.data;
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      throw error;
    }
  },

  getChatRoomMessages: async (roomId) => {
    try {
      const response = await axiosInstance.get(`/chatrooms/${roomId}/messages`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching messages for room ${roomId}:`, error);
      throw error;
    }
  },

  deleteChatRoom: async (roomId) => {
    try {
      const response = await axiosInstance.delete(`/chatrooms/${roomId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting chat room ${roomId}:`, error);
      throw error;
    }
  },
};

export default chatRoomAPI;
