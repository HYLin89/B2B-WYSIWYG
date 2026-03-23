import { useState, useEffect } from "react";
import { allTags } from "../service/articleService";

export default function useTags(){
    const [tags, setTags] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error,setError] = useState(null);

    useEffect(()=>{
        const cachedTags = sessionStorage.getItem('site_tags');
        if (cachedTags){
            setTags(JSON.parse(cachedTags));
            setIsLoading(false);
            return
        };
        setIsLoading(true);

        allTags()
        .then(response =>{
            const newTags = response.data.data;
            setTags(newTags);
            sessionStorage.setItem('site_tags',JSON.stringify(newTags));
        })
        .catch((err) =>{
            console.log(err);
            const newTags = ['暫時沒有任何標籤'];
            setTags(newTags);
            setError('Oops, something went wrong')
        })
        .finally(()=>{
            setIsLoading(false);
        })
    },[]);

    return {tags,isLoading,error}
}
