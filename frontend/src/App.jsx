import { useEffect } from 'react'
import './App.css'
import ChatPage from './components/ChatPage'
import EditProfile from './components/EditProfile'
import Home from './components/Home'
import Login from './components/Login'
import MainLayout from './components/MainLayout'
import Profile from './components/Profile'
import Signup from './components/Signup'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import {io} from "socket.io-client"
import { useDispatch, useSelector } from 'react-redux'
import { setOnlineUsers } from './redux/chatSlice'
import { setSocket } from './redux/socketSlice'
import { setLikeNotification } from './redux/rtmSlice'
import ProtectedRoutes from './components/ProtectedRoutes'

const browserRouter = createBrowserRouter([
  {
    path:"/",
    element:<ProtectedRoutes><MainLayout /></ProtectedRoutes>,
    children:[
      {
        path:'/',
        element:<ProtectedRoutes><Home/></ProtectedRoutes>
      },
      {
        path:'/profile/:id',
        element:<ProtectedRoutes><Profile /></ProtectedRoutes>
      },
      {
        path:'/account/edit',
        element: <ProtectedRoutes><EditProfile/></ProtectedRoutes>
      },
      {
        path:'/chat',
        element: <ProtectedRoutes><ChatPage/></ProtectedRoutes>
      }
    ]
  },
  {
    path:'/login',
    element:<Login />
  },
  {
    path:'/signup',
    element:<Signup />
  },
])

function App() {
  const {user} = useSelector(store=>store.auth);
  const {socket} = useSelector(store=>store.socketio); 
  const dispatch = useDispatch();
  useEffect(()=>{
    if(user){
      const socketio = io(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}`, {
        query:{
          userId:user?._id
        },
        transports:['websocket']
      });
      dispatch(setSocket(socketio));
      socketio.on('getOnlineUsers', (onlineUsers)=>{ // Listen to all events
        dispatch(setOnlineUsers(onlineUsers));
      });
      socketio.on('notification', (notification) => {
        dispatch(setLikeNotification(notification));
      })
      return ()=>{//cleanup for when tab is closed abruptly
        socketio.close();
        dispatch(setSocket(null));
      }
    } else if(socket) {
      socket?.close();
      dispatch(setSocket(null));
    }
  },[user, dispatch]);

  return (
    <>
      <RouterProvider router={browserRouter}/>
    </>
  )
}

export default App
