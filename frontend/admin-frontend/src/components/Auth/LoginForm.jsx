import { useState } from "react"

function SigninForm(){

    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const { email, password } = formData;
    
    const handleOnChange = (e) => {
        setFormData((prevData) => ({
            ...prevData,
            [e.target.name]: e.target.value
        }));
    };

    const handleOnSubmit = (e) => {
        e.preventDefault();

        
    }

    return (
        <div>
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
                    </label>
                    <button type="submit">Sign in!</button>
                </div>
            </form>
        </div>
    )
}

export {
    SigninForm
}