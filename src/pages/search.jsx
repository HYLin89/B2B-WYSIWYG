import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import TagSideBar from "../components/TagSiderBar";
import { getArticles, userBookMark} from "../service/articleService";
import { toast } from "react-toastify";

const gridContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, 300px)',
    gap: '20px',
    maxWidth: '1260px', 
    width: '100%',
    justifyContent: 'flex-start' 
};

const cardStyle = {
    width: '300px',        // 固定寬度
    height:'280px',
    borderRadius: '12px',
    overflow: 'hidden',    // 確保子元素（圖片）超出部分被切掉
    border: '1px solid #e0e0e0',
    display: 'flex',
    position:'relative',
    flexShrink: 0,
    flexDirection: 'column',
    textDecoration: 'none',
    color: 'inherit',
    cursor:'pointer'
};

const bookmarkContainerStyle = {
    display: 'flex', 
    alignItems: 'center', 
    gap: '4px', 
    zIndex: '1', 
    backgroundColor: '#00000000',
    position: 'absolute',
    right: '20px'
};

const statsContainerStyle = {
    display: 'flex', 
    alignItems: 'center', 
    gap: '4px', 
    zIndex: '1',
    position: 'absolute',
    right: '35px',
    top: '3px', 
    fontSize: '15px'
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


export default function Search(){
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const query = searchParams.get('query') || '';
    const tags = searchParams.get('tag') || '';
    const author = searchParams.get('author') || '';
    const currentPage = parseInt(searchParams.get('page') || '1',10);

    const [articles,setArticles] = useState([]);
    const [userbmkIds,setbmkIds] = useState([]);
    const [meta,setMeta] = useState({total_pages: 1, current_page: 1 });
    const [isLoading, setIsLoading] =useState(false);
    const [error, setError] = useState(null);

    const searchInputRef = useRef(null);

    const pageChangeHandler = (page) =>{
        if (page === currentPage){
            return
        };
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page',(page));
        navigate(`/search?${newParams.toString()}`);
        window.scrollTo({top:0, behaviour:'smooth'});
    };

    useEffect(()=>{
        if (searchInputRef.current){
            searchInputRef.current.value = query;
        }
    },[query]);

    useEffect(()=>{

        setIsLoading(true);
        setError(null);
        setArticles([]);

        if (localStorage.getItem('token')){
            userBookMark()
            .then(response =>{
                setbmkIds(response.data.data);
            })
            .catch(err => {
                const invalid = ['No such user','login expired, please retry','invalid token or unauthorized'];
                const response_msg = err.response?.data?.msg;
                if (invalid.includes(response_msg)){
                    toast.error('登入已失效，請重新登入');
                    localStorage.removeItem('token');
                    navigate('/login');
                }else{
                    console.log(err.message);
                    const errorDisplay = 'Oops, something went wrong';
                    toast.error(errorDisplay);
                };    
            });
        };


        const queryString = searchParams.toString();
        getArticles(queryString)
        .then(response=>{
            setArticles(response.data.article_data);
            setMeta(response.data.meta);
        })
        .catch(err=>{
            setError(err.message);
            console.log(err.message);
            const errorDisplay = 'Oops, something went wrong';
            toast.error(errorDisplay);
        })
        .finally(()=>{
            setIsLoading(false);
        })
    },[query,tags,currentPage,searchParams]);

    const gotoArticle = (article) =>{
        navigate(`/article/${article.id}`);
    }

    return (
        <div className="search-layout">
            <TagSideBar />
            <main className="main-content">
                <h2 style={{ marginBottom: '20px', color: '#333' }}>
                    搜尋結果 {query && `：${query}`} {tags && ` [標籤: ${tags}]`} {author && ` [作者: ${author}]`}
                </h2>

                {isLoading ? (
                    <div style={{ textAlign: 'center', marginTop: '50px', color: '#777' }}>正在搜尋中，請稍候...</div>
                ) : error ? (
                    <div style={{ textAlign: 'center', marginTop: '50px', color: '#dc3545' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-exclamation-triangle-fill" viewBox="0 0 16 16">
                            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
                        </svg>
                        遇到了點問題...
                    </div>
                ) : articles.length > 0 ? (
                    <>
                        {/* 文章列表 */}
                        <div style={gridContainerStyle}>
                            {articles.map((article) => (
                                <div key={article.id} onClick={gotoArticle} role='button' tabIndex='0' style={cardStyle}>
                                    
                                    <div onClick={e=>{toggleBookmark(e, article.id)}}>
                                        <div style={bookmarkContainerStyle}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill={userbmkIds.includes(article.id)? "#00FA9A":"#F5F5F5"} viewBox="0 0 16 16">
                                                <path d="M2 2v13.5a.5.5 0 0 0 .74.439L8 13.069l5.26 2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2"/>
                                            </svg>
                                        </div>
                                        <div style={statsContainerStyle}>
                                            <div>{article.claps}</div>
                                        </div>
                                    </div>

                                    <div style={imageContainerStyle}>
                                        <img src={article.cover_img} style={imageStyle} alt="cover" />
                                    </div>
                                   
                                    <h3 style={{marginTop: '1px', marginBottom: 0, marginLeft:'10px'}}>
                                        {article.title.length > 23? article.title.substring(0,23)+'...':article.title}
                                    </h3>
                                    <p style={{color:'#424242', fontSize: '1rem', marginLeft:'10px'}}>
                                        {article.author} 
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* 5. 分頁按鈕區塊 */}
                        {meta.total_pages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '40px', paddingBottom: '20px' }}>
                                {/* 根據 total_pages 產生一個陣列 [1, 2, 3, ...] 來迴圈渲染按鈕 */}
                                {Array.from({ length: meta.total_pages }, (_, i) => i + 1).map(pageNum => (
                                    <button
                                        key={pageNum}
                                        onClick={() => pageChangeHandler(pageNum)}
                                        style={{
                                            padding: '8px 14px',
                                            backgroundColor: pageNum === currentPage ? '#9932CC' : '#fff',
                                            color: pageNum === currentPage ? '#fff' : '#9932CC',
                                            border: '1px solid #007bff',
                                            borderRadius: '4px',
                                            cursor: pageNum === currentPage ? 'default' : 'pointer',
                                            fontWeight: pageNum === currentPage ? 'bold' : 'normal',
                                            transition: 'all 0.2s'
                                        }}
                                        // 目前所在的頁面，把按鈕停用避免重複點擊
                                        disabled={pageNum === currentPage} 
                                    >
                                        {pageNum}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{ textAlign: 'center', marginTop: '50px', color: '#777' }}>
                        找不到與關鍵字 "{query || tags}" 符合的文章。
                    </div>
                )}
            </main>
        </div>
    )
}