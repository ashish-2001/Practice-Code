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

async function fetchProductDetails(productId, dispatch){

    dispatch(setProgress(50));
    let result = null;

    try{
        const response = await apiConnector("GET", `${PRODUCT_DETAILS_API}?productId=${productId}`);

        console.log("Product details api:", response);

        if(!response.data.success){
            throw new Error(response.data.message || "Failed to fetch the product details");
        }

        result = response.data.data;
        
    } catch(error){
        console.log("Product details api error", error);
        toast.error("Failed to fetch the product details")
    }

    dispatch(setProgress(100));
    return result;
}

async function fetchProductCategories(){

    let result = [];

    try{
        const response = await apiConnector("GET", PRODUCT_CATEGORIES_API);

        console.log("Product categories api", response)

        if(!response.data.success){
            throw new Error(response.data.message);
        }

        result = response.data.data;
    } catch(error){
        console.log("Product categories error", error);
        toast.error("Product categories fetched successfully");
    }
    
    return result;
}

async function addProductDetails(data, token){

    const toastId = toast.loading("Loading...");
    let result = null;

    try{

        const response = await apiConnector("POST", CREATE_PRODUCT_API, data, {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
        })

        console.log("Create product api", response);

        if(!response.data.success){
            throw new Error(response.data.message);
        }

        toast.success("Product added to the category successfully");
        result = response.data.data;
    } catch(error){
        console.log("Create product api error", error);
        toast.error("Failed to add product to the category")
    } finally{
        toast.dismiss(toastId);
    }
    return result;
}

async function editProductDetails(data, token){

    const toastId = toast.loading("Loading...");

    let result = null;

    try{
        const response = await apiConnector("PUT", EDIT_PRODUCT_API, data, {
            "Content-type": "multipart/form-data" ,
            Authorization: `Bearer ${token}`
        });

        console.log("Edit product api", response);

        if(!response.data.success){
            throw new Error(response.data.message || "Could not update product details");
        }

        result = response?.data?.data;

        toast.success("Product data updated successfully");
    } catch(error){
        console.log("Update product api error", error)
        toast.error("Failed to update the product")
    } finally{
        toast.dismiss(toastId);
    }

    return result;
}
export {
    getAllProducts
}