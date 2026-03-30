import { useState,useEffect,useRef } from "react";
import { Link, useNavigate} from 'react-router-dom';
import { toast } from 'react-toastify';
import { getArticles, addBookMark, userBookMark } from "../service/articleService";
import TagSideBar from "../components/TagSiderBar";

const arrowBtnStyle = {
    width:'40px',
    height:'40px',
    cursor:'pointer',
    borderRadius:'50%',
    border:'1px solid #90A4AE85',
    backgroundColor: '#F5F5F595',
    display:'flex',
    justifyContent:'center',
    alignItems:'center',
    fontSize:'1.2rem',
    zIndex:1,
    position:'absolute',
    transform:'translateY(150%)',
    top:'50px',
    bottom:'50px'
}
const cardStyle = {
    width: '300px',        // 固定寬度
    height:'280px',
    borderRadius: '12px',
    overflow: 'hidden',    // 確保子元素（圖片）超出部分被切掉
    border: '1px solid #e0e0e0',
    display: 'flex',
    flexShrink: 0,
    flexDirection: 'column',
    textDecoration: 'none',
    color: 'inherit',
    cursor:'pointer'
};

const imageContainerStyle = {
    width: '100%',
    aspectRatio: '16 / 9', // 強制固定比例（常見如 1:1 或 16:9）
    overflow: 'hidden',
    backgroundColor: '#f0f0f0' // 圖片載入前的底色
};

const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',    // 關鍵！讓圖片等比例縮放並填滿容器，不變形
    objectPosition: 'center' // 圖片對齊中心
};


export default function Home(){
    const [articles,setArticles] = useState([]);
    const [isLoading,setIsLoading] = useState(true);
    const [error,setError] = useState(null);
    const [meta,setMeta] = useState(null);
    const [showSeeMore,setShowMore] = useState(false);
    const [userbmkIds,setbmkIds] = useState([]);
    const scrollContainerRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('token')){
            userBookMark()
            .then(response =>{
                setbmkIds(response.data.data);
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
        // 呼叫 Service
        getArticles()
        .then(response => {
            setArticles(response.data.article_data);
            setMeta(response.data.meta);
        })
        .catch(err => {
            setError(err.message);
            console.log(err.message);
            const errorDisplay = 'Oops, something went wrong';
            toast.error(errorDisplay);
        })
        .finally(()=>{
            setIsLoading(false);
        })

    }, []); 

    const scrollLeft = () =>{
        if (scrollContainerRef.current){
            scrollContainerRef.current.scrollBy({left: -640, behavior: 'smooth'});
        };
    };
    const scrollRight = () =>{
        if (scrollContainerRef.current){
            scrollContainerRef.current.scrollBy({left: 640, behavior: 'smooth'});
        };
    };

    const scrollHandler = () =>{
        if (!scrollContainerRef.current) {return};
        const currentScroll = scrollContainerRef.current.scrollLeft;
        if ((currentScroll > 2000) || (articles.length < 10 && meta?.total_pages > 1)) {
            setShowMore(true);
        }else{
            setShowMore(false);
        }
    };

    const gotoArticle = (article) =>{
        navigate(`/article/${article.id}`);
    }

    const toggleBookmark = (e, id_, userName) =>{
        e.preventDefault();
        e.stopPropagation();
        const isOwner = localStorage.getItem('currentUser_user_name') === userName;
        if (!isOwner){
            if (localStorage.getItem('token')){
                const isCurrentlyMarked = userbmkIds.includes(id_);
                if (isCurrentlyMarked) {
                    setbmkIds(prev => prev.filter(id => id !== id_));
                } else {
                    setbmkIds(prev => [...prev, id_]);
                };

                setArticles(prevArticles => 
                    prevArticles.map(article => {
                        if (article.id === id_) {
                            return {
                                ...article,
                                claps: isCurrentlyMarked? (article.claps - 1 ): (article.claps + 1 )
                            };
                        };
                        return article;
                    })
                );

                addBookMark(id_)
                .then(()=>{
                    toast.success((isCurrentlyMarked ? '已取消書籤' : '有品味的選擇！'));
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
        }else{
            toast.warning('無法標記自己的文章為書籤');
        }
    }
    
    return (
        <div className='search-layout'>
            <TagSideBar />
            <div style={{maxWidth: '1600px', width: '100%', boxSizing: 'border-box', minWidth: 0, margin: '0 auto', padding: '0 20px 20px 20px'}}>
                <div style={{display:'flex',justifyContent:'space-between', alignItems:'center',marginBottom:'15px', color: '#000000', border: 'none', fontWeight: 'bold'}}>
                    <h2>來點新的</h2>
                    <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                        {showSeeMore &&(
                            <button onClick={() => navigate('/search')} style={{padding:'8px 16px', cursor:'pointer', borderRadius:'20px'}}>
                                還要更多？
                            </button>
                        )}
                    </div>
                </div>
                {error &&(
                    <div style={{color: '#dc3545', padding: '12px', marginBottom: '20px', borderRadius: '6px'}}>
                        Oops something went wrong/{error}
                    </div>
                )}
                {isLoading ? (
                    <h3 style={{color:'#607D8B85'}}>載入中</h3>
                ):(
                    <div style={{position:'relative'}}>
                        <button onClick={scrollLeft} style={{...arrowBtnStyle,left:'5px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)'}}> {'<'} </button>
                        <div ref={scrollContainerRef} onScroll={scrollHandler} style={{display: 'flex', gap: '20px', overflowX:'auto', paddingBottom:'15px',scrollBehavior:'smooth',msOverflowStyle:'none',scrollbarWidth:'none'}}>
                            {articles.length === 0 && !error && (
                                <p>目前沒有任何文章</p>
                            )}
                            
                            {articles.map((article) => (
                                <div key={article.id} onClick={()=> gotoArticle(article)} role='button' tabIndex='0' style={{...cardStyle,position:'relative'}} >
                                    <div onClick={e=>{toggleBookmark(e, article.id, article.author)}}>
                                        <div  style={{display: 'flex', alignItems: 'center', gap: '4px', zIndex:'999', backgroundColor:'#00000000',position:'absolute',right:'20px'}}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill={userbmkIds.includes(article.id)? "#00FA9A":"#F5F5F5"} viewBox="0 0 16 16">
                                                <path d="M2 2v13.5a.5.5 0 0 0 .74.439L8 13.069l5.26 2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2"/>
                                            </svg>
                                        </div>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '4px', zIndex:'999',position:'absolute',right:'35px',top:'3px', fontSize:'15px'}}>
                                            <div>{article.claps}</div>
                                        </div>
                                    </div>
                                    <div style={imageContainerStyle}>
                                        <img src={article.cover_img} style={imageStyle}>
                                        </img>
                                    </div>
                                    <h3 style={{marginTop: '1px', marginBottom: 0, marginLeft:'10px'}}>{article.title.length > 23? article.title.substring(0,23)+'...':article.title}</h3>
                                    <p style={{color:'#424242', fontSize: '1rem', marginLeft:'10px'}}>
                                        {article.author} 
                                    </p>
                                </div>
                            ))}
                            
                        </div>
                        <button onClick={scrollRight} style={{...arrowBtnStyle,right:'5px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)'}}> {'>'} </button>  
                    </div>
                )}
            </div>
        </div>
    );
}