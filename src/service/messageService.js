import { api } from "./services";

export async function sendMessage(data,id_){
    const config = {
        method: 'post',
        url: `/api/v1/article/${id_}/msg`,
        data:{
            'content':data
        }
    };
    return api.request(config)
}

export async function getUnreads(){
    const config = {
        method: 'get',
        url: '/api/v1/unreads'
    };
    return api.request(config)
}

export async function getMessages(qs){
    const urls = qs? `/api/v1/messages?${qs}`: '/api/v1/messages?page=1';
    const config = {
        method: 'get',
        url: urls
    };
    return api.request(config)
}

export async function getMessage(id) {
    const config = {
        method: 'get',
        url: `/api/v1/mailbox/${id}`
    };
    return api.request(config)
    
}

export async function sendReply(data,id) {
    const config = {
        method: 'post',
        url: `/api/v1/message/${id}`,
        data:{
            'content':data
        }
    };
    return api.request(config)
}

export async function changeIsRead(id){
    const config = {
        method:'patch',
        url:`/api/v1/mailbox/${id}`
    };
    return api.request(config)
}