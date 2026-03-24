import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { toast } from "react-toastify";
import { logout, verifyMail } from '../service/accountService';
import { getUnreads } from '../service/messageService';


const unstyledButtonStyle = {
	background: 'none', // 或 'none'，讓背景完全透明
	border: 'none',            // 移除預設的邊框
	cursor: 'pointer',         // 滑鼠移過去變成手指，讓使用者知道可以點擊
	padding: 0,                // 移除按鈕自帶的內距
	color: 'inherit',          // 讓文字顏色跟隨外層容器
	fontFamily: 'inherit',     // 讓字體跟隨外層容器
	fontSize: 'inherit'        // 讓字體大小跟隨外層容器
};
const styledDropdown ={
	position: 'absolute',
	top: '55px',
	right: '0', 
	backgroundColor: '#fff',
	border: '1px solid #eee',
	borderRadius: '8px', 
	boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
	width: '150px',
	zIndex: 1000,
	display: 'flex',
	flexDirection: 'column',
	overflow: 'hidden'
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

export default function Header() {

	const [isDropdownOpen,setDropdown] = useState(false);
	const dropDownRef = useRef(null);

	useEffect(()=>{
		const clickLocHandler = (e) =>{
			if (isDropdownOpen && dropDownRef.current && !dropDownRef.current.contains(e.target)){
				setDropdown(false);
			}
		};
		document.addEventListener('mousedown',clickLocHandler);
		return ()=>{document.removeEventListener('mousedown',clickLocHandler)}

	},[isDropdownOpen]);

	const navigate = useNavigate();
	const isLoggedIn = Boolean(localStorage.getItem('token'));
	const user = localStorage.getItem('currentUser_user_name');
	const avatar=localStorage.getItem('currentUser_avatar');
	const account=localStorage.getItem('currentUser_account');
	const is_verified=localStorage.getItem('currentUser_verfied')==='true';

	const [newMsgCount, setNewMsgCount] = useState(0);
	

	useEffect(()=>{
		if (!isLoggedIn){
			return
		};

		getUnreads()
		.then((response)=>{
			setNewMsgCount(response.data.unread_counts || 0);
		})
		.catch((err)=>{
			const invalid = ['No such user','login expired, please retry','invalid token or unauthorized'];
			const response_msg = err.response?.data?.msg;
			if (invalid.includes(response_msg)){
				toast.error('登入已失效，請重新登入');
				localStorage.removeItem('token');
				navigate('/login');
			}else{
				const errorDisplay = 'Oops, something went wrong';
				console.log(err.message)
				toast.error(errorDisplay);
			};  
		})
	},[])

	useEffect(()=>{
		if (!isLoggedIn){
			return
		};

		const socket = io(import.meta.env.VITE_API_BASE_URL,{
			transports: ['websocket', 'polling'],
			auth:{
				'Authorization':`Bearer ${localStorage.getItem('token')}`
			}
		});
		try{
			socket.on('connect', ()=>{
				console.log('websocket connected');
			});
			socket.on('new_message', (data)=>{
				toast.info(`來自 ${ data.account? data.account : '用戶' } 的信件 !`);
				setNewMsgCount(prevCount => prevCount + 1);
			})
		} catch(err){
			console.error(`發生錯誤：${err}`)
		};
		socket.on('connect-error',(err)=>{
			console.error(`連線錯誤：${err}`)
		});
		return ()=>{
			socket.disconnect()
		}
	},[])



	
	const handleVerify = () => {
		toast.info('處理中...')
		verifyMail()
		.then(()=>{
			toast.success('驗證信已寄出！請確認信箱');
			localStorage.setItem('currentUser_verified', 'true')
		})
		setDropdown(false);
	};

	const portfilioHandler = () =>{
		navigate(`/${account}`);
	};

	const logoutHandler = () => {
		logout()
		.then(()=>{
			toast.success('登出成功！');
			localStorage.removeItem('token');
			navigate('/');
		})
		.catch((err)=>{
            setError(err.message);
            console.log(err.message);
            const errorDisplay = 'Oops, something went wrong';
            toast.error(errorDisplay);
		})
		
	};

	const [searchParams] = useSearchParams();
	const [searchInput, setSearchInput] = useState(searchParams.get('query') || '');
	
	useEffect(()=>{
		setSearchInput(searchParams.get('query') || '');
	},[searchParams]);

	const searchHandler =(e)=>{
		if (e.key === 'Enter'){

			const currentTags = searchParams.get('tag');
			const queryString = new URLSearchParams();

			const trimmedInput =searchInput.trim();
			if (trimmedInput){
				queryString.append('query',trimmedInput);
			};
			if (currentTags){
				queryString.append('tag',currentTags);
			};
			navigate(`/search?${queryString.toString()}`);
		}
	}

	return (
	<header style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #ccc' }}>
		<Link to="/" style={{ fontWeight: 'bold', fontSize: '1.2rem', textDecoration: 'none',paddingTop:'10px', color:'#9932CC' }}>MYNOTEBOOK</Link>
		<div style={{flex:1, maxWidth:'400px',margin:'0 20px'}}>
                    <input
                    type="text"
					placeholder='搜尋文章標題>按enter送出...'
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={searchHandler}
                    style={{ width: '100%', padding: '10px 15px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc', outline:'none', fontSize:'1rem' }}
                    />
				</div>
		<nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
		{isLoggedIn ? (
			<>
				<div>
					您好 {user}!!
				</div>
				<Link to="/editor" className='custom-tooltip' data-tooltip='投稿'>
					<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="#9932CC" viewBox="0 0 16 16">
						<path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
						<path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
					</svg>
				</Link>
				<Link to="/mailbox" className='custom-tooltip' data-tooltip='信箱'>
					{ newMsgCount>0 ? (
					<div onClick={()=> setNewMsgCount(0)}>
						<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#9932CC" viewBox="0 0 16 16">
							<path d="M10.5 8.5V3.707l.854-.853A.5.5 0 0 0 11.5 2.5v-2A.5.5 0 0 0 11 0H9.5a.5.5 0 0 0-.5.5v8zM5 7c0 .334-.164.264-.415.157C4.42 7.087 4.218 7 4 7s-.42.086-.585.157C3.164 7.264 3 7.334 3 7a1 1 0 0 1 2 0"/>
							<path d="M4 3h4v1H6.646A4 4 0 0 1 8 7v6h7V7a3 3 0 0 0-3-3V3a4 4 0 0 1 4 4v6a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V7a4 4 0 0 1 4-4m0 1a3 3 0 0 0-3 3v6h6V7a3 3 0 0 0-3-3"/>
						</svg>
						<span style={{position: 'absolute',bottom: '-2px',  left: '-8px', backgroundColor: '#ff4d4f',color: 'white',fontSize: '10px', fontWeight: 'bold',padding: '2px 5px', borderRadius: '10px', border: '2px solid #fff',zIndex: 10,display: 'flex',alignItems: 'center',justifyContent: 'center',minWidth: '18px', boxSizing: 'border-box'}}>
							{newMsgCount > 99 ? '99+' : newMsgCount}
						</span>
					</div>
					) : (
					<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="#A9A9A9" viewBox="0 0 16 16">
						<path d="M4 4a3 3 0 0 0-3 3v6h6V7a3 3 0 0 0-3-3m0-1h8a4 4 0 0 1 4 4v6a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V7a4 4 0 0 1 4-4m2.646 1A4 4 0 0 1 8 7v6h7V7a3 3 0 0 0-3-3z"/>
						<path d="M11.793 8.5H9v-1h5a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.354-.146zM5 7c0 .552-.448 0-1 0s-1 .552-1 0a1 1 0 0 1 2 0"/>
					</svg>
					)}

				</Link>
				
				<div ref={dropDownRef} style={{position:'relative'}}>
					<button onClick={()=>setDropdown(!isDropdownOpen)} style={{...unstyledButtonStyle, display: 'flex', alignItems: 'center', gap: '8px'}} className='custom-tooltip' data-tooltip='我的'>
						<div style={{ ...imageContainerStyle, width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eee', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem' }} >
							{(avatar && avatar !== 'null' && avatar !== 'undefined') ? (
							<img src={avatar} style={imageStyle} onError={(e) => { e.target.style.display = 'none'; }}></img>
							):(
							<svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="#9932CC" viewBox="0 0 16 16">
								<path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
								<path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
							</svg>
							)
							}
						</div>
					</button>
					{isDropdownOpen && (
						<div style={styledDropdown}>
							{/* 🌟 新增：驗證狀態區塊 */}
							{is_verified ? (
								<div style={{ padding: '12px 16px', color: '#4CAF50', borderBottom: '1px solid #ECEFF1', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'default' }}>
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
										<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
									</svg>
									已驗證的用戶
								</div>
							) : (
								<button onClick={handleVerify} style={{...unstyledButtonStyle, color: '#FF9800', padding: '12px 16px', textAlign: 'left', width: '100%', borderBottom: '1px solid #ECEFF1', fontWeight: 'bold'}}>
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-exclamation-circle-fill" viewBox="0 0 16 16">
										<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4m.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/>
									</svg>
									驗證帳戶
								</button>
							)}
							<button onClick={portfilioHandler} style={{...unstyledButtonStyle,color:'#9932CC', padding: '12px 16px', textAlign: 'left', width: '100%'}}>
								個人作品頁
							</button>
							<Link to="/profile" onClick={() => setDropdown(false)} style={{ padding: '12px 16px', textDecoration: 'none', color: '#263238', borderBottom: '1px solid #ECEFF1' }}>
								個人頁設定
							</Link>
							<button onClick={logoutHandler} style={{...unstyledButtonStyle,color:'#9932CC', padding: '12px 16px', textAlign: 'left', width: '100%'}}>
								登出
							</button>
						</div>
					)}
				</div>

			</>
		) : (
			<>
				<Link to="/login" style={{textDecorationLine:'none', color:'#9932CC'}}>登入</Link>
				<Link to="/register" style={{textDecorationLine:'none', color:'#9932CC'}}>註冊</Link>
			</>
		)}
		</nav>
	</header>
);
}