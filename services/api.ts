import axios from "axios";

const BASE_URL = 'https://apisocial-g8z6.onrender.com/api';

//tous les appels API

//Pour Posts
export const fetchPosts = () => axios.get(`${BASE_URL}/post/getAllPosts`)
export const createPost = (user: string) => axios.post(`${BASE_URL}/post/create`)
export const deletePost = (user: string ,postId: string) => axios.delete(`${BASE_URL}/post/delete/${postId}`)
export const updatePost = (user: string, postId: string) => axios.patch(`${BASE_URL}/post/update/${postId}`)
export const postByUser = (user: string) => axios.get(`${BASE_URL}/post`)
export const searchPost = () => axios.get(`${BASE_URL}/post/searchPost`)



//Pour User
export const loginUser = () => axios.post(`${BASE_URL}/user/login`)
export const registerUser = () => axios.post(`${BASE_URL}/user/register`)
export const searchUser = (username: string) => axios.get(`${BASE_URL}/user/search/${username}`)


//Pour Comment
export const addComment = () => axios.post(`${BASE_URL}/comment/create`)
export const deleteComment = () => axios.delete(`${BASE_URL}/comment/delete`)
export const updateComment = () => axios.put(`${BASE_URL}/comment/update`)
export const getCommentOnPost = (postId: string) => axios.post(`${BASE_URL}/comment/getAllComments/${postId}`)


//Pour Story
export const createStory = (user: string) => axios.post(`${BASE_URL}/story/create/`)
export const deleteStory = (user: string, story: string) => axios.delete(`${BASE_URL}/story/delete/${story}`)
export const getUsersStory = () => axios.get(`${BASE_URL}/story/getUser`)
export const expireStory = () => axios.get(`${BASE_URL}/story/expire`)


//Pour Like/Dislike
export const addLike = () => axios.post(`${BASE_URL}/like/add`)
export const dislike = () => axios.delete(`${BASE_URL}/like/remove`)
export const likeByPost = (postId: string) => axios.get(`${BASE_URL}/like/post/${postId}`)


