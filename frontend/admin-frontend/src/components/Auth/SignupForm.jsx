import { useState } from "react"
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setSignupData } from "../../slices/authSlice";
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai"

function SignupForm(){

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        contactNumber: "",
        password: "",
        confirmPassword: ""
    });

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { firstName, lastName, email, contactNumber, password, confirmPassword } = formData;

    const handleOnChange = (e) => {
        setFormData((prevData) => ({
            ...prevData,
            [e.target.name]: e.target.value
        }));
    };

    const handleOnSubmit = (e)=> {
        e.preventDefault();

        if(password !== confirmPassword){
            toast.error("Passwords do not match!");
            return;
        };

        const signupData = {
            ...formData
        };

        dispatch(setSignupData(signupData));
        dispatch(sendOtp(formData.email, navigate));

        setFormData({
            firstName: "",
            lastName: "",
            email: "",
            contactNumber: "",
            password: "",
            confirmPassword: ""
        });
    }

    return(
        <div>
            <form onSubmit={handleOnSubmit}>
                <div>
                    <label>
                        <p>
                            First Name:
                        </p>
                        <input
                            required
                            type="text"
                            name="firstName"
                            value={firstName}
                            placeholder="Enter first name!"
                            onChange={handleOnChange}
                            className=""
                        />
                    </label>
                    <label>
                        <p>
                            Last Name:
                        </p>
                        <input
                            required
                            type="text"
                            name="lastName"
                            value={lastName}
                            placeholder="Enter last name!"
                            onChange={handleOnChange}
                            className=""
                        />
                    </label>
                    <label>
                        <p>
                            Email:
                        </p>
                        <input
                            required
                            type="email"
                            name="email"
                            value={email}
                            placeholder="Enter email!"
                            onChange={handleOnChange}
                            className=""
                        />
                    </label>
                    <label>
                        <p>
                            Contact Number:
                        </p>
                        <input
                            required
                            type="text"
                            name="contactNumber"
                            value={contactNumber}
                            placeholder="Enter contact number!"
                            onChange={handleOnChange}
                            className=""
                        />
                    </label>
                    <label>
                        <p>
                            Password:
                        </p>
                        <input
                            required
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={password}
                            placeholder="Enter password!"
                            onChange={handleOnChange}
                            className=""
                        />
                        <span onClick={() => setShowPassword((prev) => !prev)}>
                            {
                                showPassword ? (
                                    <AiOutlineEyeInvisible/>
                                ) : (
                                    <AiOutlineEye/>
                                )
                            }
                        </span>
                    </label>
                    <label>
                        <p>
                            Confirm Password:
                        </p>
                        <input
                            required
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={confirmPassword}
                            placeholder="Enter confirm password!"
                            onChange={handleOnChange}
                            className=""
                        />
                        <span onClick={() => setShowConfirmPassword((prev) => !prev)}>
                            {
                                showConfirmPassword ? (
                                    <AiOutlineEyeInvisible/>
                                ) : (
                                    <AiOutlineEye/>
                                )
                            }
                        </span>
                    </label>

                    <button type="submit">sign up!</button>
                </div>
            </form>
        </div>
    )
}

export {
    SignupForm
}