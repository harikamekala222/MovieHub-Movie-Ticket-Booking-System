import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "../styles/Login.css";


function Login() {

    const navigate = useNavigate();


    // ==================================================
    // FORM STATE
    // ==================================================

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");


    // ==================================================
    // UI STATE
    // ==================================================

    const [showPassword, setShowPassword] =
        useState(false);

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);


    // ==================================================
    // LOGIN
    // ==================================================

    const handleLogin = async (e) => {

        e.preventDefault();


        // Clear previous error

        setError("");


        // ==================================================
        // VALIDATION
        // ==================================================

        if (
            !email.trim() ||
            !password
        ) {

            setError(
                "Please fill all fields"
            );

            return;

        }


        try {

            setLoading(true);


            // ==================================================
            // LOGIN API
            // ==================================================

            const response =
                await fetch(
                    "http://40.192.61.165:8000/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                name: "",
                                email:
                                    email.trim(),
                                password:
                                    password
                            })
                    }
                );


            // ==================================================
            // READ RESPONSE
            // ==================================================

            const data =
                await response.json();


            console.log(
                "Login response:",
                data
            );


            // ==================================================
            // LOGIN FAILED
            // ==================================================

            if (!response.ok) {

                setError(
                    data.detail ||
                    "Invalid email or password"
                );

                return;

            }


            // ==================================================
            // GET USER
            //
            // Backend response:
            //
            // {
            //     user: {
            //         id: 13,
            //         name: "Mathesh",
            //         email: "..."
            //     }
            // }
            // ==================================================

            const loggedInUser =
                data.user;


            // ==================================================
            // CHECK USER DATA
            // ==================================================

            if (
                !loggedInUser ||
                !loggedInUser.id
            ) {

                console.error(
                    "Invalid login response:",
                    data
                );


                setError(
                    "Login successful, but user information was not received."
                );

                return;

            }


            // ==================================================
            // SAVE USER
            // ==================================================

            localStorage.setItem(
                "user",
                JSON.stringify(
                    loggedInUser
                )
            );


            console.log(
                "Logged-in user:",
                loggedInUser
            );


            // ==================================================
            // IMPORTANT
            //
            // Notify Navbar immediately
            // ==================================================

            window.dispatchEvent(
                new Event("userChanged")
            );


            // ==================================================
            // SUCCESS MESSAGE
            // ==================================================

            alert(
                "Login Successful 🎬"
            );


            // ==================================================
            // GO TO PROFILE
            // ==================================================

            navigate(
                "/profile"
            );

        }

        catch (error) {

            console.error(
                "Login Error:",
                error
            );


            setError(
                "Unable to connect to the backend server"
            );

        }

        finally {

            setLoading(false);

        }

    };


    // ==================================================
    // JSX
    // ==================================================

    return (

        <>

            {/* ==========================================
                NAVBAR
            ========================================== */}

            <Navbar />


            {/* ==========================================
                LOGIN PAGE
            ========================================== */}

            <div className="login-page">


                <div className="login-card">


                    {/* ==================================
                        LOGO
                    ================================== */}

                    <h1>
                        🎬 MovieHub
                    </h1>


                    {/* ==================================
                        TITLE
                    ================================== */}

                    <h2>
                        Login
                    </h2>


                    {/* ==================================
                        ERROR
                    ================================== */}

                    {error && (

                        <p className="error">
                            {error}
                        </p>

                    )}


                    {/* ==================================
                        FORM
                    ================================== */}

                    <form
                        onSubmit={
                            handleLogin
                        }
                    >


                        {/* ==================================
                            EMAIL
                        ================================== */}

                        <input
                            type="email"
                            placeholder="Enter Email"

                            value={email}

                            onChange={(e) =>
                                setEmail(
                                    e.target.value
                                )
                            }

                            autoComplete="email"

                            disabled={loading}
                        />


                        {/* ==================================
                            PASSWORD
                        ================================== */}

                        <div className="password-box">


                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }

                                placeholder="Enter Password"

                                value={password}

                                onChange={(e) =>
                                    setPassword(
                                        e.target.value
                                    )
                                }

                                autoComplete="current-password"

                                disabled={loading}
                            />


                            {/* SHOW / HIDE PASSWORD */}

                            <button
                                type="button"

                                className="password-toggle"

                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }

                                disabled={loading}

                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >

                                {showPassword
                                    ? "🙈"
                                    : "👁️"}

                            </button>


                        </div>


                        {/* ==================================
                            LOGIN BUTTON
                        ================================== */}

                        <button
                            type="submit"
                            disabled={loading}
                        >

                            {loading
                                ? "Logging in..."
                                : "Login"}

                        </button>


                    </form>


                    {/* ==================================
                        REGISTER
                    ================================== */}

                    <p>

                        Don't have an account?{" "}

                        <Link to="/register">

                            Register

                        </Link>

                    </p>


                </div>

            </div>


            {/* ==========================================
                FOOTER
            ========================================== */}

            <Footer />

        </>

    );

}


export default Login;

