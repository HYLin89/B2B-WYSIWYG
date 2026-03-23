import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getUser } from "../service/accountService";
import { getArticles, getDrafts, getArticle, getDraft, deleteArticle, userBookMark, addBookMark, getBmkArticles } from "../service/articleService";


function whatLink(link){
    const iconSize=20;
    const iconColor = '#708090'

    if (link.includes('https://x.com')){
        return (
        <svg xmlns="http://www.w3.org/2000/svg" width={iconSize} height={iconSize} fill={iconColor} viewBox="0 0 16 16">
            <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/>
        </svg>)
    }else if (link.includes('https://www.threads.net')){
        return (
        <svg xmlns="http://www.w3.org/2000/svg" width={iconSize} height={iconSize} fill={iconColor} viewBox="0 0 16 16">
            <path d="M6.81 9.204c0-.41.197-1.062 1.727-1.062.469 0 .758.034 1.146.121-.124 1.606-.91 1.818-1.674 1.818-.418 0-1.2-.218-1.2-.877Z"/>
            <path d="M2.59 16h10.82A2.59 2.59 0 0 0 16 13.41V2.59A2.59 2.59 0 0 0 13.41 0H2.59A2.59 2.59 0 0 0 0 2.59v10.82A2.59 2.59 0 0 0 2.59 16M5.866 5.91c.567-.81 1.315-1.126 2.35-1.126.73 0 1.351.246 1.795.711.443.466.696 1.132.754 1.983q.368.154.678.363c.832.559 1.29 1.395 1.29 2.353 0 2.037-1.67 3.806-4.692 3.806-2.595 0-5.291-1.51-5.291-6.004C2.75 3.526 5.361 2 8.033 2c1.234 0 4.129.182 5.217 3.777l-1.02.264c-.842-2.56-2.607-2.968-4.224-2.968-2.675 0-4.187 1.628-4.187 5.093 0 3.107 1.69 4.757 4.222 4.757 2.083 0 3.636-1.082 3.636-2.667 0-1.079-.906-1.595-.953-1.595-.177.925-.651 2.482-2.733 2.482-1.213 0-2.26-.838-2.26-1.936 0-1.568 1.488-2.136 2.663-2.136.44 0 .97.03 1.247.086 0-.478-.404-1.296-1.426-1.296-.911 0-1.16.288-1.45.624l-.024.027c-.202-.135-.875-.601-.875-.601Z"/>
        </svg>)
    }else if (link.includes('https://www.facebook.com')){
        return (
        <svg xmlns="http://www.w3.org/2000/svg" width={iconSize} height={iconSize} fill={iconColor} viewBox="0 0 16 16">
            <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951"/>
        </svg>)
    }else if (link.includes('https://www.instagram.com')){
        return (
        <svg xmlns="http://www.w3.org/2000/svg" width={iconSize} height={iconSize} fill={iconColor} viewBox="0 0 16 16">
            <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334"/>
        </svg>)
    }else if (link.includes('https://line.me')){
        return (
        <svg xmlns="http://www.w3.org/2000/svg" width={iconSize} height={iconSize} fill={iconColor}  viewBox="0 0 16 16">
            <path d="M8 0c4.411 0 8 2.912 8 6.492 0 1.433-.555 2.723-1.715 3.994-1.678 1.932-5.431 4.285-6.285 4.645-.83.35-.734-.197-.696-.413l.003-.018.114-.685c.027-.204.055-.521-.026-.723-.09-.223-.444-.339-.704-.395C2.846 12.39 0 9.701 0 6.492 0 2.912 3.59 0 8 0M5.022 7.686H3.497V4.918a.156.156 0 0 0-.155-.156H2.78a.156.156 0 0 0-.156.156v3.486c0 .041.017.08.044.107v.001l.002.002.002.002a.15.15 0 0 0 .108.043h2.242c.086 0 .155-.07.155-.156v-.56a.156.156 0 0 0-.155-.157m.791-2.924a.156.156 0 0 0-.156.156v3.486c0 .086.07.155.156.155h.562c.086 0 .155-.07.155-.155V4.918a.156.156 0 0 0-.155-.156zm3.863 0a.156.156 0 0 0-.156.156v2.07L7.923 4.832l-.013-.015v-.001l-.01-.01-.003-.003-.011-.009h-.001L7.88 4.79l-.003-.002-.005-.003-.008-.005h-.002l-.003-.002-.01-.004-.004-.002-.01-.003h-.002l-.003-.001-.009-.002h-.006l-.003-.001h-.004l-.002-.001h-.574a.156.156 0 0 0-.156.155v3.486c0 .086.07.155.156.155h.56c.087 0 .157-.07.157-.155v-2.07l1.6 2.16a.2.2 0 0 0 .039.038l.001.001.01.006.004.002.008.004.007.003.005.002.01.003h.003a.2.2 0 0 0 .04.006h.56c.087 0 .157-.07.157-.155V4.918a.156.156 0 0 0-.156-.156zm3.815.717v-.56a.156.156 0 0 0-.155-.157h-2.242a.16.16 0 0 0-.108.044h-.001l-.001.002-.002.003a.16.16 0 0 0-.044.107v3.486c0 .041.017.08.044.107l.002.003.002.002a.16.16 0 0 0 .108.043h2.242c.086 0 .155-.07.155-.156v-.56a.156.156 0 0 0-.155-.157H11.81v-.589h1.525c.086 0 .155-.07.155-.156v-.56a.156.156 0 0 0-.155-.157H11.81v-.589h1.525c.086 0 .155-.07.155-.156Z"/>
        </svg>
        )
    }else if (link.includes('https://github.com/')){
        return (
        <svg xmlns="http://www.w3.org/2000/svg" width={iconSize} height={iconSize} fill={iconColor}  viewBox="0 0 16 16">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>
        </svg>)
    }else if (link.includes('https://discord.com/')){
        return (
        <svg xmlns="http://www.w3.org/2000/svg" width={iconSize} height={iconSize} fill={iconColor}  viewBox="0 0 16 16">
            <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612"/>
        </svg>)
    }else{
        return (
        <svg xmlns="http://www.w3.org/2000/svg" width={iconSize} height={iconSize} fill={iconColor} viewBox="0 0 16 16">
            <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m7.5-6.923c-.67.204-1.335.82-1.887 1.855A8 8 0 0 0 5.145 4H7.5zM4.09 4a9.3 9.3 0 0 1 .64-1.539 7 7 0 0 1 .597-.933A7.03 7.03 0 0 0 2.255 4zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a7 7 0 0 0-.656 2.5zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5zM8.5 5v2.5h2.99a12.5 12.5 0 0 0-.337-2.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5zM5.145 12q.208.58.468 1.068c.552 1.035 1.218 1.65 1.887 1.855V12zm.182 2.472a7 7 0 0 1-.597-.933A9.3 9.3 0 0 1 4.09 12H2.255a7 7 0 0 0 3.072 2.472M3.82 11a13.7 13.7 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5zm6.853 3.472A7 7 0 0 0 13.745 12H11.91a9.3 9.3 0 0 1-.64 1.539 7 7 0 0 1-.597.933M8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855q.26-.487.468-1.068zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.7 13.7 0 0 1-.312 2.5m2.802-3.5a7 7 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7 7 0 0 0-3.072-2.472c.218.284.418.598.597.933M10.855 4a8 8 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4z"/>
        </svg>)
    };
};


