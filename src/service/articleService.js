import {api} from './services';

let config;
/* 取已發布文章 */ 
export async function getArticles(qs){
    const urls = qs? '/api/v1/articles'+`?${qs}`: '/api/v1/articles'
    config = {
        method: 'get',
        url: urls,
    };
    return api.request(config)
}
export async function getArticle(id){
    config = {
        method: 'get',
        url:`/api/v1/article/${id}`,
    }
    return api.request(config)
}
/* 書籤 */ 
export async function addBookMark(articleID){
    config = {
        method: 'patch',
        url:`/api/v1/bookmark/${articleID}`,
    }
    return api.request(config)
}

export async function getBmkArticles(qs){
    const urls = `/api/v1/bmkaarticles?${qs}`;
    config = {
        method: 'get',
        url:urls,
    }
    return api.request(config)
}

export async function userBookMark(){
    config = {
        method: 'get',
        url:`/api/v1/bookmarks`,
    }
    return api.request(config)
}

export async function allTags(){
    config={
        method:'get',
        url:'/api/v1/alltags'
    }
    return api.request(config)
}
/* 編輯器圖片 */ 
export async function contentImgs(file){
    const formData = new FormData();
    formData.append('content_img',file);
    config={
        method: 'post',
        url: '/api/v1/article/img',
        data : formData
    };
    return api.request(config)
}

export async function coverImg(file,oldData){
    const formData = new FormData();
    formData.append('cover_img',file);
    if (oldData){
        formData.append('old_covers',oldData);
    };
    config={
        method: 'post',
        url: '/api/v1/article/cover',
        data : formData
    };
    return api.request(config)
}
/* 文章發布 */ 
export async function newArticle(data){
    const articleData ={
        "title":data['title'],
        "cover_img":data['coverImg'],
        "content":data['content'],
        "status":data['status'],
        "tags":data['tags']
    };
    config={
        method: 'post',
        url: '/api/v1/article',
        data : articleData,
    };
    return api.request(config)
}

export async function getDraft(id){
    config = {
        method: 'get',
        url:`/api/v1/draft/${id}`,
    }
    return api.request(config)
}

export async function getDrafts(){
    config = {
        method: 'get',
        url:`/api/v1/drafts`,
    }
    return api.request(config)
}

export async function updateArticle(id,data){
    config={
        method: 'patch',
        url: `/api/v1/article/${id}`,
        data : data
    };
    return api.request(config)
}

export async function deleteArticle(id){
    config={
        method: 'delete',
        url: `/api/v1/article/${id}`
    };
    return api.request(config)
}