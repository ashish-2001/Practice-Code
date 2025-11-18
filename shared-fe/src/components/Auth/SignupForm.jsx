import { useState } from "react"
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

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

const { firstName, lastName, email, contactNumber, password, confirmPassword } = formData;

const handleOnChange = (e) => {
    setFormData((prevData) => ({
        ...prevData,
        [e.target.name]: e.target.value
    }));
};

const handleOnSubmit = (e) => {
    e.preventDefault();
    if(password !== confirmPassword){
        toast.error("Passwords do not match!");
        return;
    }

    const signupData = {
        ...formData
    }

    setFormData({
        firstName: "",
        lastName: "",
        email: "",
        contactNumber: "",
        password: "",
        confirmPassword: ""
    })
}


    return (
        <div>
            <form onSubmit={handleOnSubmit}>
                <div className="flex flex-col justify-center items-center">
                    <label>
                        <p>
                            Firstname:
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
                            Lastname:
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
                            placeholder="Enter email address!"
                            onChange={handleOnChange}
                            className=""
                        />
                    </label>
                    <label>
                        <p>
                            Create Password:
                        </p>
                        <input
                            required
                            type={ showPassword ? "text" : "password"}
                            name="password"
                            value={password}
                            placeholder="Enter password!"
                            onChange={handleOnChange}
                            className=""
                        />
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
                            placeholder="Confirm password!"
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

                    <button type="submit">Signup!</button>
                </div>
            </form>
        </div>
    )
}