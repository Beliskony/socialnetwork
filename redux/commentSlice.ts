import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'


export interface UserBrief {
  _id: string;
  username: string;
  profilePicture?: string
}

export interface Comment {
  _id: string;
  user: UserBrief;   // User ID
  post: string;    // Post ID
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface CommentState {
  comments: Comment[]
}

const initialState: CommentState = {
  comments: [],
}



//Thunk asynchrone pour recuperer les comments d'un post
export const fetchCommentsByPostAsync = createAsyncThunk(
  'comments/get',
  async ({postId}: {postId: string;}, {getState, rejectWithValue}) =>{
    try {
      const token = (getState() as any).user.token;
      const response =await axios.get(`https://apisocial-g8z6.onrender.com/api/comment/getComment/${postId}`,
        { headers:{ Authorization: `Bearer ${token}` }}
      )
        return response.data as Comment[];
      
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Erreur inconnue';
        console.error("Erreur lors du commentaire:", message);
        return rejectWithValue(message)
    }
  }
)

//Thunk asynchronr pour ajouter un commentaire
export const addCommentAsync = createAsyncThunk(
  'comment/add',
  async ({  postId, content } : { postId: string; content: string }, {getState,rejectWithValue}) => {
    try {
      const token = (getState() as any).user.token;
      const response = await axios.post(`https://apisocial-g8z6.onrender.com/api/comment/create/${postId}`,
        { content},
        {
          headers:{
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data as Comment
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Erreur inconnue';
        console.error("Erreur lors du commentaire:", message);
        return rejectWithValue(message)
    }
  }
)


//Thunk asynchronr pour modifier un commentaire
export const updateCommentAsync = createAsyncThunk(
  'comment/updateComment',
  async (
    { commentId, content, }: { commentId: string; content: string },
    { getState, rejectWithValue }
  ) => {
    try {
      const token = (getState() as any).user.token;
      const response = await axios.put(
        `https://apisocial-g8z6.onrender.com/api/comment/update/`,
        { commentId, content },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data; // Devrait être le commentaire mis à jour
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Erreur lors de la modification du commentaire'
      );
    }
  }
);




//Thunk asynchronr pour supprimer un commentaire
export const deleteCommentAsync = createAsyncThunk(
  'comment/deleteComment',
  async (commentId: string, { getState,rejectWithValue }) => {
    try {
      const token = (getState() as any).user.token;
      await axios.delete(
        `https://apisocial-g8z6.onrender.com/api/comment/delete/${commentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return commentId; // On renvoie juste l'id pour le supprimer dans le reducer
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || 'Erreur lors de la suppression du commentaire'
      );
    }
  }
);



const commentSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    setComments: (state, action: PayloadAction<Comment[]>) => {
      state.comments = action.payload
    },
    addComment: (state, action: PayloadAction<Comment>) => {
      state.comments.unshift(action.payload)
    },
    updateComment: (state, action: PayloadAction<{ _id: string; content: string }>) => {
      const comment = state.comments.find(c => c._id === action.payload._id)
      if (comment) {
        comment.content = action.payload.content
        comment.updatedAt = new Date().toISOString()
      }
    },
    deleteComment: (state, action: PayloadAction<string>) => {
      state.comments = state.comments.filter(c => c._id !== action.payload)
    },
  },


  extraReducers(builder) {
      builder
      .addCase(addCommentAsync.fulfilled, (state, action) =>{
        if (action.payload._id) {
          state.comments.unshift(action.payload);
        } else {
          console.warn("Commentaire sans ID reçu du backend :", action.payload);
        }
        
      })
      .addCase(updateCommentAsync.fulfilled, (state, action) => {
      const updated = action.payload;
      const index = state.comments.findIndex(c => c._id === updated._id);
      if (index !== -1) {
        state.comments[index] = updated;
        }
      })
      .addCase(deleteCommentAsync.fulfilled, (state, action) => {
      state.comments = state.comments.filter(c => c._id !== action.payload);
      })
      .addCase(fetchCommentsByPostAsync.fulfilled, (state, action) => {
        console.log("les commentaires a voir : ", action.payload);
        
      state.comments = action.payload;
      })

   
  },
})

export const { setComments, addComment, updateComment, deleteComment } = commentSlice.actions
export default commentSlice.reducer