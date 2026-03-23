import { useEffect } from "react";
import { useNavigate, useSearchParams} from 'react-router-dom';
import axios from "axios";
import { toast } from "react-toastify";

export default function AccVerify(){
    const [SP_token] = useSearchParams();
    const navigate = useNavigate();
    
    useEffect(()=>{
        const emailToken = SP_token.get('token');
        const baseURL = import.meta.env.VITE_API_BASE_URL;

        if (emailToken){
            const config = {
                method:'patch',
                url:baseURL+'/api/v1/verify',
                headers:{
                    'Authorization':`Bearer ${emailToken}`
                }
            };
            axios.request(config)
            .then(()=>{
                toast.success('驗證完成！ 將導航回登入頁面...')
                setTimeout(()=>{
                    navigate('/login');
                },500);
            })
            .catch((err)=>{
                const invalid = ['No such user','login expired, please retry','invalid token or unauthorized'];
                const response_msg = err.response?.data?.msg;
                if (invalid.includes(response_msg)){
                    toast.error('連結已失效或無效操作，請再試一次');
                    localStorage.removeItem('token');
                    navigate('/login');
                }else{
                    console.log(err.message)
                    const errorDisplay = 'Oops, something went wrong';
                    toast.error(errorDisplay);
                };   
            })
        };
    },[])

    return (
    <h1>
        <div>等待跳轉...</div>
    </h1>
        
    )
}