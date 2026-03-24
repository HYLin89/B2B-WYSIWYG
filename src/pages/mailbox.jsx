import { useEffect, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getMessages, getMessage, changeIsRead  } from "../service/messageService";
import MsgModule from "../components/messageModule";

export default function Mailbox(){

    const current_user = localStorage.getItem('currentUser_user_name');

    const [messageList, setMessageList] = useState([]);
    const [messageMeta, setMsgMeta] = useState({total_pages:1, current_page:1});
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoadInit, setIsLoadInit] = useState(true);
    const [isLoadMore, setIsLoadMore] = useState(false);
    const [error, setError] = useState(null);

    const [messageId, setMessageId] = useState(null);
    const [message, setMessage] = useState(null);
    const [isLoadingMsg, setIsLoadingMsg] = useState(false);
    const [isModuleOp, setIsModuleOp] = useState(false);
    const chatEndRef = useRef(null);

    const navigate = useNavigate();

    const MsgClickHandler = (msg) =>{
        setMessageId(msg.id);
    }

    useEffect(()=>{
        if (currentPage === 1){
            setIsLoadInit(true);
        }else{
            setIsLoadMore(true);
        };
        
        getMessages(`page=${currentPage}`)
        .then((response)=>{
            const allMessages = response.data.messages || [];
            if (currentPage === 1){
                setMessageList(allMessages);
            }else{
                setMessageList(prev =>[...prev, ...allMessages])
            };
            setMsgMeta(response.data.meta);
        })
        .catch((err)=>{
            setError(err.message);
            const errorDict ={
                'user not exists':'無效操作',
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
            setIsLoadInit(false);
            setIsLoadMore(false);

        })
    },[currentPage]);

    const scrollHandler = (e)=>{
        const {scrollTop, clientHeight, scrollHeight} = e.target;
        const isBottom = scrollHeight - scrollTop <=clientHeight +50;
        if (isBottom && !isLoadMore && !isLoadInit && currentPage < messageMeta.total_pages){
            setCurrentPage(prev => prev +1);
        }
    };

    useEffect(()=>{
        if (!messageId){
            return
        };
        setIsLoadingMsg(true);

        const currentMsgInfo = messageList.find(m => m.id === messageId);
        const current_user = localStorage.getItem('currentUser_user_name') || ""; 
        const displayTitle = currentMsgInfo?.title || "未知文章";
        const isCurrentlyUnRead = currentMsgInfo && !currentMsgInfo.is_read; 

        getMessage(messageId)
        .then((response)=>{
            const raw = response.data.message_data || [];
            
            const formattedContent = raw.map(item =>({
                id: item.msg_id,
                parent_id:item.parent_id,
                is_me: item.user === current_user,
                sender: item.user,
                content: item.content,
                time: item.datetime,
                article_id: item.article_id
            }));
            setMessage({
                title:displayTitle,
                content:formattedContent,
                articleId:raw.length>0? raw[0].article_id : null
            });
            if (isCurrentlyUnRead && formattedContent.length > 0 ){
                const rootMsgId = formattedContent[0].parent_id ? formattedContent[0].parent_id : formattedContent[0].id;

                if (current_user == formattedContent[0].sender){
                    return
                };
                
                changeIsRead(rootMsgId)
                .then(()=>{
                    setMessageList(prev => prev.map(m => m.id === messageId ? {...m, is_read:true} : m));
                })
                .catch(err=>{
                    const errorDict ={
                        'message id is required':'無效操作',
                        'target not exists':'訊息已遺失'
                    };
                    const invalid = ['user not exists','login expired, please retry','invalid token or unauthorized'];
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
            };
        })
        .catch((err)=>{
            const errorDict ={
                'message id is required':'無效操作',
                'message not exists':'訊息已遺失',
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
            setIsLoadingMsg(false)
        })
    },[messageId, messageList.length]);

    useEffect(()=>{
        if (message?.content){
            chatEndRef.current?.scrollIntoView({behavior:'smooth'});
        }
    },[message?.content]);

    const replySuccessHandler = (sent)=>{
        const msg = {
            id:`temp-${Date.now()}`,
            is_me:true,
            sender: current_user,
            content: sent,
            time: new Date().toISOString().split('T')[0], // 格式化為 YYYY-MM-DD
            article_id: message?.article_id
        };
        setMessage(prev => ({
            ...prev,
            content: [...(prev.content || []), msg]
        }));
        getMessage(messageId)
        .then((response)=>{
            const raw = response.data.message_data || [];
            
            const formattedContent = raw.map(item =>({
                id: item.msg_id,
                is_me: item.user === current_user,
                sender: item.user,
                content: item.content,
                time: item.datetime,
                article_id: item.article_id
            }));
            setMessage({
                title:message?.title || 'REPLY',
                content:formattedContent,
                articleId:raw.length>0? raw[0].article_id : null
            });
            setMessageList(prev => 
                prev.map(m => m.id === messageId ? { ...m, is_read: true } : m)
            );
        })
        .catch((err)=>{
            const errorDict ={
                'message id is required':'無效操作',
                'message not exists':'訊息已遺失',
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
            setIsLoadingMsg(false)
        })  
    };
    
    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 74px)', backgroundColor: '#fff', borderTop: '1px solid #eee' }}>
            
            {/* 左側：訊息列表 (無限滾動區塊)*/}
            <div style={{ width: '350px', borderRight: '1px solid #eaeaea', display: 'flex', flexDirection: 'column', backgroundColor: '#fafafa' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #eaeaea', fontWeight: 'bold', fontSize: '18px', backgroundColor: '#fff' }}>
                    我的信箱
                </div>

                <div 
                    style={{ flex: 1, overflowY: 'auto', position: 'relative' }}
                    onScroll={scrollHandler} 
                >
                    {/* 情境 1：初次載入中 */}
                    {isLoadInit ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>載入中...</div>
                    ) : 
                    /* 情境 2：初次載入發生錯誤 */
                    error && currentPage === 1 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#dc3545' }}>無法開啟信箱...</div>
                    ) : 
                    /* 情境 3：成功拿到資料，但是空陣列 */
                    messageList.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#777' }}>信箱目前空空如也...</div>
                    ) : (
                        /* 情境 4：成功渲染訊息卡片 */
                        <>
                            {messageList.map(msg => (
                                <div 
                                    key={msg.id}
                                    onClick={() => MsgClickHandler(msg)}
                                    style={{ 
                                        padding: '16px 20px', 
                                        borderBottom: '1px solid #eee',
                                        cursor: 'pointer',
                                        backgroundColor: messageId === msg.id ? '#F3E5F5' : '#fff',
                                        borderLeft: messageId === msg.id ? '4px solid #9932CC' : '4px solid transparent',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontWeight: msg.is_read ? 'normal' : 'bold', color: '#333', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {/* 未讀紅點 */}
                                            {!msg.is_read && <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#ff4d4f', borderRadius: '50%', marginRight: '6px' }}></span>}
                                            {msg.title}
                                        </span>
                                    </div>
                                    {/* 收寄件提示 */}
                                    <span style={{ color:'#aaa', marginRight: '5px', fontSize: '12px' }}>
                                        {msg.from == current_user ? 'YOU' : msg.from}
                                    </span>
                                    <div style={{ color: '#aaa', fontSize: '12px', marginTop: '8px', textAlign: 'right' }}>
                                        {msg.timestamp}
                                    </div>
                                </div>
                            ))}

                            {/* 滾動時底部的 Loading 提示 */}
                            {isLoadMore && (
                                <div style={{ padding: '15px', textAlign: 'center', color: '#999', fontSize: '13px' }}>
                                    載入更多訊息中...
                                </div>
                            )}

                            {/* 已經到達最後一頁的提示 */}
                            {!isLoadMore && currentPage >= messageMeta.total_pages && messageList.length > 0 && (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#ccc', fontSize: '12px' }}>
                                    已經沒有更多訊息囉
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* 右側：詳細聊天室 (保留骨架，等您串好左側) */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
                {!messageId ? (
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#ccc' }}>
                        <h3>請在左側選擇一則訊息</h3>
                    </div>
                ) : isLoadingMsg ? (
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#999' }}>
                        載入中...
                    </div>
                ) : message ? (
                    <>
                        {/* 聊天室標題區塊 */}
                        <div style={{ padding: '20px', borderBottom: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '18px', color: '#333' }}>{message.title}</h3>
                            {message.article_id && (
                                <button 
                                    onClick={() => window.open(`/article/${message.article_id}`, '_blank')}
                                    style={{ padding: '6px 12px', fontSize: '12px', cursor: 'pointer', border: '1px solid #9932CC', backgroundColor: 'transparent', color: '#9932CC', borderRadius: '4px' }}
                                >
                                    前往文章
                                </button>
                            )}
                        </div>

                        {/* 聊天內容區塊 (改為 Gmail 信件串列風格) */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {message.content && message.content.map((msg, index) => (
                                <div key={msg.id || index} style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    border: '1px solid #eaeaea', 
                                    borderRadius: '8px', 
                                    padding: '20px', 
                                    backgroundColor: msg.is_me ? '#fafafa' : '#fff' // 稍微區分自己與對方的底色
                                }}>
                                    {/* 信件標頭：發件人與時間 */}
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center', 
                                        borderBottom: '1px solid #eee', 
                                        paddingBottom: '12px', 
                                        marginBottom: '15px' 
                                    }}>
                                        <div style={{ fontWeight: 'bold', color: '#333', fontSize: '15px' }}>
                                            發件人: <span style={{ color: msg.is_me ? '#9932CC' : '#333' }}>{msg.is_me ? `YOU (${msg.sender})` : msg.sender}</span>
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#888' }}>
                                            時間: {msg.time}
                                        </div>
                                    </div>
                                    
                                    {/* 信件內文 */}
                                    <div style={{ 
                                        color: '#333',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        fontSize: '15px',
                                        lineHeight: '1.6'
                                    }}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        {/* 底部回覆按鈕區塊 */}
                        <div style={{ padding: '15px 20px', borderTop: '1px solid #eaeaea', backgroundColor: '#fff' }}>
                            <button 
                                onClick={() => setIsModuleOp(true)}
                                style={{ width: '100%', padding: '12px', borderRadius: '6px', cursor: 'pointer', border: 'none', background: '#9932CC', color: '#fff', fontWeight: 'bold', fontSize: '16px' }}
                            >
                                回覆訊息
                            </button>
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#dc3545' }}>
                        載入訊息失敗
                    </div>
                )}
            </div>

            {/* 載入共用的回覆模組 */}
            <MsgModule 
                isOpen={isModuleOp} 
                onClose={() => setIsModuleOp(false)} 
                mode="reply" 
                targetId={messageId} 
                onSuccess={replySuccessHandler} 
            />
            
        </div>
    )
}