import { useState } from "react";
import { Link, useNavigate} from 'react-router-dom';
import { toast } from 'react-toastify';
import { login } from "../service/accountService";

export default function Login(){
    const [account, setAccount] = useState('');
    const [password, setPsw] = useState('');
    const [showPsw,setShowPsw] = useState(false);

    const navigate = useNavigate();

    const submitHandler=(e) =>{
        e.preventDefault();

        login(account,password)
        .then(response => {
            localStorage.setItem('token',response.data.valid_token);
            localStorage.setItem('currentUser_email',response.data.user_data.email);
            localStorage.setItem('currentUser_account',response.data.user_data.account);
            localStorage.setItem('currentUser_user_name',response.data.user_data.user_name);
            localStorage.setItem('currentUser_verfied',response.data.user_data.is_verified);
            localStorage.setItem('currentUser_avatar',response.data.user_data.avatar);
            navigate('/');
            toast.info('歡迎回來！');
        })
        .catch(() => {
            toast.error('帳號或密碼錯誤');

        })
    };
    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>很高興你來了</h2>

            <form onSubmit={submitHandler} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                {/* 帳號輸入區塊 */}
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>帳號：</label>
                    <input
                    type="text"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    required // HTML 原生防呆，沒填不能送出
                    style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                {/* 密碼輸入區塊 */}
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>密碼：</label>
                    <div style={{position:'relative'}}>
                        <input
                        type={showPsw ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPsw(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', paddingRight: '40px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc'}}
                        />
                        <div onClick={() => {setShowPsw(!showPsw)}} style={{position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', cursor:'pointer', display:'flex',alignItems:'center'}}>
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
                            )}
                        </div>

                    </div>
                    
                </div>

                <button type="submit" style={{ padding: '12px', backgroundColor: '#9932CC', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', marginTop: '10px' }}>
                    登入
                </button>
            </form>


            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', fontSize: '0.9rem' }}>

            <Link to="/forgot_password" style={{ color: '#007bff', textDecoration: 'none' }}>忘記密碼？</Link>
            <Link to="/register" style={{ color: '#007bff', textDecoration: 'none' }}>新來的?</Link>
            </div>
        </div>
    )
}



