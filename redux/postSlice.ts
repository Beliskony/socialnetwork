import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { IUserPopulated ,ICommentPopulated } from '@/intefaces/comment.Interfaces'


export interface Media {
  images?: string[]
  videos?: string[]
}




export interface Post {
  _id: string;
  user: IUserPopulated; // ou directement { _id: string; username: string } si tu populates côté backend
  text?: string;
  media?: {
    images?: string[];
    videos?: string[];
  };
  likes?: string[]; // ✅ Type string[] car Mongo renvoie des IDs en string (pas Types.ObjectId)
  comments?:ICommentPopulated[];
  createdAt: string;
  updatedAt: string;
}


interface PostState {
  posts: Post[]
  loading: boolean
  error: string | null
}

const initialState: PostState = {
  posts: [],
  loading: false,
  error: null
}

// Thunk asynchrone pour ajouter un post
export const addPost = createAsyncThunk(
  'posts/addPost',
  async (payload: { text?: string; media?: Media }, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as any).user.token;
      console.log('Token dans addPost:', token);
      if (!token) {
        return rejectWithValue('Token non trouvé, veuillez vous connecter');
      }
      const response = await axios.post('https://apisocial-g8z6.onrender.com/api/post/create', payload, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      return response.data // doit être un objet Post complet
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Erreur lors de la création du post')
    }
  }
)

// Thunk pour mettre à jour un post
export const updatePostAsync = createAsyncThunk(
  'posts/updatePost',
  async (payload: { postId: string; data: Partial<Post> }, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as any).user.token;
      if (!token) {
        return rejectWithValue('Token non trouvé, veuillez vous connecter');
      }
      const response = await axios.put(`https://apisocial-g8z6.onrender.com/api/post/update/${payload.postId}`, payload.data,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      return response.data
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Erreur lors de la modification du post')
    }
  }
)

// Thunk pour supprimer un post
export const deletePostAsync = createAsyncThunk(
  'posts/deletePost',
  async (postId: string, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as any).user.token;
      if (!token) {
        return rejectWithValue('Token non trouvé, veuillez vous connecter');
      }
      await axios.delete(`https://apisocial-g8z6.onrender.com/api/post/delete/${postId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      return postId
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Erreur lors de la suppression du post')
    }
  }
)


//Thunk pour récupérer tous les posts
export const fetchPostsAsync = createAsyncThunk(
  'posts/fetchPosts',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as any).user.token;
      if (!token) {
        return rejectWithValue('Token non trouvé, veuillez vous connecter');
      }
      const response = await axios.get('https://apisocial-g8z6.onrender.com/api/post/AllPosts',
        { headers:{ Authorization: `Bearer ${token}` } }
      );
      return response.data // doit être un tableau de Post
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)


export const fetchPostsByUserAsync = createAsyncThunk(
  'posts/fetchPostsByUser',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as any).user.token;
      if (!token) return rejectWithValue('Token non trouvé');

      const response = await axios.get(`https://apisocial-g8z6.onrender.com/api/post/getPostsByUser`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Erreur lors du chargement des posts utilisateur');
    }
  }
);


//toggle liker une publication
export const toggleLikePostAsync = createAsyncThunk(
  'posts/toggleLikePost',
  async ({postId}:{postId: string}, { getState, rejectWithValue }) => {
    try {
      const token = (getState() as any).user.token;
      if (!token) return rejectWithValue('Token non trouvé');

      const response = await axios.put(`https://apisocial-g8z6.onrender.com/api/like/toggle/${postId}`, 
        {}, 
       { headers: { Authorization: `Bearer ${token}` }}
      );

      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Erreur lors du like/dislike du post');
    }
  }
)




const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {

    setPosts(state, action: PayloadAction<Post[]>) {
      state.posts = action.payload
    },

    updatePost(state, action: PayloadAction<Post>) {
      const index = state.posts.findIndex(p => p._id === action.payload._id)
      if (index !== -1) state.posts[index] = action.payload
    },

    deletePost(state, action: PayloadAction<string>) {
      state.posts = state.posts.filter(p => p._id !== action.payload)
    },

    postByUser(state, action: PayloadAction<Post[]>) {
      state.posts = action.payload;
    },

    // Fonction pour liker ou retirer le like d'un post
    toggleLike(state, action: PayloadAction<{ postId: string; userId: string }>) {
      const { postId, userId } = action.payload;
      const post = state.posts.find(p => p._id === postId);

        if (post) {
        const index = post.likes?.indexOf(userId);
          if (index !== undefined && index !== -1) {
            post.likes?.splice(index, 1); // Retirer le like
          } else{
            post.likes?.push(userId); // Ajouter le like
          }
      }
    }

  },

  extraReducers: (builder) => {
      builder
      .addCase(addPost.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(addPost.fulfilled, (state, action) => {
        state.loading = false
        state.posts.unshift(action.payload)
      })
      .addCase(addPost.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(updatePostAsync.fulfilled, (state, action) => {
        const index = state.posts.findIndex(p => p._id === action.payload._id)
        if (index !== -1) state.posts[index] = action.payload
      })
      .addCase(deletePostAsync.fulfilled, (state, action) => {
        state.posts = state.posts.filter(p => p._id !== action.payload)
      })
      .addCase(toggleLikePostAsync.fulfilled, (state, action) => {
        const { postId, liked, userId } = action.payload;
        const post = state.posts.find(p => p._id === postId);
     
       if (post && userId) {
        if (liked && !post.likes?.includes(userId)) {
          post.likes?.push(userId);
        } else if (!liked && post.likes?.includes(userId)) {
            post.likes = post.likes?.filter(id => id !== userId);
          }
        }
      })
    },
})

export const { setPosts, updatePost, deletePost, toggleLike } = postSlice.actions
export default postSlice.reducer