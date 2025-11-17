function Signup(){

    function handleSubmit(){
        console.log("This is a signup form!")
    }

    return(
        <div className="border-2 rounded-2xl p-4">
            <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
                <input type="text" placeholder="Enter your first name!"/>
                <input type="text" placeholder="Enter your last name!"/>
                <input type="email" placeholder="Enter your email!"/>
                <input type="password" placeholder="Enter password!"/>
                <input type="password" placeholder="Enter confirm password!"/>
                <input type="number" placeholder="Enter your contact number!"/>
                <button type="submit">
                    Create Account!
                </button>
            </form>
        </div>
    )
}

export {
    Signup
}