import { setLoading, setToken, setUser } from "../../slices/authSlice";
import { apiConnector } from "../apiConnector";
import { endpoints } from "../apis";
import toast from "react-hot-toast";

const {
    SEND_OTP_API,
    SIGN_UP_API,
    LOGIN_API,
    RESET_PASS_TOKEN,
    RESET_PASS_API
} = endpoints;

function sendOtp(email, navigate){

    return async (dispatch) => {

        const toastId = toast.loading("Loading...")
        dispatch(setLoading(true));

        try{
            const response = await apiConnector("POST", SEND_OTP_API, {
                email,
                checkUserPresent: true
            });

            console.log("Send otp api response", response.data.success);

            if(!response.data.success){
                throw new Error(response.data.message);
            }

            toast.success("Otp sent successfully");
            navigate("/verify-email")
        } catch(error){
            console.error("Send otp api error", error);
            toast.error("Could not send otp");
        }

        dispatch(setLoading(false));
        toast.dismiss(toastId);
    } 
}

function signUp(firstName, lastName, email, password, confirmPassword, otp, navigate ){
    async (dispatch) => {

        const toastId = toast.loading("Loading...");
        dispatch(setLoading(true))

        const otpString = otp.toString().trim();

        try{

            const response = await apiConnector("POST", SIGN_UP_API, {
                firstName,
                lastName,
                email,
                password,
                confirmPassword,
                otp: otpString
            });

            console.log("Sign up api response:", response);

            if(!response.data.success){
                throw new Error(response.data.message);
            }

            toast.success("Sign up  successful");
            navigate("/login");
        } catch(error){
            toast.error("Sign up failed", error);
            navigate("/signup");
        } 

        dispatch(setLoading(false));
        toast.dismiss(toastId);
    }
}

function login(email, password, navigate){

    return async(dispatch) => {

        const toastId = toast.loading("Loading...");
        dispatch(setLoading(true));

        try{

            const response = await apiConnector("POST", LOGIN_API, {
                email,
                password
            });

            console.log("Log in api response:", response)

            if(!response.data.success){
                throw new Error(response.data.message);
            }

            dispatch(setToken(response.data.token));

            const userImage = response.data.user.profileImage
            ? response.data.user.profileImage
            : `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.user.firstName} ${response.data.user.lastName}`
            dispatch(setUser({ ...response.data.user, profileImage: userImage }))
            localStorage.setItem("token", JSON.stringify(response.data.token));

            if(response.data.user.role === "Seller" && !response.data.user.approved){
                toast("Your account is pending for approval")
                navigate("/")
            }else{
                navigate("/dashboard")
            }
        }catch(error){
            console.log("Login api response error:", error)
            toast.error("Log in failed")
        }
        dispatch(setLoading(false))
        toast.dismiss(toastId);
    }
}

function resetPassToken(email, setEmailSent){

    return async(dispatch) => {

        const toastId = toast.loading("Loading");
        dispatch(setLoading(true));

        try{
            const response = await apiConnector("POST", RESET_PASS_TOKEN, {
                email
            });

            console.log("Reset password token api:", response);

            if(!response.data.success){
                throw new Error(response.data.message);
            }

            toast.success("Password token reset successful");
            setEmailSent(true);
        } catch(error){
            console.log("Reset password token api error:", error);
            toast.error("Reset password token failed")
        }

        dispatch(setLoading(false));
        toast.dismiss(toastId);
    }
}

function resetPassword(password, confirmPassword, token, setResetComplete){

    return async (dispatch) => {
        
        const toastId = toast.loading("Loading...")
        dispatch(setLoading(true))

        try{
            const response = await apiConnector("POST", RESET_PASS_API, {
                password,
                confirmPassword,
                token
            })

            console.log("Reset password response api", response);

            if(!response.data.success){
                throw new Error(response.data.message);
            }

            toast.success("Password reset successful")
            setResetComplete(true);
        } catch(error){
            console.log("Reset password error", error)
            toast.error("Password reset")
        }
        toast.dismiss(toastId);
        dispatch(setLoading(false));
    }
}

export {
    sendOtp,
    signUp,
    login,
    resetPassToken,
    resetPassword
}