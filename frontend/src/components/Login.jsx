import { Input } from "./ui/input"
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import appLogo from '@/assets/Logo.jpg';

const Login = () => {
  const [input,setInput] = useState({
    email:"",
    password:""
  })
  const [loading, setLoading] = useState(false);
  const {user} = useSelector(store=>store.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const changeEventHandler = (e) => {
    setInput({...input, [e.target.name]:e.target.value});
  }
  const signupHandler = async (e) => {
    e.preventDefault(); //prevent refreshes and data loss
    console.log(input);
    try {
      setLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/user/login`, input, {
        headers: {
          'Content-Type':'application/json'
        },
        withCredentials:true
      });
      if(res.data.success){
        dispatch(setAuthUser(res.data.user));
        navigate("/");
        toast.success(res.data.message);
        setInput({
          email:"",
          password:""
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Network Error: Could not connect to server");
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=>{
    if(user){
      navigate("/")
    }
  },[]);

  return (
    <div className='flex items-center w-screen h-screen justify-center'>
      <form onSubmit={signupHandler} className='shadow-lg flex flex-col gap-5 p-8'>
        <div className='my-4'>
          <img src={appLogo} alt="App Logo" className="h-30 mx-auto mb-2" />
          <p className='text-sm text-center'>Login to look at updates from people that matter!</p>
        </div>
        <div>
          <span className='py-2 font-medium'>Email</span>
          <Input type="email" name="email"
          value={input.email} 
          onChange={changeEventHandler} 
          className="focus-visible:ring-transparent my-2"/>
        </div>
        <div>
          <span className='py-2 font-medium'>Password</span>
          <Input type="password" name="password"
          value={input.password} 
          onChange={changeEventHandler} 
          className="focus-visible:ring-transparent my-2"/>
        </div>
        {
            loading ? (
                <Button>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Please wait
                </Button>
            ) : (
                <Button className="bg-black text-white" type='submit'>Login</Button>
            )
        }
        <span className='text-center'>Don't have an account?<Link to="/signup" className='text-blue-600'> Signup </Link></span>
      </form>
    </div>
  )
}

export default Login