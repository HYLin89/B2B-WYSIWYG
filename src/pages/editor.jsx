import { useState, useEffect, useRef } from 'react';
import { useBlocker, useNavigate, useLocation } from 'react-router-dom';
import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import { Markdown } from 'tiptap-markdown';
import { toast } from 'react-toastify';
import { newArticle, coverImg, contentImgs ,updateArticle, deleteArticle  } from '../service/articleService';
import './editor.css'

const default_cover = import.meta.env.VITE_DEFAULT_COVER_URL || 'https://svxrqtsfyjzeeyrjrezu.supabase.co/storage/v1/object/public/imgs/default_cover.jpg';

const EditorPage = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const {articleData, articleId, articleStatus, articleTags} = location.state || {};

    const [hasUnsavedChanges, setHasUChgs] = useState(false);

    const [tags, setTags] = useState(articleTags || []);
    const [title,setTitle] = useState(articleData?.title || '');
    const [status,setStatus] = useState(articleStatus || 'draft');
    const [markdownContent,setMDContent] = useState(articleData?.content || '');
    const [coverImgUrl,setCoverIMGUrl] = useState(articleData?.cover_img || '');
    const [linkUrl,setLinkUrl] = useState('');
    const [linkTxt,setLinkTxt] = useState('');

    const [isToolbarOpen, setIsToolbarOpen] = useState(false);
    const [isHintOpen, setIsHintOpen] = useState(false); 
    const [isImageModalOpen,setIsImgMdlOp] = useState(false);
    const [isLinkModalOpen,setIsLinkMdlOp] = useState(false);
    
    const hasToasted = useRef(null);
    const coverInputRef = useRef(null);
    const hintScrollRef = useRef(null);

    const CustomShortCuts = Extension.create({
        name:'customShortCuts',
        addKeyboardShortcuts() {
            return {
                // 換行 (Shift+Enter Ctrl+Enter)
                'Mod-Enter': () => this.editor.commands.setHardBreak(),
                
                // 引用 ( Ctrl+Alt+Q)
                'Mod-Alt-q': () => this.editor.commands.toggleBlockquote(),
                
                // 程式碼 (Ctrl+Alt+P) 
                'Mod-Alt-p': () => this.editor.commands.toggleCodeBlock(),
                
                // 內文 (Ctrl+Alt+5)
                'Mod-Alt-1': () => this.editor.commands.setParagraph(),
                
                // 小標題 /H3 (Ctrl+Alt+3)
                'Mod-Alt-4': () => this.editor.commands.toggleHeading({ level: 3 }),
                
                // 大標題 /H2 (Ctrl+Alt+2)
                'Mod-Alt-7': () => this.editor.commands.toggleHeading({ level: 2 }),
                
                // 刪除線 (Ctrl+Alt+X)
                'Mod-Alt-x': () => this.editor.commands.toggleStrike(),
                
                // 底線 (Ctrl+Alt+U)
                'Mod-Alt-u': () => this.editor.commands.toggleUnderline(),
                
                // 粗體 (Ctrl+Alt+B)
                'Mod-Alt-b': () => this.editor.commands.toggleBold(),
                
                // 無序清單 (Ctrl+D)
                'Mod-d': () => this.editor.commands.toggleBulletList(),
                
                // 有序清單 (Ctrl+O)
                'Mod-o': () => this.editor.commands.toggleOrderedList(),
                
                // 圖片上傳彈窗 (Alt+I)
                'Alt-i': () => {
                    setIsImgMdlOp(true);
                    return true;
                },
                
                // 連結設定彈窗 (Alt+L)
                'Alt-l': () => {
                    const {state} = this.editor;
                    const {from, to} = state.selection;
                    const selectedText = state.doc.textBetween(from,to,'');
                    const exsitingUrl = this.editor.getAttributes('link').href || '';

                    setLinkTxt(selectedText);
                    setLinkUrl(exsitingUrl);
                    setIsLinkMdlOp(true);
                    return true
                },
            };
        },
    });

    const blocker = useBlocker(({ currentLocation, nextLocation }) =>
        hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname
    );
    const editor = useEditor({
        extensions:[
            StarterKit,
            Image,
            Markdown,
            Underline,
            CustomShortCuts
        ],
        content:articleData?.content || '',
        onUpdate:({editor})=>{
            setHasUChgs(true);
            const md = editor.storage.markdown.getMarkdown();
            setMDContent(md);
        },
    });

    useEffect(()=>{
        if (!hasToasted.current){
            toast.info('按下alt+2查看提示...');
            hasToasted.current = true;
        };
    },[])

    const TagInputHandler = (e)=>{
        if (e.key === 'Enter'){
            e.preventDefault();

            const newTag = e.target.value.trim();
            if (!newTag){
                return
            };
            if (tags.length >= 8){
                toast.warning('最多8個標籤！');
                return
            };
            if (tags.includes(newTag)){
                toast.warning('此標籤已經存在');
                return
            };
            setTags([...tags,newTag]);
            setHasUChgs(true);
            e.target.value = '';
        }else if (e.key === 'Backspace'&& e.target.value === '' && tags.length > 0){
            e.preventDefault();
            const newTag = [...tags];
            newTag.pop();
            setTags(newTag);
            setHasUChgs(true);
        }
    };
    const TagRemover =(ind2rm) =>{
        setTags(tags.filter((_,index) => index !== ind2rm));
        setHasUChgs(true)
    };

    const coverUploader = (e) => {
        const file = e.target.files[0];
        if (!file){
            return
        };
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const maxSize = 5*1024*1024;
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
        const old_Data = (coverImgUrl && coverImgUrl !== default_cover) ? coverImgUrl : null;
        
        coverImg(file,old_Data)
        .then((response)=>{
            toast.success('圖片上傳成功！');
            setCoverIMGUrl(response.data.data);
            setHasUChgs(true);
        })
        .catch((err)=>{
            const errorDict ={
                'forbidden actions':'圖片上傳失敗',
                'file size limit exceeded':'尺寸必須小於2MB',
                'file format not allowed':'僅支援 JPG, PNG 或 WEBP',
            };
            const invalid = ['login expired, please retry','invalid token or unauthorized'];
            const response_msg = err.response?.data?.msg;
            if (invalid.includes(response_msg)){
                if (response_msg === invalid[0]){
                    toast.warning('登入已失效，正在備份...');
                    saveArticle();
                    const currentMd = editor? editor.storage.markdown.getMarkdown(): markdownContent;
                    const backupData = { title, content: currentMd, tags, coverImg };
                    localStorage.setItem('editor_backup',JSON.stringify(backupData));
                };
                toast.error('登入已失效，請重新登入');
                localStorage.removeItem('token');
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
                return
            }else{
                const errorDisplay = errorDict[response_msg] || err.response.data.msg ||'Oops, something went wrong';
                console.log(err.message)
                toast.error(errorDisplay);
            };         
        })
        .finally(()=>{
            e.target.value = '';
        })
    };

    const contentImageUploader = (e) =>{
        const file = e.target.files[0];
        if (!file){
            return
        };
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp','image/gif'];
        const maxSize = 5*1024*1024;
        const maxsizeforgif = 10*1024*1024;
        if (!allowedTypes.includes(file.type)) {
            toast.error('僅支援 JPG, PNG, GIF 或 WEBP');
            e.target.value = '';
            return
        };
        if ((file.type !== 'image/gif' && file.size > maxSize) || (file.type === 'image/gif' && file.size > maxsizeforgif)){
            toast.error('尺寸必須小於5MB');
            e.target.value = '';
            return
        };

        contentImgs(file)
        .then (response =>{
            const imgUrl = response.data.data;
            editor.chain().focus().setImage({ src: imgUrl}).run();
            setHasUChgs(true);
            setIsImgMdlOp(false);
        })
        .catch(err=>{
            const errorDict ={
                'file size limit exceeded':'尺寸必須小於2MB',
                'file format not allowed':'僅支援 JPG, PNG 或 WEBP',
            };
            const invalid = ['login expired, please retry','invalid token or unauthorized'];
            const response_msg = err.response?.data?.msg;
            if (invalid.includes(response_msg)){
                if (response_msg === invalid[0]){
                    toast.warning('登入已失效，正在備份...');
                    saveArticle();
                    const currentMd = editor? editor.storage.markdown.getMarkdown(): markdownContent;
                    const backupData = { title, content: currentMd, tags, coverImg };
                    localStorage.setItem('editor_backup',JSON.stringify(backupData));
                };
                toast.error('登入已失效，請重新登入');
                localStorage.removeItem('token');
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
                return
            }else{
                const errorDisplay = errorDict[response_msg] ||'Oops, something went wrong';
                console.log(err.message)
                toast.error(errorDisplay);
            };   
        })
        .finally(()=>{
            e.target.value = '';
        })
    };

    const handleLinkSubmit = () =>{
        if (!linkUrl.trim()) {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            setIsLinkMdlOp(false);
            setHasUChgs(true);
            return;
        }
        let finalUrl = linkUrl.trim();
        if (!/^https?:\/\//i.test(finalUrl)) {
            finalUrl = 'https://' + finalUrl;
        };
        const displayTxt = linkTxt.trim() === ''? finalUrl : linkTxt;
        editor.chain().focus().extendMarkRange('link').insertContent(`<a href="${finalUrl}">${displayTxt}</a>`).run();

        setHasUChgs(true);
        setIsLinkMdlOp(false);
        setLinkUrl('');
        setLinkTxt('')
    };

    const openLinkModalHandler = () =>{
        if (!editor) {
            return
        };
        const { state } = editor;
        const { from, to } = state.selection;
        const selectedText = state.doc.textBetween(from, to, '');
        const existingUrl = editor.getAttributes('link').href || '';

        setLinkTxt(selectedText);
        setLinkUrl(existingUrl);
        setIsLinkMdlOp(true);
    };

    const hintCards = [
        {
            id: 1, 
            title: '關於編輯器', 
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#FFD700" viewBox="0 0 16 16">
                    <path d="M2 6a6 6 0 1 1 10.174 4.31c-.203.196-.359.4-.453.619l-.762 1.769A.5.5 0 0 1 10.5 13h-5a.5.5 0 0 1-.46-.302l-.761-1.77a2 2 0 0 0-.453-.618A5.98 5.98 0 0 1 2 6m3 8.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1l-.224.447a1 1 0 0 1-.894.553H6.618a1 1 0 0 1-.894-.553L5.5 15a.5.5 0 0 1-.5-.5"/>
                </svg>
            ), 
            content: (
                <div style={{ fontSize: '13px', lineHeight: '1.8', color: '#666' }}>
                    <div>✔️ 簡單編輯，完整支援 md 語法 </div>
                    <div>✔️ <b>Alt + 8</b> 可使用預設編輯器 </div>
                    <div>✔️ <b>Alt + 2</b> 關閉此提示 </div>
                    <div> 右上角區域可更改狀態！ </div>
                </div>
            )
        },
        {
            id: 2, 
            title: '快捷鍵總覽', 
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#9932CC" viewBox="0 0 16 16">
                    <path d="M0 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm13 .25v.5c0 .138.112.25.25.25h.5a.25.25 0 0 0 .25-.25v-.5a.25.25 0 0 0-.25-.25h-.5a.25.25 0 0 0-.25.25M2.25 8a.25.25 0 0 0-.25.25v.5c0 .138.112.25.25.25h.5A.25.25 0 0 0 3 8.75v-.5A.25.25 0 0 0 2.75 8zM4 8.25v.5c0 .138.112.25.25.25h.5A.25.25 0 0 0 5 8.75v-.5A.25.25 0 0 0 4.75 8h-.5a.25.25 0 0 0-.25.25M6.25 8a.25.25 0 0 0-.25.25v.5c0 .138.112.25.25.25h.5A.25.25 0 0 0 7 8.75v-.5A.25.25 0 0 0 6.75 8zM8 8.25v.5c0 .138.112.25.25.25h.5A.25.25 0 0 0 9 8.75v-.5A.25.25 0 0 0 8.75 8h-.5a.25.25 0 0 0-.25.25M13.25 8a.25.25 0 0 0-.25.25v.5c0 .138.112.25.25.25h.5a.25.25 0 0 0 .25-.25v-.5a.25.25 0 0 0-.25-.25zm0 2a.25.25 0 0 0-.25.25v.5c0 .138.112.25.25.25h.5a.25.25 0 0 0 .25-.25v-.5a.25.25 0 0 0-.25-.25zm-3-2a.25.25 0 0 0-.25.25v.5c0 .138.112.25.25.25h1.5a.25.25 0 0 0 .25-.25v-.5a.25.25 0 0 0-.25-.25zm.75 2.25v.5c0 .138.112.25.25.25h.5a.25.25 0 0 0 .25-.25v-.5a.25.25 0 0 0-.25-.25h-.5a.25.25 0 0 0-.25.25M11.25 6a.25.25 0 0 0-.25.25v.5c0 .138.112.25.25.25h.5a.25.25 0 0 0 .25-.25v-.5a.25.25 0 0 0-.25-.25zM9 6.25v.5c0 .138.112.25.25.25h.5a.25.25 0 0 0 .25-.25v-.5A.25.25 0 0 0 9.75 6h-.5a.25.25 0 0 0-.25.25M7.25 6a.25.25 0 0 0-.25.25v.5c0 .138.112.25.25.25h.5A.25.25 0 0 0 8 6.75v-.5A.25.25 0 0 0 7.75 6zM5 6.25v.5c0 .138.112.25.25.25h.5A.25.25 0 0 0 6 6.75v-.5A.25.25 0 0 0 5.75 6h-.5a.25.25 0 0 0-.25.25M2.25 6a.25.25 0 0 0-.25.25v.5c0 .138.112.25.25.25h1.5A.25.25 0 0 0 4 6.75v-.5A.25.25 0 0 0 3.75 6zM2 10.25v.5c0 .138.112.25.25.25h.5a.25.25 0 0 0 .25-.25v-.5a.25.25 0 0 0-.25-.25h-.5a.25.25 0 0 0-.25.25M4.25 10a.25.25 0 0 0-.25.25v.5c0 .138.112.25.25.25h5.5a.25.25 0 0 0 .25-.25v-.5a.25.25 0 0 0-.25-.25z"/>
                </svg>
            ), 
            // 利用 CSS Grid 將快捷鍵分為雙排顯示，節省空間
            content: (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 10px', fontSize: '12px', color: '#555' }}>
                    <span><b>換行</b>: Shift+Enter / Ctrl+Enter </span>
                    <span><b>內文</b>: Shift+Alt+1 </span>
                    <span><b>小標</b>: Shift+Alt+4 </span>
                    <span><b>大標</b>: Shift+Alt+7 </span>
                    <span><b>刪除線</b>: Ctrl+Alt+X </span>
                    <span><b>底線</b>: Ctrl+Alt+U </span>
                    <span><b>粗體</b>: Ctrl+Alt+B </span>
                    <span><b>點清單</b>: Ctrl+D</span>
                    <span><b>數清單</b>: Ctrl+O</span>
                    <span><b>插圖片</b>: Alt+I </span>
                    <span><b>插連結</b>: Alt+L</span>
                </div>
            )
        },
        {
            id: 3, 
            title: '程式碼區塊 (Ctrl+Alt+P)', 
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#9932CC" viewBox="0 0 16 16">
                    <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                    <path d="M6.854 4.646a.5.5 0 0 1 0 .708L4.207 8l2.647 2.646a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 0 1 .708 0m2.292 0a.5.5 0 0 0 0 .708L11.793 8l-2.647 2.646a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708 0"/>
                </svg>
            ), 
            content: (
                <div style={{ fontSize: '12px', color: '#666', width: '100%' }}>
                    <div style={{ marginBottom: '6px' }}>範例呈現： </div>
                    {/* 模擬程式碼區塊黑底白字的樣式 */}
                    <div style={{ background: '#282c34', color: '#abb2bf', padding: '8px 12px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.4' }}>
                        <span style={{color: '#7f848e'}}>//python </span><br/>
                        <span style={{color: '#56b6c2'}}>print</span>(<span style={{color: '#98c379'}}>'hello world'</span>) 
                    </div>
                </div>
            )
        },
        {
            id: 4, 
            title: '引用區塊 (Ctrl+Alt+Q)', 
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#9932CC"  viewBox="0 0 16 16">
                    <path d="M12 12a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1h-1.388q0-.527.062-1.054.093-.558.31-.992t.559-.683q.34-.279.868-.279V3q-.868 0-1.52.372a3.3 3.3 0 0 0-1.085.992 4.9 4.9 0 0 0-.62 1.458A7.7 7.7 0 0 0 9 7.558V11a1 1 0 0 0 1 1zm-6 0a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1H4.612q0-.527.062-1.054.094-.558.31-.992.217-.434.559-.683.34-.279.868-.279V3q-.868 0-1.52.372a3.3 3.3 0 0 0-1.085.992 4.9 4.9 0 0 0-.62 1.458A7.7 7.7 0 0 0 3 7.558V11a1 1 0 0 0 1 1z"/>
                </svg>
            ), 
            content: (
                <div style={{ fontSize: '12px', color: '#666', width: '100%' }}>
                    <div style={{ marginBottom: '6px' }}>範例呈現：</div>
                    {/* 模擬引用區塊的樣式 */}
                    <div style={{ borderLeft: '4px solid #9932CC', background: '#f8f9fa', padding: '8px 12px', color: '#555', fontStyle: 'italic', borderRadius: '0 6px 6px 0' }}>
                        我思故我在 
                    </div>
                </div>
            )
        }
    ];

    // 將滑動距離從 280 調整為 380 確保一次剛好滑過一張卡片
    const scrollHintLeft = () => {
        if (hintScrollRef.current) {
            hintScrollRef.current.scrollBy({ left: -520, behavior: 'smooth' });
        }
    };

    const scrollHintRight = () => {
        if (hintScrollRef.current) {
            hintScrollRef.current.scrollBy({ left: 520, behavior: 'smooth' });
        }
    };

    const deleteArticleHandler = () =>{
        const confirmDelete = window.confirm('是否刪除? 此動作無法復原');
        if (!confirmDelete){
            return
        };
        deleteArticle(articleId)
        .then(()=>{
            toast.success('已刪除文章');
            setHasUChgs(false);
            const user = localStorage.getItem('currentUser_account');
            if (user){
                navigate(`/${user}`, { replace: true });
            }else{
                navigate(`/`, { replace: true });
            }
        })
        .catch((err)=>{
            const errorDict ={
                'article id is required':'無效操作',
                'article not exists':'文章已遺失'
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
    } 

    const saveArticle = () => {
        const currentMd = editor ? editor.storage.markdown.getMarkdown() : markdownContent;

        const finalCoverImg = coverImgUrl || default_cover;

        if (!title || !finalCoverImg || !currentMd){
            toast.error('缺少必填欄位(標題/內容/封面)');
            return;
        };
        if (!Array.isArray(tags)){
            toast.error('無效行為');
            return;
        };
        let data = {};
        if (articleId) {
            //[PATCH] update article 
            if (title !== articleData.title){
                data.title = title;
            };
            if (finalCoverImg !== articleData.cover_img){
                data.cover_img = finalCoverImg;
            };
            if (currentMd !== articleData.content){
                data.content = currentMd;
            };
            if (status !== articleData.status){
                data.status = status;
            };
            if (JSON.stringify(tags) !== JSON.stringify(articleData.tags || [])){
                data.tags = tags;
            };
            if (Object.keys(data).length === 0) {
                toast.info('文章無任何變更...');
                setHasUChgs(false);
                return
            };
        }else{
            //[POST] create article
            data = {
                title: title,
                coverImg: finalCoverImg,
                content: currentMd,
                status: status,
                tags: tags
            };
        };

        const articleShould = articleId ? updateArticle(articleId,data) : newArticle(data);
        articleShould
        .then(() => {
            toast.success('儲存成功！');
            setHasUChgs(false); // 儲存成功才解除未儲存狀態
        })
        .catch(err => {
            const errorDict ={
                'no data provided':'錯誤操作',
                'invalid actions':'無效操作',
                'article id is required':'無效操作',
                'article not exists':'文章已遺失'
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
        });
    };
    
    useEffect(() => {
        const handleSave = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                e.preventDefault(); 
                saveArticle(); 
            };
        };
        window.addEventListener('keydown', handleSave);
        return () => window.removeEventListener('keydown', handleSave);
    }, [title, coverImgUrl, markdownContent, status, tags, editor]); 

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = ''; 
            };
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]); 

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.altKey && e.key === '8') {
                e.preventDefault(); 
                setIsToolbarOpen((prev) => !prev);
            };
            if (e.altKey && e.key === '2') {
                e.preventDefault();
                setIsHintOpen((prev) => !prev);
            };
        };

        window.addEventListener('keydown', handleKeyDown);
        
        return () => {
        window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    if (!editor){
        return null
    };

    
        
    return (
    <div className="editor-container">
        {blocker.state === "blocked" && (
        <div className="leave-confirm-modal">
            <div className="modal-content">
                <h3>⚠️ 尚未儲存變更</h3>
                <p>您有尚未儲存的編輯內容，確定要離開此頁面嗎？</p>
                <div className="modal-actions">
                    {/* blocker.reset()：取消跳轉，留在編輯器 */}
                    <button className="btn-cancel" onClick={() => blocker.reset()}>
                        繼續編輯
                    </button>
                    {/* blocker.proceed()：放棄儲存，允許跳轉到 Header 點擊的目的地 */}
                    <button className="btn-danger" onClick={() => blocker.proceed()}>
                        捨棄並離開
                    </button>
                </div>
            </div>
        </div>
        )}
        {/* 右上角固定面板 (狀態與標籤)
            設定為 fixed 定位，當工具列滑入時，zIndex 將決定其是否被遮蔽 */}
        <aside className="fixed-top-right-panel">
            <div className="status-area">
            <select className="borderless-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="draft">草稿</option>
                <option value="public">發布</option>
                <option value="private">付費內容</option>
            </select>
            </div>
            <div className="tag-area">
            {tags.map((tag, index) => (
                <div key={index} className="tag-item" onClick={()=>TagRemover(index)} title='點擊刪除'>
                    <span>#{tag}</span><>  </>
                    <span style={{color: '#DC143C', marginLeft:'5px', fontSize:'22px',cursor: 'pointer'}}>
                        &times;
                    </span>
                </div> 
            ))}
            {tags.length < 8 && (
                <input type="text" className="borderless-input tag-input" placeholder={tags.length === 0 ? "輸入標籤 (Enter)" : "+ 新增標籤"} onKeyDown={TagInputHandler} />
            )}
            </div>
        </aside>


        {/* A. 編輯工具區 (由上往下滑入) */}
        <div className={`toolbar-overlay ${isToolbarOpen ? 'open' : ''}`}>
            <div className="toolbar-content" style={{ gap: '8px', overflowX: 'auto', width: '100%', height:'50px', margin:'0 15vw'}}>
                
                {/* 1. 歷史紀錄 */}
                <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="clean-btn" title="復原 (Ctrl+Z)" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2z"/>
                        <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466"/>
                    </svg>
                </button>
                <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="clean-btn" title="重做 (Ctrl+Shift+Z)" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/>
                        <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466"/>
                    </svg>
                </button>
                
                <div className="toolbar-divider"></div>

                {/* 2. 標題與內文 */}
                <button onClick={() => editor.chain().focus().setParagraph().run()} className={`clean-btn ${editor.isActive('paragraph') ? 'is-active' : ''}`} title="內文 (Ctrl+Alt+5)" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"  viewBox="0 0 16 16">
                        <path d="M10.5 15a.5.5 0 0 1-.5-.5V2H9v12.5a.5.5 0 0 1-1 0V9H7a4 4 0 1 1 0-8h5.5a.5.5 0 0 1 0 1H11v12.5a.5.5 0 0 1-.5.5"/>
                    </svg>
                </button>
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`clean-btn ${editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}`} title="小標題 (Ctrl+Alt+3)" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M11.07 8.4h1.049c1.174 0 1.99.69 2.004 1.724s-.802 1.786-2.068 1.779c-1.11-.007-1.905-.605-1.99-1.357h-1.21C8.926 11.91 10.116 13 12.028 13c1.99 0 3.439-1.188 3.404-2.87-.028-1.553-1.287-2.221-2.096-2.313v-.07c.724-.127 1.814-.935 1.772-2.293-.035-1.392-1.21-2.468-3.038-2.454-1.927.007-2.94 1.196-2.981 2.426h1.23c.064-.71.732-1.336 1.744-1.336 1.027 0 1.744.64 1.744 1.568.007.95-.738 1.639-1.744 1.639h-.991V8.4ZM7.495 13V3.201H6.174v4.15H1.32V3.2H0V13h1.32V8.513h4.854V13z"/>
                    </svg>
                </button>
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`clean-btn ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`} title="大標題 (Ctrl+Alt+2)" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M7.495 13V3.201H6.174v4.15H1.32V3.2H0V13h1.32V8.513h4.854V13zm3.174-7.071v-.05c0-.934.66-1.752 1.801-1.752 1.005 0 1.76.639 1.76 1.651 0 .898-.582 1.58-1.12 2.19l-3.69 4.2V13h6.331v-1.149h-4.458v-.079L13.9 8.786c.919-1.048 1.666-1.874 1.666-3.101C15.565 4.149 14.35 3 12.499 3 10.46 3 9.384 4.393 9.384 5.879v.05z"/>
                    </svg>
                </button>

                <div className="toolbar-divider"></div>

                {/* 3. 文字裝飾 */}
                <button onClick={() => editor.chain().focus().toggleBold().run()} className={`clean-btn ${editor.isActive('bold') ? 'is-active' : ''}`} title="粗體 (Ctrl+Alt+B)" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8.21 13c2.106 0 3.412-1.087 3.412-2.823 0-1.306-.984-2.283-2.324-2.386v-.055a2.176 2.176 0 0 0 1.852-2.14c0-1.51-1.162-2.46-3.014-2.46H3.843V13zM5.908 4.674h1.696c.963 0 1.517.451 1.517 1.244 0 .834-.629 1.32-1.73 1.32H5.908V4.673zm0 6.788V8.598h1.73c1.217 0 1.88.492 1.88 1.415 0 .943-.643 1.449-1.832 1.449H5.907z"/>
                    </svg>
                </button>
                <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`clean-btn ${editor.isActive('underline') ? 'is-active' : ''}`} title="底線 (Ctrl+Alt+U)" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M5.313 3.136h-1.23V9.54c0 2.105 1.47 3.623 3.917 3.623s3.917-1.518 3.917-3.623V3.136h-1.23v6.323c0 1.49-.978 2.57-2.687 2.57s-2.687-1.08-2.687-2.57zM12.5 15h-9v-1h9z"/>
                    </svg>
                </button>
                <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`clean-btn ${editor.isActive('strike') ? 'is-active' : ''}`} title="刪除線 (Ctrl+Alt+X)" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M6.333 5.686c0 .31.083.581.27.814H5.166a2.8 2.8 0 0 1-.099-.76c0-1.627 1.436-2.768 3.48-2.768 1.969 0 3.39 1.175 3.445 2.85h-1.23c-.11-1.08-.964-1.743-2.25-1.743-1.23 0-2.18.602-2.18 1.607zm2.194 7.478c-2.153 0-3.589-1.107-3.705-2.81h1.23c.144 1.06 1.129 1.703 2.544 1.703 1.34 0 2.31-.705 2.31-1.675 0-.827-.547-1.374-1.914-1.675L8.046 8.5H1v-1h14v1h-3.504c.468.437.675.994.675 1.697 0 1.826-1.436 2.967-3.644 2.967"/>
                    </svg>
                </button>

                <div className="toolbar-divider"></div>

                {/* 4. 清單 */}
                <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`clean-btn ${editor.isActive('bulletList') ? 'is-active' : ''}`} title="無序清單 (Ctrl+D)" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2m0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2m0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/>
                    </svg>
                </button>
                <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`clean-btn ${editor.isActive('orderedList') ? 'is-active' : ''}`} title="有序清單 (Ctrl+O)" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"  viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5"/>
                        <path d="M1.713 11.865v-.474H2c.217 0 .363-.137.363-.317 0-.185-.158-.31-.361-.31-.223 0-.367.152-.373.31h-.59c.016-.467.373-.787.986-.787.588-.002.954.291.957.703a.595.595 0 0 1-.492.594v.033a.615.615 0 0 1 .569.631c.003.533-.502.8-1.051.8-.656 0-1-.37-1.008-.794h.582c.008.178.186.306.422.309.254 0 .424-.145.422-.35-.002-.195-.155-.348-.414-.348h-.3zm-.004-4.699h-.604v-.035c0-.408.295-.844.958-.844.583 0 .96.326.96.756 0 .389-.257.617-.476.848l-.537.572v.03h1.054V9H1.143v-.395l.957-.99c.138-.142.293-.304.293-.508 0-.18-.147-.32-.342-.32a.33.33 0 0 0-.342.338zM2.564 5h-.635V2.924h-.031l-.598.42v-.567l.629-.443h.635z"/>
                    </svg>
                </button>

                <div className="toolbar-divider"></div>

                {/* 5. 區塊 */}
                <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`clean-btn ${editor.isActive('blockquote') ? 'is-active' : ''}`} title="引用 (Ctrl+Alt+Q)" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M12 12a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1h-1.388q0-.527.062-1.054.093-.558.31-.992t.559-.683q.34-.279.868-.279V3q-.868 0-1.52.372a3.3 3.3 0 0 0-1.085.992 4.9 4.9 0 0 0-.62 1.458A7.7 7.7 0 0 0 9 7.558V11a1 1 0 0 0 1 1zm-6 0a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1H4.612q0-.527.062-1.054.094-.558.31-.992.217-.434.559-.683.34-.279.868-.279V3q-.868 0-1.52.372a3.3 3.3 0 0 0-1.085.992 4.9 4.9 0 0 0-.62 1.458A7.7 7.7 0 0 0 3 7.558V11a1 1 0 0 0 1 1z"/>
                    </svg>
                </button>
                <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={`clean-btn ${editor.isActive('codeBlock') ? 'is-active' : ''}`} title="程式碼 (Ctrl+Alt+P)" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                        <path d="M6.854 4.646a.5.5 0 0 1 0 .708L4.207 8l2.647 2.646a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 0 1 .708 0m2.292 0a.5.5 0 0 0 0 .708L11.793 8l-2.647 2.646a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708 0"/>
                    </svg>
                </button>

                <div className="toolbar-divider"></div>

                {/* 6. 插入 */}
                <button onClick={openLinkModalHandler} className={`clean-btn ${editor.isActive('link') ? 'is-active' : ''}`} title="連結 (Alt+L)" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z"/>
                        <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z"/>
                    </svg>
                </button>
                <button onClick={() => setIsImgMdlOp(true)} className="clean-btn" title="圖片 (Alt+I)" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"/>
                        <path d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2M14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1M2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.777 1.947V5a1 1 0 0 0-1-1z"/>
                    </svg>
                </button>

                {/* 7. 儲存與關閉 */}
                {/* 如果 articleId 存在，顯示刪除按鈕 */}
                {articleId && (
                    <button 
                        className="clean-btn" 
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#DC143C', fontWeight: 'bold'}}
                        onClick={deleteArticleHandler}
                        title="刪除文章"
                    >
                        <div style={{display:'flex', marginRight:'15px', alignItems:'center'}}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{marginLeft:'30px',marginRight:'5px'}}>
                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                            </svg>
                            <div>刪除</div>
                        </div>
                    </button>
                )}
                <button 
                    className="clean-btn" 
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: hasUnsavedChanges ? '#ff6b6b' : '#333', fontWeight: 'bold' ,marginLeft:'15px'}}
                    onClick={saveArticle} /* 綁定真實的儲存 API */
                >
                    {hasUnsavedChanges ? (
                        <div style={{display:'flex', marginRight:'5px', alignItems:'center'}}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#DC143C" viewBox="0 0 16 16" style={{marginRight:'5px'}}>
                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4m.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/>
                            </svg>
                            <div>尚未儲存</div>
                        </div>
                        ) : (
                        <div style={{display:'flex', marginRight:'5px', alignItems:'center'}}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#00FF7F" viewBox="0 0 16 16" style={{marginRight:'5px'}}>
                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                            </svg>
                            <div>已儲存</div>
                        </div>
                        )
                    }
                </button>
                <button onClick={() => setIsToolbarOpen(false)} className="clean-btn" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: '10vw' }}>✖ 關閉</button>
            </div>
        </div>

        {/* 編輯器主要捲動區 */}
        <div className="editor-scroll-area">
            <main className="editor-main-content">
                <div className="cover-upload-area">
                    <input type="file" ref={coverInputRef} onChange={coverUploader} accept="image/jpeg, image/png, image/webp" style={{ display: 'none' }} />
                    {coverImgUrl ? (
                        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => coverInputRef.current.click()} title="點擊更換封面圖片" >
                            <img src={coverImgUrl} alt="文章封面" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '8px' }} />
                            <div style={{ position: 'absolute', top: '10px', right: '10px', color: '#ffffff85', padding: '6px 10px', borderRadius: '4px', fontSize: '15px' }}>
                                封面
                            </div>
                        </div>
                    ) : (
                        <button className="clean-btn" onClick={() => coverInputRef.current.click()} style={{ fontSize: '60px', color: '#b3b3b3', padding: '20px 0' }} >
                            + 
                        </button>
                    )}
                </div>
                <div className="title-area">
                    <input 
                        type="text" 
                        className="title-input"
                        placeholder="//標題" 
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            setHasUChgs(true);
                        }}
                    />
                </div>
                <div className="content-area">
                    < EditorContent editor={editor}/>
                </div>
            </main>
        </div>
        {isImageModalOpen && (
            <div className="leave-confirm-modal">
                <div className="modal-content">
                    <h3>插入圖片</h3>
                    <p style={{color:'#B0C4DE05',marginBottom: '24px'}}></p>
                    <input type="file" id="content-image-input" accept="image/jpeg, image/png, image/webp, image/gif" onChange={contentImageUploader} style={{ display: 'none' }}/>
                    <div className='modal-actions'>
                        <button className='btn-cancel' onClick={() => setIsImgMdlOp(false)}>取消</button>
                        <label htmlFor="content-image-input" className="btn-danger" style={{ background: '#9932CC', margin: 0, display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                            選擇圖片檔案
                        </label>
                    </div>
                </div>
            </div>
        )}
        {isLinkModalOpen && (
            <div className="leave-confirm-modal">
                <div className="modal-content" style={{ textAlign: 'left' }}>
                    <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>新增連結</h3>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{display: 'block', fontWeight: 'bold', fontSize: '14px', marginBottom: '8px'}}>
                            URL
                        </label>
                        <input 
                                type="url" 
                                className="title-input" 
                                style={{ fontSize: '16px', borderBottom: '1px solid #ddd', padding: '5px 0' }}
                                placeholder="https://..." 
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleLinkSubmit(); }}
                                autoFocus 
                            />
                    </div>
                    <div style={{marginBottom: '25px'}}>
                        <label style={{ display: 'block', fontWeight: 'bold', fontSize: '14px', marginBottom: '8px', marginTop: '20px' }}>
                            顯示
                        </label>
                        <input 
                            type="text" 
                            className="title-input" 
                            style={{ fontSize: '16px', borderBottom: '1px solid #ddd', padding: '5px 0' }}
                            placeholder="顯示文字" 
                            value={linkTxt}
                            onChange={(e) => setLinkTxt(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleLinkSubmit(); }}
                        />
                    </div>
                    <div className='modal-actions'>
                        <button className='btn-cancel' onClick={() => setIsLinkMdlOp(false)}>關閉</button>
                        <button className='btn-danger' onClick={handleLinkSubmit}>確認</button>
                    </div>
                </div>
            </div>
        )}

        {/* B. 底部提示區 (由下往上滑入) */}
        <div className={`hint-overlay ${isHintOpen ? 'open' : ''}`}>
            
            {/* 提示區頂部：標題與關閉按鈕 */}
            <div className="hint-header">
                <span style={{ fontWeight: 'bold', color: '#9932CC65', fontSize: '20px' }}> HINT</span>
                <button onClick={() => setIsHintOpen(false)} className="close-hint-btn" title="關閉提示">×</button>
            </div>

            {/* 提示區底部：卡片輪播區 (整體垂直/水平置中) */}
            <div className="hint-carousel-wrapper">
                {/* 左滑按鈕 (無邊框) */}
                <button onClick={scrollHintLeft} className="hint-arrow-btn hint-arrow-left">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M9.224 1.553a.5.5 0 0 1 .223.67L6.56 8l2.888 5.776a.5.5 0 1 1-.894.448l-3-6a.5.5 0 0 1 0-.448l3-6a.5.5 0 0 1 .67-.223"/>
                    </svg>
                </button>
                
                {/* 卡片橫向捲動區 */}
                <div ref={hintScrollRef} className="hint-scroll-container">
                    {hintCards.map(card => (
                        <div key={card.id} className="hint-card">
                            <div className="hint-card-text" style={{ flex: 1 }}>
                                <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>{card.icon} {card.title}</h4>
                                {card.content}
                            </div>
                        </div>
                    ))}
                </div>

                {/* 右滑按鈕 (無邊框) */}
                <button onClick={scrollHintRight} className="hint-arrow-btn hint-arrow-right">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M6.776 1.553a.5.5 0 0 1 .671.223l3 6a.5.5 0 0 1 0 .448l-3 6a.5.5 0 1 1-.894-.448L9.44 8 6.553 2.224a.5.5 0 0 1 .223-.671"/>
                    </svg>
                </button>
            </div>
        </div>
    </div>
    );
};

export default EditorPage;
