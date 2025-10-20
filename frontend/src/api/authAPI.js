import {axiosInstance} from './axiosInstance';

export const authAPI = {
  // login
  login : async({email, password}) =>{
    const response  = await axiosInstance.post('/auth/login',{email, password});
    return response.data;
  },

  //register

  register : async({name, email, password, role }) =>{
    const response  = await axiosInstance.post('/auth/register/', {name, email, password, role});
    return response.data;
  },
  //logout

  logout: async () =>{
    const response =  await axiosInstance.post('/auth/logout');
    return response.data;
  },
   //get current user
    getCurrentUser: async () =>{
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  }
}

export default authAPI;