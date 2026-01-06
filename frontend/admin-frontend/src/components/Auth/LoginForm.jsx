import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";

function SigninForm(){

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [showPassword, setShowPassword] = useState(false);

    const { email, password } = formData;
    
    const handleOnChange = (e) => {
        setFormData((prevData) => ({
            ...prevData,
            [e.target.name]: e.target.value
        }));
    };

    const handleOnSubmit = (e) => {
        e.preventDefault();
        dispatch(login(email, password, navigate));
    }

    return (
        <div style={{ backgroundImage: 'url('')'}}>
            <form onSubmit={handleOnSubmit}>
                <div>
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
                            Password:
                        </p>
                        <input
                            required
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={password}
                            placeholder="Enter Password!"
                            onChange={handleOnChange}
                            className=""
                        />
                        <Link to="/forgot-password">
                            Forgot Password
                        </Link>
                    </label>
                    <button 
                        type="submit"
                        onClick={() => dispatch(setProgress(60))}
                    >
                        Sign in!
                    </button>
                </div>
            </form>
        </div>
    )
}

export {
    SigninForm
}