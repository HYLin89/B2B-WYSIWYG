import { useState } from "react";
import { Link, useNavigate} from 'react-router-dom';
import { retrievePsw } from "../service/accountService";
import { toast } from "react-toastify";

const inputStyle = {
    width: '100%', padding: '10px', boxSizing: 'border-box', 
    borderRadius: '4px', border: '1px solid #ccc', marginTop: '5px'
};

export default function RetrievePsw(){
    const [account,setAccount] = useState('');
    const navigate = useNavigate();

    const submitHandler=(e) =>{
        e.preventDefault();

        retrievePsw(account)
        .then(() => {
            navigate('/passwordwait');
            toast.info('我們已收到您的請求！');
        })
        .catch(() => {
            navigate('/passwordwait');
            toast.info('我們已收到您的請求！');
        })
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>忘記密碼</h2>
            
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px', fontSize: '0.9rem', lineHeight: '1.5' }}>
                請輸入您註冊時的帳號或信箱：
            </p>

            <form onSubmit={submitHandler} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                {/* 帳號/信箱輸入區塊 */}
                <div>
                    <label style={{ fontWeight: 'bold' }}>帳號 / 信箱 <span style={{color: 'red'}}>*</span></label>
                    <input
                        type="text"
                        value={account}
                        onChange={(e) => setAccount(e.target.value)}
                        required
                        placeholder="請輸入帳號或信箱"
                        style={inputStyle}
                    />
                </div>

                {/* 送出按鈕 */}
                <button type="submit" style={{ padding: '12px', backgroundColor: '#9932CC', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', marginTop: '10px', fontWeight: 'bold' }}>
                    發送重設連結
                </button>
            </form>

            {/* 返回登入的退路連結 (UX 細節) */}
            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
                想起來了嗎？ <Link to="/login" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>點此登入</Link>
            </div>
        </div>
    );

}