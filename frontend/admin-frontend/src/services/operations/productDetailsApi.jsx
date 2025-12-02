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

async function fetchSellerProducts(token){

    let result = [];
    const toastId = toast.loading("Loading...");

    try{
        const response = await apiConnector("GET", GET_ALL_SELLER_PRODUCT, null, {
            Authorization: `Bearer ${token}`
        });

        if(!response.data.success){
            throw new Error(response.data.message);
        }

        result = response.data.data;
    } catch(error){
        console.log("Get all seller products error:", error)
        toast.error("Failed to get the seller products")
    } finally{
        toast.dismiss(toastId);
    }
    return result;
}

async function deleteProducts(data, token){

    const toastId = toast.loading("Loading...");

    try{

        const response = await apiConnector("DELETE", DELETE_PRODUCT_API, data, {
            Authorization: `Bearer ${token}`
        })

        if(!response.data.success){
            throw new Error(response.data.message);
        }

        toast.success("Product deleted successfully");
    } catch(error){
        console.log("Delete api error", error);
        toast.error("Product could not be deleted")
    } finally{
        toast.dismiss(toastId);
    }
}

async function getFullDetailsOfTheProduct(productId, token){
    const toastId = toast.loading("Loading...")
    let result = null;

    try{
        const response = await apiConnector("GET", `${GET_FULL_PRODUCT_DETAILS_AUTHENTICATED}?productId=${productId}`, null, {
            Authorization: `Bearer ${token}`
        })

        if(!response.data.success){
            throw new Error(response.data.message);
        }

        result = response.data.data;
    } catch(error){
        console.log("Get full details of the product api error", error)
        toast.error("Could not get full details of the product")
    } finally{
        toast.dismiss(toastId);
    }
    return result;
}

async function createCategory(data, token){
    const toastId = toast.loading("Loading...");

    try{
        const response = await apiConnector("POST", CREATE_CATEGORY_API, data, {
            Authorization: `Bearer ${token}`
        })

        if(!response.data.success){
            throw new Error(response.data.message);
        }

        toast.success("Category created successfully");
    } catch(error){
        console.log("Create category api error", error)
        toast.error("Failed to create category");
    } finally{
        toast.dismiss(toastId);
    }
}

async function addProductToCategory(data, token){

    const toastId = toast.loading("Loading...");
    let success = false;

    try{
        const response = await apiConnector("POST", ADD_PRODUCT_TO_CATEGORY_API, data, {
            Authorization: `Bearer ${token}`
        })

        if(!response.data.success){
            throw new Error(response.data.message);
        }

        toast.success("Product added to the category")
        success = true
    } catch(error){
        console.log("Add product to the category api error", error);
        toast.error("Failed to add product to the category");
    } finally{
        toast.dismiss(toastId);
    }

    return success;
}

async function searchProduct(searchQuery, dispatch){
    
    dispatch(setProgress(50));
    let result = null;

    try{
        const response = await apiConnector("POST", SEARCH_PRODUCT_API, {
            searchQuery
        });

        if(!response.data.success){
            throw new Error(response.data.message);
        }

        result = response.data.data;
    } catch(error){
        console.log("Search product api error", error);
        toast.error("Failed to search product")
    }

    return result;
}

async function createRating(data, token){

    const toastId = toast.loading("Loading");
    let success = false;
    try{
        const response = await apiConnector("POST", CREATE_RATING_API, data, {
            Authorization: `Bearer ${token}`
        });

        if(!response.data.success){
            throw new Error(response.data.message);
        }

        toast.success("Rating created successfully");
        success = true
    } catch(error){
        console.log("Create rating api error", error);
        toast.error("Failed to create rating")
    } finally{
        toast.dismiss(toastId)
    }
    return success;
}

export {
    getAllProducts,
    fetchProductCategories,
    fetchProductDetails,
    addProductDetails,
    editProductDetails,
    fetchSellerProducts,
    deleteProducts,
    getFullDetailsOfTheProduct,
    createCategory,
    addProductToCategory,
    searchProduct,
    createRating
}