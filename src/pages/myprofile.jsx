import { useState,useEffect, useRef } from "react";
import { Link, useNavigate} from 'react-router-dom';
import { toast } from 'react-toastify';
import { getUser, updateUser, deleteUser, changeAvatar, logout } from "../service/accountService";

const inputStyle = {
    width: '100%',
    padding: '10px',
    marginTop: '5px', 
    borderRadius: '4px',
    border: '1px solid #ccc',
    boxSizing: 'border-box'
};


function whatLink(link){
    const iconSize=20;
    const iconColor = '#4B0082'

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


export default function Profile(){
    const [userName,setUserName] = useState('');
    const [bio,setBio] = useState('');
    const [links,setLinks] = useState([]);
    const [avatar,setAvatar] = useState('');
    const [oldData,setOldData] = useState(null);

    const [isEditingPsw,setIsEdtPsw] = useState(false);
    const [passwords,setPasswords] = useState('');
    const [confirmPsw,setConfirmPsw] = useState('');
    const [showPsw,setShowPsw] = useState(false);
    const [showConfirmPsw,setShowCPSW] = useState(false);

    const [isDeleteModal,setIsDltMdl] = useState(false);
    const [deletePsw,setDeletePsw] = useState(false);
    const [dltConfirmPsw, setDltConfirmPsw] = useState('');
    
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();
    const fileInputRef = useRef(null);
   	const user = localStorage.getItem('currentUser_account');
    const userAvatar=localStorage.getItem('currentUser_avatar');
    
    useEffect(()=>{
        if (!user){
            toast.error('請先登入再行操作');
            navigate('/login');
            return
        };
        getUser(user)
        .then(response => {
            const fetchData={
                userName: response.data.user.user_name || '',
                bio: response.data.user.bio || '',
                links: response.data.user.links || []
            }
            setAvatar(response.data.user.avatar || '');
            setBio(fetchData.bio);
            setUserName(fetchData.userName);
            setLinks(fetchData.links);
            setOldData(fetchData);
        })
        .catch(err =>{
            const invalid = ['no such user'];
            const response_msg = err.response?.data?.msg;
            if (invalid.includes(response_msg)){
                toast.error('用戶不存在');
            }else{
                console.log(err.message)
                const errorDisplay = 'Oops, something went wrong';
                toast.error(errorDisplay);
            };  
        })
        .finally(()=>{
            setIsLoading(false);
        })
    },[user, navigate]);
    
    const LinkChangeHandler =(ind,val)=>{
        if (ind >=8 || ind<0){
            return
        };
        const newLinks = [...links];
        newLinks[ind] = val;
        setLinks(newLinks.slice(0,8));
    };

    const addLink = ()=>{
        if (links.length <8){
            setLinks([...links,'']);
        }else{
            toast.warning('最多展示8組連結！')
            return
        };
    };

    const removeLink = (indexToRemove) =>{
        setLinks(links.filter((_, index) => index !== indexToRemove));
    };
    
    const avatarChangeHandler = (e) =>{
        const file = e.target.files[0];
        if (!file){
            return
        };
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const maxSize = 2*1024*1024;
        if (!allowedTypes.includes(file.type)) {
            toast.error('僅支援 JPG, PNG 或 WEBP');
            e.target.value = '';
            return
        };
        if (file.size > maxSize){
            toast.error('尺寸必須小於2MB');
            e.target.value = '';
            return
        };
        changeAvatar(file)
        .then(()=>{
            toast.success('圖片上傳成功！');
            const previewUrl = URL.createObjectURL(file);
            setAvatar(previewUrl);
        })
        .catch((err)=>{
            const errorDict ={
                'file size limit exceeded':'尺寸必須小於2MB',
                'file format not allowed':'僅支援 JPG, PNG 或 WEBP',
            };
            const invalid = ['No such user','login expired, please retry','invalid token or unauthorized'];
            const response_msg = err.response?.data?.msg;
            if (invalid.includes(response_msg)){
                toast.error('登入已失效，請重新登入');
                localStorage.removeItem('token');
                navigate('/login');
            }else{
                const errorDisplay = errorDict[response_msg] || err.response.data.msg ||'Oops, something went wrong';
                console.log(err.message)
                toast.error(errorDisplay);
            };         
        })
        .finally(()=>{
            e.target.value = '';
        });
    };

    const triggerFileSelect = ()=>{
        fileInputRef.current.click();
    };

    const updateHandler = () =>{
        const newData={};
        if (userName !== oldData.userName){
            newData.user_name=userName;
        };
        if (bio !== oldData.bio){
            newData.bio=bio;
        };
        if (JSON.stringify(links)!==JSON.stringify(oldData.links)){
            newData.links=links;
        };
        if (isEditingPsw){
            if (!passwords || !confirmPsw){
                toast.error('缺少必填項目');
                return
            }else if (passwords!==confirmPsw){
                toast.error('密碼確認失敗');
                return
            }else if (passwords.length <8){
                toast.error('密碼強度不足/少於8字元');
                return
            }else if (/[^a-zA-Z0-9+_*@#$%^&!?-]/.test(passwords)){
                toast.error('密碼含有不被接受的字元');
                return
            }else if (!(/[a-z]/.test(passwords) && /[A-Z]/.test(passwords) && /[0-9]/.test(passwords) && /[+_*@#$%^&!?-]/.test(passwords))){
                toast.error('密碼至少要含有一個大小寫字母、數字與特殊字元');
                return
            };
            newData.passwords=passwords;
        };
        if (Object.keys(newData).length === 0){
            toast.info('沒有任何修改項...');
            return
        };
        updateUser(newData)
        .then(()=>{
            toast.success('修改成功');
            setOldData({
                userName: userName,
                bio: bio,
                links: links
            });
            if (isEditingPsw){
                setPasswords('');
                setConfirmPsw('');
                setIsEdtPsw(false);
            };
        })
        .catch((err)=>{
            const errorDict ={
                'invalid action':'無效操作',
                'cannot allow more than 8-links':'最多展示8組連結！',
                'new password cannot be the same as previous one':'新舊密碼不得相同',
            };
            const invalid = ['No such user','login expired, please retry','invalid token or unauthorized'];
            const response_msg = err.response?.data?.msg;
            if (invalid.includes(response_msg)){
                toast.error('登入已失效，請重新登入');
                localStorage.removeItem('token');
                navigate('/login');
            }else{
                const errorDisplay = errorDict[response_msg] ||'Oops, something went wrong';
                console.log(err.message)
                toast.error(errorDisplay);
            };
        })

    };

    const closeDeleteModal = () =>{
        setIsDltMdl(false);
        setDeletePsw('');
        setDltConfirmPsw('');
    };

    const deleteHandler = () =>{
        if (!deletePsw || !dltConfirmPsw || (deletePsw!==dltConfirmPsw)){
            toast.error('請輸入正確密碼');
            return
        };
        deleteUser(deletePsw)
        .then(()=>{
            toast.success('帳號已停用，感謝您的使用');
            logout()
            .catch((err)=>{
                const errorDisplay = err.response?.data?.msg? err.response.data.msg : 'Oops, something went wrong';
                toast.error(errorDisplay);
            })
            .finally(()=>{
                localStorage.removeItem('token');
                localStorage.removeItem('currentUser_email');
                localStorage.removeItem('currentUser_account');
                localStorage.removeItem('currentUser_user_name');
                localStorage.removeItem('currentUser_verfied');
                localStorage.removeItem('currentUser_avatar');
                closeDeleteModal();
                navigate('/');
            })
        })

    };

    if (isLoading) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>思考中...</div>;
    };

    if (!oldData){
        return (
            <div style={{ maxWidth: '600px', margin: '40px auto', padding: '30px', textAlign: 'center', border: '1px solid #ddd', borderRadius: '8px' }}>
                <h2 style={{ color: '#dc3545' }}>404-error <br />Oops That's an error </h2>
                <p style={{ color: '#777' }}>找不到這個用戶</p>
            </div>
        );
    };

    return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>編輯個人檔案</h2>
        
        {/* 頭像區 */}
        <div style={{ textAlign: 'center', marginBottom: '30px', position: 'relative' }}>
            <input type="file" ref={fileInputRef} onChange={avatarChangeHandler} accept="image/jpeg, image/png, image/webp" style={{ display: 'none' }} />
            <div style={{ position: 'relative', display: 'inline-block' }}>
                {(userAvatar && userAvatar !== 'null' && userAvatar !== 'undefined') ? (
                    <img 
                        src={avatar} 
                        alt="使用者頭像" 
                        style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #eee',cursor: 'pointer'}}
                        onClick={triggerFileSelect} // 點擊圖片觸發上傳
                        title="點擊更換頭像"
                    />
                    ):(
                    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" fill="#9932CC" viewBox="0 0 16 16">
                        <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                        <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
                    </svg>
                    )
                }
                <div 
                    onClick={triggerFileSelect}
                    style={{
                        position: 'absolute',
                        bottom: '0',
                        right: '5px',
                        color: 'white',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        backgroundColor:'#ECEFF1'
                    }}
                    title="點擊更換頭像"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="#9932CC" viewBox="0 0 16 16">
                        <path d="M10.5 8.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
                        <path d="M2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4zm.5 2a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1m9 2.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0"/>
                    </svg>
                </div>
            </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 名稱與簡介 */}
            <div>
                <label style={{ fontWeight: 'bold' }}>名稱</label>
                <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} style={inputStyle} />
            </div>
            <div>
                <label style={{ fontWeight: 'bold' }}>個人簡介</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows="4" style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            {/* 密碼變更區塊 */}
            <div style={{ marginTop: '10px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                <button type="button" onClick={() => setIsEdtPsw(!isEditingPsw)}style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontWeight: 'bold', padding: 0 }}>
                    {isEditingPsw ? '取消更改密碼' : '更改密碼'}
                </button>

                {/* 只有在 isEditingPassword 為 true 時才畫出輸入框 */}
                {isEditingPsw && (
                    <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{position:'relative'}}>
                            <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>新密碼</label>
                            <input 
                                type={showPsw ? "text" : "password"}
                                value={passwords} 
                                onChange={(e) => setPasswords(e.target.value)}
                                style={inputStyle}
                                placeholder="請輸入新密碼"
                                autoComplete="new-password"
                            />
                            <div onClick={() => {setShowPsw(!showPsw)}} style={{position:'absolute', right:'10px', top:'50%', transform:'translateY(20%)', cursor:'pointer', display:'flex',alignItems:'center'}}>
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
                        <div style={{position:'relative'}}>
                            <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>確認新密碼</label>
                            <input 
                                type={setShowCPSW ? "text" : "password"} 
                                value={confirmPsw} 
                                onChange={(e) => setConfirmPsw(e.target.value)}
                                style={inputStyle}
                                placeholder="請再次輸入新密碼"
                                autoComplete="new-password"
                            />
                            <div onClick={() => {setShowCPSW(!showConfirmPsw)}} style={{position:'absolute', right:'10px', top:'50%', transform:'translateY(20%)', cursor:'pointer', display:'flex',alignItems:'center'}}>
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
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/*  4. 動態渲染社群連結陣列 */}
            <div>
                <label style={{ fontWeight: 'bold' }}>社群連結</label>
                
                {links.map((link, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                        {/* 顯示對應的 Icon */}
                        <div style={{ color: '#555', display: 'flex', alignItems: 'center' }}>
                            {whatLink(link)}
                        </div>
                        
                        {/* 輸入框 */}
                        <input 
                            type="url" 
                            value={link} 
                            onChange={(e) => LinkChangeHandler(index, e.target.value)}
                            style={{ ...inputStyle, marginTop: 0, flex: 1 }}
                            placeholder="https://..."
                        />
                        
                        {/* 刪除按鈕 */}
                        <button 
                            type="button" 
                            onClick={() => removeLink(index)}
                            style={{ padding: '8px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            刪除
                        </button>
                    </div>
                ))}
                
                {/* 新增連結按鈕 */}
                <button 
                    type="button" 
                    onClick={addLink}
                    style={{ marginTop: '15px', padding: '8px 15px', backgroundColor: '#f8f9fa', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: 'bold' }}
                >
                    + 新增一組連結
                </button>
            </div>
        </div>
        
        {/* 儲存按鈕 */}
        <button type="button" onClick={updateHandler}style={{ width: '100%', padding: '12px', backgroundColor: '#9932CC', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold', marginTop: '30px' }}>
            儲存
        </button>
        {/* 停用帳號按鈕 (與儲存同高，使用紅色警告色) */}
        <button type="button" onClick={() => setIsDltMdl(true)} style={{ width: '100%', padding: '12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold', marginTop: '15px' }}>
            停用並刪除帳號
        </button>

        {/* 彈出式視窗 (Modal) */}
        {isDeleteModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', width: '320px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
                    <h3 style={{ marginTop: 0, textAlign: 'center', color: '#dc3545' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
                        </svg>
                        <span style={{marginLeft:'10px'}}>刪除帳號確認</span>
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '20px', lineHeight: '1.5' }}>
                        這是一項無法復原的操作！您的所有資料（包含文章、社群連結）將被移除。請輸入您的密碼以繼續。
                    </p>
                    
                    <input 
                        type="password" 
                        placeholder="請輸入密碼" 
                        value={deletePsw} 
                        onChange={e => setDeletePsw(e.target.value)} 
                        style={{ ...inputStyle, marginBottom: '10px', marginTop: '0' }} 
                    />
                    <input 
                        type="password" 
                        placeholder="請再次輸入密碼確認" 
                        value={dltConfirmPsw} 
                        onChange={e => setDltConfirmPsw(e.target.value)} 
                        style={{ ...inputStyle, marginBottom: '20px', marginTop: '0' }} 
                    />
                    
                    {/* 視窗底部的按鈕群 */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={closeDeleteModal} style={{ flex: 1, padding: '10px', border: '1px solid #ccc', background: '#f8f9fa', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                            取消
                        </button>
                        <button onClick={deleteHandler} style={{ flex: 1, padding: '10px', border: 'none', background: '#dc3545', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                            確認刪除
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
    )

}