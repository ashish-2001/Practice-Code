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
    ADD_PRODUCT_TO_CATEGORY_API
}