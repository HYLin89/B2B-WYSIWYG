import { useState } from "react";
import { Link, useNavigate} from 'react-router-dom';
import { register } from "../service/accountService";
import { toast } from "react-toastify";

const inputStyle = {
    width: '100%', padding: '10px', boxSizing: 'border-box', 
    borderRadius: '4px', border: '1px solid #ccc', marginTop: '5px'
};

export default function Register(){
    const [account, setAccount] = useState('');
    const [password, setPsw] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [userName, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [showPsw,setShowPsw] = useState(false);
    const [showConfirmPsw, setShowConfirmPsw] = useState(false);

    const navigate = useNavigate();

    const submitHandler= (e) =>{
        e.preventDefault();

        if (account.length > 25 || account.length <4){
            toast.error('帳號長度必須介於4到25個字元之間')
            return
        }else if (/\W/.test(account)){
            toast.error('帳號含有非法字元')
            return
        };
        if (!/^[a-zA-Z0-9_-]+@[a-zA-Z0-9]+\.[a-z]+$/.test(email)){
            toast.error('不接受分身信箱或不合規的信箱格式')
            return
        };
        if (password!=confirmPassword){
            toast.error('密碼確認失敗')
            return 
        }else if (password.length <8){
            toast.error('密碼強度不足/少於8字元')
            return
        }else if (/[^a-zA-Z0-9+_*@#$%^&!?-]/.test(password)){
            toast.error('密碼含有不被接受的字元')
            return
        }else if (!(/[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[+_*@#$%^&!?-]/.test(password))){
            toast.error('密碼至少要含有一個大小寫字母、數字與特殊字元')
            return
        };
        
        let newUser={
            "account":account,
            "email":email,
            "psw":password,
            "userName":userName || account
        };
        register(newUser)
        .then(()=>{
            toast.success('歡迎您新朋友，請重新登入');
            toast.info('請確認您的信箱以驗證您的帳戶');
            navigate('/login');
            
            
        })
        .catch(err=>{
            const errorDict ={
                'this email or account is already registered':'此帳戶已存在',
                'requirements cannot be blanked':'必填欄位不可空白'
            };
            const response_msg = err.response?.data?.msg;
            const errorDisplay = errorDict[response_msg] || 'Oops, something went wrong';
            console.log(err.message)
            toast.error(errorDisplay);
        })
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>我們隨時歡迎新朋友</h2>

        <form onSubmit={submitHandler} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

            {/* 帳號 (必填) */}
            <div>
            <label style={{ fontWeight: 'bold' }}>帳號 <span style={{color: 'red'}}>*</span></label>
            <input type="text" value={account} onChange={(e) => setAccount(e.target.value)} required style={inputStyle} />
            </div>

            {/* 信箱 (必填，利用 type="email" 讓瀏覽器幫你驗證格式) */}
            <div>
            <label style={{ fontWeight: 'bold' }}>信箱 <span style={{color: 'red'}}>*</span></label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
            </div>

            {/* 用戶名 (非必填) */}
            <div>
            <label style={{ fontWeight: 'bold' }}>用戶名 (選填)</label>
            <input type="text" value={userName} onChange={(e) => setUsername(e.target.value)} style={inputStyle} />
            </div>

            {/* 密碼 (必填) */}
            <div>
            <label style={{ fontWeight: 'bold' }}>密碼 <span style={{color: 'red'}}>*</span></label>
            <div style={{ position: 'relative' }}>
                <input
                type={showPsw ? "text" : "password"}
                value={password}
                onChange={(e) => setPsw(e.target.value)}
                required
                style={{ ...inputStyle, paddingRight: '40px' }} // 預留眼睛的空間
                />
                <div 
                onClick={() => setShowPsw(!showPsw)} 
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', marginTop: '2px' }}
                >
                {showPsw ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
                        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
                    </svg>
                    ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z"/>
                        <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829"/>
                        <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z"/>
                    </svg>
                    )
                }
                </div>
            </div>
            </div>

            {/* 密碼確認 (必填) */}
            <div>
            <label style={{ fontWeight: 'bold' }}>密碼確認 <span style={{color: 'red'}}>*</span></label>
            <div style={{ position: 'relative' }}>
                <input
                type={showConfirmPsw ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ ...inputStyle, paddingRight: '40px' }}
                />
                <div 
                onClick={() => setShowConfirmPsw(!showConfirmPsw)} 
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', marginTop: '2px' }}
                >
                {showConfirmPsw ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
                        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
                    </svg>
                    ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z"/>
                        <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829"/>
                        <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z"/>
                    </svg>
                    )
                }
                </div>
            </div>
            </div>

            {/* 送出按鈕 */}
            <button type="submit" style={{ padding: '12px', backgroundColor: '#9932CC', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', marginTop: '10px', fontWeight: 'bold' }}>
            註冊
            </button>
        </form>

        {/* 返回登入連結 */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
            老朋友？ <Link to="/login" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>點此登入</Link>
        </div>
        </div>
  );
}



