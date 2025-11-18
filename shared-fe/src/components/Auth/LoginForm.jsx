function SigninForm(){

    return (
        <div>
            <form>
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