import { axiosInstance } from './axiosInstance';

export const connectionAPI = {
  sendConnectionRequest: async (userId) => {
    try {
      const response = await axiosInstance.post(`/connection/request/${userId}`);
      return response.data; 
    } catch (error) {
      console.error('Error sending connection request:', error);
      throw error; 
    }
  },

  acceptConnectionRequest: async (notificationId) => {
    try {
      const response = await axiosInstance.post(`/connection/accept/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error accepting connection request:', error);
      throw error;
    }
  },

  rejectConnectionRequest: async (notificationId) => {
    try {
      const response = await axiosInstance.post(`/connection/reject/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error rejecting connection request:', error);
      throw error;
    }
  },

  removeConnection: async (userId) => {
    try {
      const response = await axiosInstance.delete(`/connection/remove/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing connection:', error);
      throw error;
    }
  },

  getMyConnections: async () => {
    try {
      const response = await axiosInstance.get('/connection');
      return response.data;
    } catch (error) {
      console.error('Error fetching connections:', error);
      throw error;
    }
  },
};

export default connectionAPI;
