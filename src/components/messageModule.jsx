import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { sendMessage, sendReply } from "../service/messageService";

export default function MsgModule({
        isOpen,
        onClose,
        mode,
        targetId,
        onSuccess
    }){
        const [content, setContent] = useState('');
        const [isSending, setIsSending] = useState(false);
        const navigate = useNavigate();

        if (!isOpen){
            return null
        };
        const sendHandler = ()=>{
            if (!content.trim()){
                return
            };
            setIsSending(true);
            const Caller = mode === 'article' ? sendMessage(content, targetId) : sendReply(content, targetId);
            Caller
            .then(()=>{
                setContent('');
                toast.success('已送出！');
                onSuccess(content);
                onClose();
            })
            .catch((err)=>{
                const errorDict ={
                    'article id is required':'無效操作',
                    'message id is required':'無效操作',
                    'requirements cannot be blanked':'信件內容不可留白！',
                    'target not exists':'文章已遺失',
                    'account not verified':'請驗證帳戶後再留言！',
                    'invalid actions, message to your own articles are forbiddened':'無法對自己的文章發表訊息' 
                };
                const invalid = ['login expired, please retry','invalid token or unauthorized'];
                const response_msg = err.response?.data?.msg;
                if (invalid.includes(response_msg)){
                    toast.error('登入已失效，請重新登入');
                    localStorage.removeItem('token');
                    navigate('/login');
                }else{
                    const errorDisplay = errorDict[response_msg] ||'Oops, something went wrong';
                    console.log(err.message);
                    toast.error(errorDisplay);
                }; 
            })
            .finally(()=>{
                setIsSending(false);
            })
        };
        return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(4px)', zIndex: 99, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ background: 'white', padding: '30px 40px', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', width: '100%', maxWidth: '500px' }}>
                <h3 style={{ marginTop: 0, marginBottom: '5px', color: '#222' }}>
                    {mode === 'article' ? '撰寫站內信' : '回覆訊息'}
                </h3>

                <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="請輸入內容..."
                    style={{ width: '100%', height: '150px', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', resize: 'none', fontFamily: 'inherit', outline: 'none', marginBottom: '20px', boxSizing: 'border-box' }}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button 
                        onClick={onClose} 
                        disabled={isSending}
                        style={{ padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', border: 'none', background: '#f0f0f0', color: '#333', fontWeight: 'bold' }}
                    >
                        取消
                    </button>
                    <button 
                        onClick={sendHandler}
                        disabled={!content.trim() || isSending}
                        style={{ padding: '8px 20px', borderRadius: '6px', cursor: content.trim() ? 'pointer' : 'not-allowed', border: 'none', background: content.trim() ? '#9932CC' : '#ccc', color: '#fff', fontWeight: 'bold' }}
                    >
                        {isSending ? '發送中...' : '發送'}
                    </button>
                </div>
            </div>
        </div>
    );

    }

