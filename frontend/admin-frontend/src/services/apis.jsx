const BASE_URL = import.meta.env.VITE_BASE_URL;

const endpoints = {
    SEND_OTP_API: BASE_URL + "/auth/sendOtp",
    SIGN_UP_API: BASE_URL + "/auth/signup",
    LOGIN_API: BASE_URL + "/auth/login",
    RESET_PASS_TOKEN: BASE_URL + "/auth/reset-pass-token",
    RESET_PASS_API: BASE_URL + "/auth/reset-password"
};

const customerEndpoints = {
    PRODUCT_PAYMENT_API: BASE_URL + "/payment/capturePayment",
    PRODUCT_VERIFY_API: BASE_URL + "/payment/verifyPayment",
    SEND_PAYMENT_SUCCESS_EMAIL_API: BASE_URL + "/payment/sendPaymentsSuccessEmail"
}

const productEndpoints = {
    GET_ALL_PRODUCT_API: BASE_URL + "/product/getAllProducts",
    PRODUCT_DETAILS_API: BASE_URL + "/product/getProductDetails",
    EDIT_PRODUCT_API: BASE_URL + "/product/editCourse",
    PRODUCT_CATEGORIES_API: BASE_URL + "/product/showAllCategories",
    CREATE_PRODUCT_API: BASE_URL + "/product/createProduct",
    GET_ALL_ADMIN_PRODUCTS: BASE_URL + "/product/getAllAdminProducts",
    DELETE_PRODUCT_API: BASE_URL + "/product/deleteProduct",
    GET_FULL_PRODUCT_DETAILS_AUTHENTICATED: BASE_URL + "/product/getFullProductDetails",
    CREATE_RATING_API: BASE_URL + "/product/createRating",
    ADD_PRODUCT_TO_CATEGORY_API: BASE_URL + "/product/addProductTOCategory",
    SEARCH_PRODUCT_API: BASE_URL + "/product/searchProduct",
    CREATE_CATEGORY_API: BASE_URL + "/product/createCategory"
};

const ratingAndEndpoints = {
    REVIEWS_DETAILS_API: BASE_URL + "/product/getReviews"
};

const contactEndpoint = {
    CONTACT_US_API: BASE_URL + "/contact/contactUs"
}

const settingsEndpoints = {
    UPDATE_DISPLAY_PICTURE: BASE_URL + "/profile/updateDisplayPicture",
    CHANGE_PASS_API: BASE_URL + "auth/changePassword",
    DELETE_ACCOUNT_API: BASE_URL + "/auth/deleteAccount"
};

export {
    endpoints,
    customerEndpoints,
    productEndpoints,
    ratingAndEndpoints,
    contactEndpoint,
    settingsEndpoints
}