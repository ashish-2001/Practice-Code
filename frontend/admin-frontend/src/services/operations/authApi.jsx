import { setLoading } from "../../slices/authSlice";
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

function signUp(firstName, lastName, email, password, confirmPassword, otp, navigate){

    return async(dispatch) => {
        const toastId = toast.loading("Loading...")
        dispatch(setLoading(true));
        const otpString = otp.toString().trim()

        try{

            const response = await apiConnector("POST", SIGN_UP_API, {
                firstName,
                lastName,
                email,
                password,
                confirmPassword,
                otp: otpString
            });

            console.log("Sign up api:", response);

            if(!response.data.success){
                throw new Error("response.data.message");
            }
            toast.success("Sign up successful");
            navigate("/login");
        } catch(error){
            console.error("Sign up api error:", error);
            toast.error("Sign up failed")
            navigate("/signup");
        }

        dispatch(setLoading(false))
        toast.dismiss(toastId);
    }
}

export {
    sendOtp
}