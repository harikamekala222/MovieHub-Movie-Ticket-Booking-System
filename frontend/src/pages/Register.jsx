import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "../styles/Register.css";


function Register() {

    const navigate = useNavigate();


    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    const handleRegister = async (e) => {

        e.preventDefault();

        setError("");


        // Check empty fields
        if (
            !name ||
            !email ||
            !password ||
            !confirmPassword
        ) {

            setError("Please fill all fields");

            return;
        }


        // Check password
        if (password !== confirmPassword) {

            setError("Passwords do not match");

            return;
        }


        try {

            setLoading(true);


            const response = await fetch(
                "http://40.192.61.165:8000/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password
                    })
                }
            );


            const data = await response.json();

            console.log(
                "Register Response:",
                data
            );


            // Registration failed
            if (!response.ok) {

                setError(
                    data.detail ||
                    "Registration failed"
                );

                return;
            }


            // Save user information
            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );


            alert(
                "Registration Successful 🎬"
            );


            // Go to profile
            navigate("/profile");

        }

        catch (error) {

            console.error(
                "Register Error:",
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


    return (

        <>

            <Navbar />


            <div className="register-page">

                <div className="register-card">

                    <h1>
                        🎬 MovieHub
                    </h1>


                    <h2>
                        Create Account
                    </h2>


                    {error && (
                        <p className="error">
                            {error}
                        </p>
                    )}


                    <form onSubmit={handleRegister}>

                        {/* Name */}

                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                        />


                        {/* Email */}

                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                        />


                        {/* Password */}

                        <div className="password-box">

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                            />


                            <span
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                            >
                                👁
                            </span>

                        </div>


                        {/* Confirm Password */}

                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(
                                    e.target.value
                                )
                            }
                        />


                        {/* Register Button */}

                        <button
                            type="submit"
                            disabled={loading}
                        >

                            {loading
                                ? "Creating Account..."
                                : "Register"}

                        </button>

                    </form>


                    <p>

                        Already have an account?{" "}

                        <Link to="/login">
                            Login
                        </Link>

                    </p>

                </div>

            </div>


            <Footer />

        </>

    );
}


export default Register;