const arrowBtnStyle = {
    width: '40px',
    height: '40px',
    cursor: 'pointer',
    borderRadius: '50%',
    border: '1px solid #90A4AE85',
    backgroundColor: '#F5F5F595',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '1.2rem',
    zIndex: 1,
    position: 'absolute',
    transform: 'translateY(150%)',
    top: '50px',
    bottom: '50px'
}

const cardStyle = {
    width: '300px',        // 固定寬度
    height:'280px',
    borderRadius: '12px',
    border: '1px solid #e0e0e0',
    display: 'flex',
    flexShrink: 0,
    flexDirection: 'column',
    textDecoration: 'none',
    color: 'inherit',
    cursor: 'pointer'
};

const imageContainerStyle = {
    width: '100%',
    aspectRatio: '16 / 9',
    overflow: 'hidden',
    backgroundColor: '#f0f0f0', 
    borderTopLeftRadius: '11px', 
    borderTopRightRadius: '11px'
};

const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',    // 關鍵！讓圖片等比例縮放並填滿容器，不變形
    objectPosition: 'center' // 圖片對齊中心
};

const socialContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, max-content)', 
    gap: ' 2px 13px',                                  
    justifyContent: 'start',
};

const default_cover = import.meta.env.VITE_DEFAULT_COVER_URL;

