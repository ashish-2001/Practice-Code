function Signin(){

    function handleSubmit(){
        console.log("This is a sign in page!");
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder="Enter email!"/>
                <input type="password" placeholder="Enter password!"/>
                <button type="submit">Sign in!</button>
            </form>
        </div>
    )
}

export {
    Signin
}