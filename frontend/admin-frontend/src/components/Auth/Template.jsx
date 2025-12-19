import { useSelector } from "react-redux";
import { SigninForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";

function Template({ title, formType }){

    const { loading } = useSelector((state) => state.auth);

    return (
        <div>
            {
                loading ? (
                    <div>Loading...</div>
                ) : (
                    <div>
                        <div>
                            <h1>
                                {title}
                            </h1>
                            {formType === "signup" ? <SignupForm/> : <SigninForm/>}
                        </div>
                    </div>
                )
            }
        </div>
    )
};

export {
    Template
}