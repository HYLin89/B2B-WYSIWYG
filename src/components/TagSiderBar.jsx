import { useNavigate, useSearchParams } from "react-router-dom";
import useTags from "../hooks/useTags";
import { toast } from "react-toastify";

export default function TagSideBar(){
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const { tags : availableTags, isLoading, error: error } = useTags();
    const currentTags = searchParams.get('tag')?.split(',') || [];

    if (error){
        toast.error(error);
    };
    const toggleTags = (tag) =>{
        let newTags = [...currentTags];
        if (newTags.includes(tag)){
            newTags = newTags.filter(t => t!==tag);
        }else{
            newTags.push(tag);
        };
        const currentQuery = searchParams.get('query') || '';
        const queryString = new URLSearchParams();
        if (currentQuery){
            queryString.append('query',currentQuery);
        };
        if (newTags.length > 0){
            queryString.append('tag',newTags.join(','));
        };
        navigate(`/search?${queryString.toString()}`);
    };


    return (
    <aside className="tag-sidebar">

        {/* 根據 isLoading 切換顯示內容 */}
        {isLoading ? (
            // 載入中：顯示 5 個不同寬度的假按鈕 (骨架屏)
            <>
                <div className="skeleton-tag" style={{ width: '80px' }}></div>
                <div className="skeleton-tag" style={{ width: '60px' }}></div>
                <div className="skeleton-tag" style={{ width: '100px' }}></div>
                <div className="skeleton-tag" style={{ width: '70px' }}></div>
                <div className="skeleton-tag" style={{ width: '90px' }}></div>
            </>
        ) : (
            // 載入完成：渲染真實的標籤
            availableTags.map(tag => {
                const isSelected = currentTags.includes(tag);
                return (
                    <button
                        key={tag}
                        onClick={() => toggleTags(tag)}
                        style={{
                            padding: '8px 12px',
                            border: 'none',
                            backgroundColor: isSelected ? '#007bff' : '#fff',
                            color: isSelected ? '#fff' : '#333',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontWeight: isSelected ? 'bold' : 'normal',
                            fontSize:'18px',
                            textAlign: 'left',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        # {tag}
                    </button>
                );
            })
        )}
    </aside>
    )
}