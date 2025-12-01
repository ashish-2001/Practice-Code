import axios from "axios";

const axiosInstance = axios.create({});

function apiConnector(method, url, bodyData, headers, params){

    console.log("Api connector:", method, url, bodyData, headers, params);

    return axiosInstance({
        method: method,
        url: url,
        data: bodyData ? bodyData : null,
        headers: headers ? headers : {
            "Content-Type": "application/json" 
        },
        params: params ? params : null
    });
};

export {
    axiosInstance,
    apiConnector
}