export default function Portfolio() {
    const { account: account } = useParams();

    const isValidAcc = /\w/.test(account);
    if (!isValidAcc){
        throw new Error("Invalid account format");
    }

    const navigate = useNavigate();
    const scrollContainerRef = useRef();

    const currentUser = localStorage.getItem('currentUser_account');
    const isOwner = currentUser === account;

    const [profile, setProfile] = useState(null);
    const [userbmkIds,setbmkIds] = useState([]);

    const [publicList, setPublicList] = useState([]);
    const [publicMeta, setPublicMeta] = useState(null);
    const [draftList, setDraftList] = useState(null);
    const [draftMeta, setDraftMeta] = useState(null);
    const [bookMarkList, setBmkList] = useState([]);
    const [bookMarkMeta, setBmkMeta] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('public');
    const [PBshowSeeMore, setPBShowSeeMore] = useState(false);
    const [DFshowSeeMore, setDFShowSeeMore] = useState(false);
    const [BMKshowSeeMore, setBMKShowSeeMore] = useState(false);
    const [openMenu, setOpenMenu] = useState(null);

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
    },[]);

    const toggleBookmark = (e, id_) =>{
        e.preventDefault();
        e.stopPropagation();
        if (!isOwner){
            if (localStorage.getItem('token')){
                const isCurrentlyMarked = userbmkIds.includes(id_);
                if (isCurrentlyMarked) {
                    setbmkIds(prev => prev.filter(id => id !== id_));
                } else {
                    setbmkIds(prev => [...prev, id_]);
                };

                setPublicList(prevArticles => 
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
            };
        }else{
            toast.warning('無法標記自己的文章為書籤')
        };
    };
    
    
    const toggleMenu = (e, id_) => {
        e.stopPropagation();
        if (openMenu === id_) {
            setOpenMenu(null);
        } else {
            setOpenMenu(id_);
        }
    };

    useEffect(() => {
        const closeAllMenus = () => {
            setOpenMenu(null);
        };
        if (openMenu !== null) {
            window.addEventListener('click', closeAllMenus);
        };
        return () => {
            window.removeEventListener('click', closeAllMenus);
        }
    }, [openMenu]);
    
    
    useEffect(() => {
        setIsLoading(true);
        const fetchPublicData = () => {
            getUser(account)
                .then(response => {
                    setProfile(response.data.user);
                })
                .catch(err => {
                    const invalid = ['no such user'];
                    const response_msg = err.response?.data?.msg;
                    if (invalid.includes(response_msg)) {
                        toast.error('用戶不存在');
                    } else {
                        console.log(err.message)
                        const errorDisplay = 'Oops, something went wrong';
                        toast.error(errorDisplay);
                    };
                    return
                })

            const queryString = new URLSearchParams({ author: account }).toString();
            getArticles(queryString)
            .then((response) => {
                setPublicList(response.data.article_data || []);
                setPublicMeta(response.data.meta || { total_pages: 1 });
            })
            .catch((err) => {
                console.log(err.message);
                const errorDisplay = 'Oops, something went wrong';
                toast.error(errorDisplay);
            });

            getBmkArticles(queryString)
            .then(response =>{
                setBmkList(response.data.article_data || []);
                setBmkMeta(response.data.meta || { total_pages: 1 });
            })
            .catch((err) => {
                console.log(err.message);
                const errorDisplay = 'Oops, something went wrong';
                toast.error(errorDisplay);
            })
            
        };

        const fetchPrivateData = () => {
            if (isOwner) {
                getDrafts()
                    .then((response) => {
                        setDraftList(response.data.article_data || []);
                        setDraftMeta(response.data.meta || { total_pages: 1 });
                    })
                    .catch((err) => {
                        console.log(err.message);
                        const errorDisplay = 'Oops, something went wrong';
                        toast.error(errorDisplay);
                    })
            }
        };

        Promise.all([fetchPrivateData(), fetchPublicData()]).finally(() => {
            setIsLoading(false);
        });
    }, [account, isOwner]);

    const scrollLeft = () => {
        if (scrollContainerRef.current) scrollContainerRef.current.scrollBy({ left: -640, behavior: 'smooth' });
    };
    const scrollRight = () => {
        if (scrollContainerRef.current) scrollContainerRef.current.scrollBy({ left: 640, behavior: 'smooth' });
    };
    const scrollHandler = () => {
        if (!scrollContainerRef.current) return;
        const currentScroll = scrollContainerRef.current.scrollLeft;

        // 如果滑動超過一定距離，或是文章不到10篇但總頁數>1，就顯示看更多
        if (activeTab === 'public') {
            if ((currentScroll > 1500) || (publicList.length < 10 && publicMeta?.total_pages > 1)) {
                setPBShowSeeMore(true);
            } else {
                setPBShowSeeMore(false);
            }
        };
        if (activeTab === 'bookmark') {
            if ((currentScroll > 1500) || (publicList.length < 10 && bookMarkMeta?.total_pages > 1)) {
                setBMKShowSeeMore(true);
            } else {
                setBMKShowSeeMore(false);
            }
        };
        if (activeTab === 'draft') {
            if ((currentScroll > 1500) || (draftList.length < 10 && draftMeta?.total_pages > 1)) {
                setDFShowSeeMore(true);
            } else {
                setDFShowSeeMore(false);
            }
        }
    };

    const editHandler = (e, id_, type) => {
        e.stopPropagation();
        const whatToDo = type === 'public' ? getArticle(id_) : getDraft(id_);

        whatToDo
            .then((response) => {
                const article = response.data.article_data;
                const tags = response.data.tags;
                navigate(`/editor`, { state: { articleData: article, articleId: id_, articleStatus: type, articleTags:tags } })
            })
            .catch((err) => {
                console.log(err.message);
                const errorDisplay = 'Oops, something went wrong';
                toast.error(errorDisplay);
            })
    };
    const deleteHandler = (e, id_) => {
        e.stopPropagation();
        if (!window.confirm('是否刪除? 此動作無法復原')) {
            return
        };
        deleteArticle(id_)
            .then(() => {
                toast.success('已刪除文章');
            })
            .catch((err) => {
                const errorDict = {
                    'article id is required': '無效操作',
                    'article not exists': '文章已遺失'
                };
                const invalid = ['login expired, please retry', 'invalid token or unauthorized'];
                const response_msg = err.response?.data?.msg;
                if (invalid.includes(response_msg)) {
                    toast.error('登入已失效，請重新登入');
                    localStorage.removeItem('token');
                    navigate('/login');
                } else {
                    const errorDisplay = errorDict[response_msg] || 'Oops, something went wrong';
                    console.log(err.message);
                    toast.error(errorDisplay);
                }
            })
    };

    if (isLoading) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>載入中...</div>;
    };
    if (!profile) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>找不到該用戶資料</div>;
    };

    let currentList = publicList;
    let currentType = 'public';
    if (activeTab === 'draft') {
        currentList = draftList;
        currentType = 'draft';
    } else if (activeTab === 'bookmark') {
        currentList = bookMarkList;
        currentType = 'bookmark';
    }

    return (
        <div style={{ maxWidth: '1260px', margin: '0 auto', padding: '20px' }}>
            {/* 區塊 1: 個人資料 Header */}
            <header style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
                {profile.avatar ? (
                <img 
                    src={profile.avatar} 
                    alt="avatar" 
                    style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover' }} 
                />
                ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="110" height="110" fill="#9932CC" viewBox="0 0 16 16">
                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                    <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
                </svg>
                )}
                <div style={{ width:'15vw' }}>
                    <h2 style={{ margin: '0 0 10px 0', fontSize:'40px', paddingTop:'15px'}}>{profile?.user_name || account}</h2>
                    <div style={{ ...socialContainerStyle}}>
                        {profile.links.map((link,index)=>(
                            <a key={index} href={link} style={{rel:"noopener noreferrer"}} title={link.toString()}>
                                {whatLink(link)}
                            </a>  
                        ))}
                    </div>
                </div>
                <div style={{display:'flex', marginLeft:'50px'}}>
                    <p style={{ margin: 0, color: '#666', flexDirection:'row-start' }}>{profile?.bio || '//這邊沒有可以展示的...'}</p>
                </div>
                <div style={{ marginLeft:'20px'}}>
                    {isOwner && (
                        <button 
                            onClick={() => navigate('/profile')} 
                            style={{ padding: '5px 16px', marginTop:'12px', background: '#f0f0f0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            編輯
                        </button>
                    )}
                </div>
                
            </header>

            {/* 區塊 2: 頁籤切換 (Tabs) 與看更多按鈕 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <div 
                        onClick={() => setActiveTab('public')} 
                        style={{ padding: '10px 5px', cursor: 'pointer', borderBottom: activeTab === 'public' ? '2px solid #9932CC' : 'none', fontWeight: activeTab === 'public' ? 'bold' : 'normal' }}
                    >
                        已發布 ({publicList?.length || 0})
                    </div>
                    <div 
                        onClick={() => setActiveTab('bookmark')} 
                        style={{ padding: '10px 5px', cursor: 'pointer', borderBottom: activeTab === 'bookmark' ? '2px solid #9932CC' : 'none', fontWeight: activeTab === 'bookmark' ? 'bold' : 'normal' }}
                    >
                        書籤集 ({bookMarkList?.length || 0})
                    </div>
                    {isOwner && (
                        <div 
                            onClick={() => setActiveTab('draft')} 
                            style={{ padding: '10px 5px', cursor: 'pointer', borderBottom: activeTab === 'draft' ? '2px solid #9932CC' : 'none', fontWeight: activeTab === 'draft' ? 'bold' : 'normal' }}
                        >
                            草稿 ({draftList?.length || 0})
                        </div>
                    )}
                </div>
                
                {/* 看更多按鈕 */}
                {activeTab === 'public' && PBshowSeeMore && (
                    <button 
                        onClick={() => navigate(`/search?author=${account}`)} 
                        style={{ padding: '8px 16px', cursor: 'pointer', borderRadius: '20px', border: '1px solid #9932CC', color: '#9932CC', background: '#fff' }}
                    >
                        更多文章
                    </button>
                )}
                {activeTab === 'bookmark' && BMKshowSeeMore && (
                    <button 
                        onClick={() => navigate(`/search?mark_by=${account}`)} 
                        style={{ padding: '8px 16px', cursor: 'pointer', borderRadius: '20px', border: '1px solid #9932CC', color: '#9932CC', background: '#fff' }}
                    >
                        更多書籤
                    </button>
                )}
                {activeTab === 'draft' && DFshowSeeMore && isOwner && (
                    <button 
                        onClick={() => navigate(`/search?author=${account}&status=draft`)} 
                        style={{ padding: '8px 16px', cursor: 'pointer', borderRadius: '20px', border: '1px solid #9932CC', color: '#9932CC', background: '#fff' }}
                    >
                        更多草稿
                    </button>
                )}
            </div>

            {/* 區塊 3: 橫向滑動文章列表 */}
            <div style={{ position: 'relative' }}>
                <button onClick={scrollLeft} style={{ ...arrowBtnStyle, left: '5px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}> {'<'} </button>
                
                <div ref={scrollContainerRef} onScroll={scrollHandler} style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '15px', scrollBehavior: 'smooth', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                    {(!currentList || currentList.length === 0) ? (
                        <p style={{ color: '#999', margin: '20px 0' }}>目前沒有任何文章。</p>
                    ) : (
                        currentList.map(article => (
                            <div key={article.id} onClick={() => navigate(`/article/${article.id}`)} style={{ ...cardStyle, position:'relative'}}>
                            {activeTab === 'public' && (
                                <div onClick={e=>{toggleBookmark(e, article.id)}}>
                                    <div  style={{display: 'flex', alignItems: 'center', gap: '4px', zIndex:'999', backgroundColor:'#00000000',position:'absolute',right:'20px'}}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill={userbmkIds.includes(article.id)? "#00FA9A":"#F5F5F5"} viewBox="0 0 16 16">
                                            <path d="M2 2v13.5a.5.5 0 0 0 .74.439L8 13.069l5.26 2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2"/>
                                        </svg>
                                    </div>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '4px', zIndex:'999',position:'absolute',right:'35px',top:'3px', fontSize:'15px'}}>
                                        <div>{article.claps}</div>
                                    </div>
                                </div>
                            )}
                                <div style={imageContainerStyle}>
                                    {article.cover_img ? (
                                        <img src={article.cover_img} style={imageStyle} alt="cover" />
                                    ) : (
                                        <img src={default_cover} style={imageStyle} alt="cover" />
                                    )}

                                </div>
                                
                                <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                                        <h3 style={{ margin: 0, fontSize: '16px', lineHeight: '1.4', flex: 1 }}>
                                            {article.title?.length > 23 ? article.title.substring(0, 23) + '...' : article.title}
                                        </h3>

                                        {isOwner && activeTab !== 'bookmark' && (
                                            <div className="article-menu-wrapper" style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                                                
                                                <button 
                                                    onClick={(e) => toggleMenu(e, article.id)} 
                                                    style={{ background: 'none', border: 'none', color: '#999', fontSize: '20px', cursor: 'pointer', padding: '0 5px', display: 'flex', alignItems: 'center' }}
                                                    title="更多操作"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                                        <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                                                    </svg>
                                                </button>

                                                {openMenu === article.id && (
                                                    <div 
                                                        className="article-dropdown" 
                                                        style={{ 
                                                            position: 'absolute', 
                                                            bottom: '100%', 
                                                            right: '0', 
                                                            marginTop: '5px',
                                                            background: '#fff', 
                                                            border: '1px solid #eee', 
                                                            borderRadius: '8px', 
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)', 
                                                            zIndex: 9999, 
                                                            minWidth: '100px', 

                                                        }}
                                                    >
                                                        <button 
                                                            onClick={(e) => editHandler(e, article.id, currentType)} 
                                                            style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', background: 'none', border: 'none', padding: '12px 15px', cursor: 'pointer', fontSize: '14px', color: '#333', textAlign: 'left', borderBottom: '1px solid #eee' }}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                            </svg>
                                                            編輯
                                                        </button>
                                                        <button 
                                                            onClick={(e) => deleteHandler(e, article.id)} 
                                                            style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', background: 'none', border: 'none', padding: '12px 15px', cursor: 'pointer', fontSize: '14px', color: '#ff6b6b', textAlign: 'left' }}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                                                <line x1="14" y1="11" x2="14" y2="17"></line>
                                                            </svg>
                                                            刪除
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#999' }}>更新於：{article.updated_at}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                
                <button onClick={scrollRight} style={{ ...arrowBtnStyle, right: '5px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}> {'>'} </button>  
            </div>
        </div>
    );
}