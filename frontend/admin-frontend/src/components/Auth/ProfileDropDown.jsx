import { useRef, useState } from "react";
import { AiOutlineCaretDown } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { VscDashboard, VscSignOut } from "react-icons/vsc";
import { Link, useNavigate } from "react-router-dom";

function ProfileDropdown(){

    const { user } = useSelector((state) => state.profile);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const ref = useRef();

    useOnClickOutside(ref, () => setOpen(false));

    if(!user){
        console.log("no user");
        return localStorage.setItem("token", null);
    }

    return(
        <button onClick={() => setOpen(true)}>
            <div>
                <img alt={`profile-${user?.name}`} src={user?.image}/>
                <AiOutlineCaretDown/>
            </div>

            {open && (
                <div onClick={(e) => e.stopPropagation()} ref={ref}>
                    <Link to="/dashboard/user-profile" onClick={() => setOpen(false)}>
                        <div>
                            <VscDashboard/>
                            Dashboard
                        </div>
                    </Link>
                    <div onClick={() => {
                        dispatch(logout(navigate))
                        setOpen(false)
                    }}>
                        <VscSignOut/>
                        Logout
                    </div>
                </div>
            )}
        </button>
    )
}

export {
    ProfileDropdown
}