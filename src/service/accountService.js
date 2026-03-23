import {api} from './services';

let config

export async function login(acc,psw){
    const data={
            "account_login": acc,
            "psw_login": psw
        };
    config={
        method: 'post',
        url: '/api/v1/auth/login',
        data : data
    };
    return api.request(config)
}

export async function register(data){
    const userData ={
        "account":data['account'],
        "email":data['email'],
        "passwords":data['psw'],
        "user_name":data['userName']
    };
    config={
        method: 'post',
        url: '/api/v1/auth/register',
        data : userData
    };
    return api.request(config)
}

export async function getUser(account) {
    config={
        method: 'get',
        url: `/api/v1/profile/${account}`,
    };
    return api.request(config)
}


export async function updateUser(data){
    config={
        method: 'patch',
        url: '/api/v1/profile/setting',
        data : data
    };
    return api.request(config)
}

export async function deleteUser(psw){
    config={
        method: 'delete',
        url: '/api/v1/profile/setting',
        data : {
            "passwords":psw
        }
    };
    return api.request(config)
}

export async function changeAvatar(file){
    const formData = new FormData();
    formData.append('avatar',file);
    config={
        method: 'patch',
        url: '/api/v1/profile/avatar',
        data : formData
    };
    return api.request(config)
}

//找回密碼
export async function retrievePsw(info){
    config={
        method: 'post',
        url:'/api/v1/rppsw',
        data:{
            "account_login":info
        }
    };
    return api.request(config)
}

//驗證
export async function verifyMail(){
    config={
        method:'post',
        url:'/api/v1/verify',
    };
    return api.request(config)
}

export async function logout(){
    config={
        method:'post',
        url:'/api/v1/auth/logout'
    };
    return api.request(config)
}
