import { useState,useEffect,useRef } from "react";
import { useParams, useNavigate} from 'react-router-dom';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getArticle, addBookMark, userBookMark } from "../service/articleService";
import MsgModule from "../components/messageModule";
import './editor.css';

const default_cover = import.meta.env.VITE_DEFAULT_COVER_URL;

export default function Article(){
    const {id} = useParams();
    const navigate = useNavigate();

    const [article, setArticle] = useState(null);
    const [articleTags, setArticleTags] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isBookMarked,setIsBmked] = useState(false);

    const [isModuleOp, setIsModuleOp] = useState(false);
    
    useEffect(()=>{
        setIsLoading(true);
        if (localStorage.getItem('token')){
            userBookMark()
            .then(response =>{
                const existTags = response.data.data;
                if (existTags.includes(id)){
                    setIsBmked(true);
                };
            })
            .catch(err => {
                const invalid = ['no such user','login expired, please retry','invalid token or unauthorized'];
                const response_msg = err.response?.data?.msg;
                if (invalid.includes(response_msg)){
                    toast.error('登入已失效，請重新登入');
                    localStorage.removeItem('token');
                    navigate('/login');
                }else{
                    console.log(err.message)
                    const errorDisplay = 'Oops, something went wrong';
                    toast.error(errorDisplay);
                };  
            });
        };

        getArticle(id)
        .then((response)=>{
            setArticle(response.data.article_data);
            setArticleTags(response.data.tags);
            document.title = `${response.data.article_data.title}`;
            
        })
        .catch(err=>{
            document.title = 'Oops, thats an error';
            console.log(err.message);
            const errorDisplay = 'Oops, something went wrong';
            toast.error(errorDisplay);
        })

        Promise.all([userBookMark, getArticle]).finally(() => {
            setIsLoading(false);
        });
    },[id, navigate]);

    const toggleBookmark = (e, id_) =>{
        e.preventDefault();
        e.stopPropagation();

        if (localStorage.getItem('token')){
            addBookMark(id_)
            .then(()=>{
                setIsBmked(!isBookMarked);
                toast.success((isBookMarked ? '已取消書籤' : '有品味的選擇！'));
            })
            .catch((err)=>{
                const errorDict ={
                    'article id is required':'無效操作',
                    'article not exists':'文章已遺失'
                };
                const invalid = ['No such user','login expired, please retry','invalid token or unauthorized'];
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
        }else{
            toast.error('請登入後再操作');
        }
    };

    const messageHandler = (e) =>{
        e.stopPropagation();
        setIsModuleOp(true);
    };

    const replySuccessHandler = ()=>{
        setIsModuleOp(false);
        return
    }

    if (isLoading) {
        return <div className="loading-container">載入中...</div>
    };
    if (!article) {
        return null
    };
    const user = localStorage.getItem('currentUser_account');
    const isOwner = user === article.account;

    return (
        <div style={{ 
            maxWidth: '800px',        // 固定最大寬度
            minWidth: '320px',        // 限制最小寬度，防止手機過度縮小
            width: '100%',             // 在 min- 與 max- 之間自動填滿
            margin: '0 auto',          // 完美置中
            padding: '40px 20px',      // 基礎上下左右縮排 (20px 為側邊留白)
            fontFamily: 'sans-serif', 
            minHeight: '100vh',
            boxSizing: 'border-box'    // 確保 padding 不會撐破 min/max width
        }}>
        

            <div className="editor-scroll-area" style={{ padding: '0' }}> 
            
                <main className="editor-main-content">

                    {/* 1. 封面圖 (若無則不顯示) */}
                    {article.cover_img && (
                        <div className="cover-upload-area" style={{ marginBottom: '30px' }}>
                            <img 
                                src={article.cover_img} 
                                alt="文章封面" 
                                style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px' }}
                                onError={(e) => { e.target.src = default_cover; }}
                            />
                        </div>
                    )}

                    {/* 2. 標題區 */}
                    <div className="title-area">
                        {/* 復用 title-input 的字體設定，但改為純文字顯示 */}
                        <h1 className="title-input" style={{ fontSize: '48px', margin: '0 0 10px 0', color: '#333', cursor: 'default' }}>
                            {article.title}
                        </h1>
                    </div>

                    {/* 3. 標題下方的資訊列：更新時間 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', paddingBottom: '15px', borderBottom: '1px solid #eaeaea', color: '#888' }}>
                        <span>更新於：{(article.updated_at)}</span>
                    </div>

                    {/* 4. Markdown 內文渲染區 */}
                    <div className="content-area ProseMirror" style={{ minHeight: 'auto', paddingBottom: '20px' }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {article.content}
                        </ReactMarkdown>
                    </div>

                    {/* 5. 底部書籤按鈕 */}
                    {!isOwner &&
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '60px 0 40px 0' }}>
                        <button 
                            onClick={(e) => toggleBookmark(e, id)}
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', 
                                border: '1px solid #9932CC', borderRadius: '24px', 
                                background: isBookMarked ? '#9932CC' : 'transparent', 
                                color: isBookMarked ? 'white' : '#9932CC', 
                                cursor: 'pointer', fontSize: '16px', transition: 'all 0.2s' 
                            }}
                        >
                            <span style={{ fontSize: '20px' }}>
                            {isBookMarked ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"  viewBox="0 0 16 16">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                                    <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"/>
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                                </svg>
                            )}
                            </span>
                            {isBookMarked ? '已收藏文章' : '收藏文章'}
                        </button>
                    </div>
                    }
                    {articleTags && articleTags.length > 0 && (
                        <div 
                            style={{ 
                                display: 'flex', 
                                flexWrap: 'nowrap',
                                overflowX: 'auto',
                                gap: '10px',
                                padding: '10px 5px',
                                marginBottom: '40px',
                                WebkitOverflowScrolling: 'touch',
                            }}
                            className="hide-scrollbar" 
                        >
                            {articleTags.map((tag, index) => (
                                <span 
                                    key={index}
                                    style={{ 
                                        backgroundColor: '#F3E5F5', 
                                        color: '#9932CC', 
                                        padding: '6px 14px', 
                                        borderRadius: '20px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        whiteSpace: 'nowrap',
                                        flex: '0 0 auto',
                                        border: '1px solid #E1BEE7',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#E1BEE7'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#F3E5F5'}
                                >
                                    # {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* 6. 底部作者區塊 */}
                    <div onClick={()=>{navigate(`/${article.account}`)}} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f9fa', padding: '30px', borderRadius: '12px', marginTop: '20px', cursor:'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            {/* 作者大頭貼 */}
                            {article.avatar ? (
                            <img 
                                src={article.avatar} 
                                alt="avatar" 
                                style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover' }} 
                            />
                            ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="110" height="110" fill="#9932CC" viewBox="0 0 16 16">
                                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                                <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
                            </svg>
                            )}
                            <div>
                                {/* 作者名稱 */}
                                <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#333' }}>{article.author}</h3>
                                
                            </div>
                        </div>

                        {/* 撰寫站內信聯繫作者按鈕 */}
                        <div>
                            <button 
                                onClick={messageHandler}
                                disabled={isOwner}
                                className='custom-tooltip'
                                data-tooltip={isOwner ? '無法寄信給自己' : '分享你的想法'}
                                style={{ 
                                    display: 'flex', alignItems: 'center',marginRight:'30px', padding: '10px 20px', 
                                    border: 'none', borderRadius: '8px', cursor: isOwner ? 'not-allowed' : 'pointer', 
                                    backgroundColor:'#00000000', opacity: isOwner ? 0.5 : 1 
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="#70809095" viewBox="0 0 16 16">
                                    <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zm.192 8.159 6.57-4.027L8 9.586l1.239-.757.367.225A4.49 4.49 0 0 0 8 12.5c0 .526.09 1.03.256 1.5H2a2 2 0 0 1-1.808-1.144M16 4.697v4.974A4.5 4.5 0 0 0 12.5 8a4.5 4.5 0 0 0-1.965.45l-.338-.207z"/>
                                    <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m.354-5.354 1.25 1.25a.5.5 0 0 1-.708.708L13 12.207V14a.5.5 0 0 1-1 0v-1.717l-.28.305a.5.5 0 0 1-.737-.676l1.149-1.25a.5.5 0 0 1 .722-.016"/>
                                </svg>
                                
                            </button>
                        </div>
                        
                    </div>

                </main>
            </div>
            
            <MsgModule 
                isOpen={isModuleOp} 
                onClose={() => setIsModuleOp(false)} 
                mode="article" 
                targetId={article.id} 
                onSuccess={replySuccessHandler} 
            />
        </div>
    );
}
