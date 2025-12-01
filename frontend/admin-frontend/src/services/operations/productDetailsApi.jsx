import toast from "react-hot-toast";
import { apiConnector } from "../apiConnector";
import { productEndpoints } from "../apis";
import { setProgress } from "../../slices/loadingBarSlice";

const {
    PRODUCT_DETAILS_API,
    PRODUCT_CATEGORIES_API,
    CREATE_CATEGORY_API,
    EDIT_PRODUCT_API,
    CREATE_PRODUCT_API,
    GET_ALL_SELLER_PRODUCT,
    GET_ALL_PRODUCT_API,
    DELETE_PRODUCT_API,
    GET_FULL_PRODUCT_DETAILS_AUTHENTICATED,
    CREATE_RATING_API,
    ADD_PRODUCT_TO_CATEGORY_API,
    SEARCH_PRODUCT_API
} = productEndpoints;

async function getAllProducts(){

    const toastId = toast.loading("Loading...");
    let result = [];

    try{
        const response = await apiConnector("GET", GET_ALL_PRODUCT_API)

        console.log("Get all product api response:", response);

        if(!response.data.success){
            throw new Error(response.data.message);
        }

        result = response?.data?.data;

    } catch(error){
        console.log("Get all product data error", error);
        toast.error(error.message);
    }

    toast.dismiss(toastId);
    return result;
}

export {
    getAllProducts
}