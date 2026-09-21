import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import { getMovieImage } from "../utils/movieImages";

import "../styles/Payment.css";


function Payment() {

    const location = useLocation();

    const navigate = useNavigate();


    // ==================================================
    // GET BOOKING DATA
    // ==================================================

    const bookingData = location.state;


    const [method, setMethod] =
        useState("");


    // ==================================================
    // NO BOOKING DATA
    // ==================================================

    if (!bookingData) {

        return (

            <>

                <Navbar />

                <div
                    style={{
                        textAlign: "center",
                        padding: "80px 20px"
                    }}
                >

                    <h2>
                        No Booking Details Found
                    </h2>

                    <p>
                        Please select a movie, theatre
                        and seats before payment.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/")
                        }
                    >
                        🏠 Go Home
                    </button>

                </div>

                <Footer />

            </>

        );

    }


    // ==================================================
    // MOVIE INFORMATION
    // ==================================================

    /*
        Movie information can come in two ways:

        1. bookingData.movie
        2. bookingData.movie_id + movie_title

        We support both.
    */

    const movie =
        bookingData.movie &&
        typeof bookingData.movie === "object"

            ? bookingData.movie

            : {

                id:
                    bookingData.movie_id,

                title:
                    bookingData.movie_title ||
                    bookingData.movie ||
                    "",

                image:
                    bookingData.image ||
                    "",

                rating:
                    bookingData.rating ||
                    ""

            };


    // ==================================================
    // MOVIE TITLE
    // ==================================================

    const movieTitle =
        movie?.title ||
        bookingData.movie_title ||
        (
            typeof bookingData.movie === "string"
                ? bookingData.movie
                : ""
        );


    // ==================================================
    // MOVIE ID
    // ==================================================

    const movieId =
        bookingData.movie_id ||
        movie?.id;


    // ==================================================
    // MOVIE IMAGE
    // ==================================================

    const movieImageFile =
        movie?.image ||
        bookingData.image ||
        "";


    const movieImage =
        getMovieImage(
            movieImageFile
        );


    // ==================================================
    // MOVIE RATING
    // ==================================================

    const movieRating =
        movie?.rating ||
        bookingData.rating ||
        "N/A";


    // ==================================================
    // VALIDATE MOVIE INFORMATION
    // ==================================================

    if (!movieTitle || !movieId) {

        return (

            <>

                <Navbar />

                <div
                    style={{
                        textAlign: "center",
                        padding: "80px 20px"
                    }}
                >

                    <h2>
                        Movie information is missing.
                    </h2>

                    <p>
                        Please go back and select the
                        movie again.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/movies")
                        }
                    >
                        🎬 Go To Movies
                    </button>

                </div>

                <Footer />

            </>

        );

    }


    // ==================================================
    // CONVERT SEATS
    // ==================================================

    const seats =

        Array.isArray(
            bookingData.seats
        )

            ? bookingData.seats.map(
                (seat) => {

                    if (
                        typeof seat ===
                        "object"
                    ) {

                        return (

                            seat.seat ||

                            seat.name ||

                            seat.label ||

                            ""

                        );

                    }

                    return String(seat);

                }
            )

            : [];


    // ==================================================
    // PRICE PER SEAT
    // ==================================================

    const pricePerSeat =
        Number(
            bookingData.pricePerSeat ||
            0
        );


    // ==================================================
    // TOTAL PRICE
    // ==================================================

    const totalPrice =
        Number(
            bookingData.price ||
            (
                seats.length *
                pricePerSeat
            )
        );


    // ==================================================
    // PAYMENT
    // ==================================================

    const payment = async () => {

        // --------------------------------------------------
        // CHECK PAYMENT METHOD
        // --------------------------------------------------

        if (!method) {

            alert(
                "Please select a payment method"
            );

            return;

        }


        // --------------------------------------------------
        // CHECK MOVIE
        // --------------------------------------------------

        if (!movieTitle || !movieId) {

            alert(
                "Movie information is missing. Please go back and select the movie again."
            );

            return;

        }


        // --------------------------------------------------
        // CHECK SEATS
        // --------------------------------------------------

        if (seats.length === 0) {

            alert(
                "Please select at least one seat."
            );

            return;

        }


        // --------------------------------------------------
        // CHECK PRICE
        // --------------------------------------------------

        if (totalPrice <= 0) {

            alert(
                "Invalid booking amount."
            );

            return;

        }


        // --------------------------------------------------
        // GET USER
        // --------------------------------------------------

        const storedUser =
            localStorage.getItem("user");


        if (!storedUser) {

            alert(
                "Please login before payment."
            );

            navigate(
                "/login",
                {
                    state: {
                        from: "/payment"
                    }
                }
            );

            return;

        }


        // --------------------------------------------------
        // PARSE USER
        // --------------------------------------------------

        let user;


        try {

            user =
                JSON.parse(
                    storedUser
                );

        }

        catch (error) {

            console.error(
                "Invalid user data:",
                error
            );

            localStorage.removeItem(
                "user"
            );

            alert(
                "Your login session is invalid. Please login again."
            );

            navigate(
                "/login"
            );

            return;

        }


        // --------------------------------------------------
        // CHECK USER ID
        // --------------------------------------------------

        if (!user?.id) {

            alert(
                "User information not found. Please login again."
            );

            localStorage.removeItem(
                "user"
            );

            navigate(
                "/login"
            );

            return;

        }


        // ==================================================
        // FINAL BOOKING OBJECT
        // ==================================================

        const booking = {

            // ----------------------------------------------
            // USER
            // ----------------------------------------------

            user_id:
                Number(
                    bookingData.user_id ||
                    user.id
                ),


            // ----------------------------------------------
            // MOVIE
            // ----------------------------------------------

            movie_id:
                Number(
                    movieId
                ),


            movie:
                movieTitle,


            // ----------------------------------------------
            // IMAGE
            // ----------------------------------------------

            image:
                movieImageFile || "",


            // ----------------------------------------------
            // LOCATION
            // ----------------------------------------------

            city:
                bookingData.city || "",


            // ----------------------------------------------
            // THEATRE
            // ----------------------------------------------

            theatre:
                bookingData.theatre || "",


            // ----------------------------------------------
            // DATE
            // ----------------------------------------------

            date:
                bookingData.date || "",


            // ----------------------------------------------
            // TIME
            // ----------------------------------------------

            time:
                bookingData.time || "",


            // ----------------------------------------------
            // SEATS
            // ----------------------------------------------

            seats:
                seats,


            // ----------------------------------------------
            // PRICE
            // ----------------------------------------------

            price:
                totalPrice

        };


        console.log(
            "================================"
        );

        console.log(
            "SENDING BOOKING TO BACKEND:"
        );

        console.log(
            booking
        );

        console.log(
            "================================"
        );


        // ==================================================
        // SEND BOOKING TO FASTAPI
        // ==================================================

        try {

            const response =
                await fetch(
                    "http://40.192.61.165:8000/bookings/",
                    {

                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(
                                booking
                            )

                    }
                );


            // ------------------------------------------------
            // READ RESPONSE
            // ------------------------------------------------

            let savedBooking;


            try {

                savedBooking =
                    await response.json();

            }

            catch (error) {

                console.error(
                    "Backend response is not valid JSON:",
                    error
                );

                alert(
                    "Invalid response from backend."
                );

                return;

            }


            console.log(
                "BACKEND RESPONSE:",
                savedBooking
            );


            // ==================================================
            // BOOKING FAILED
            // ==================================================

            if (!response.ok) {

                console.error(
                    "BOOKING FAILED:",
                    savedBooking
                );


                // FastAPI validation error
                if (
                    response.status === 422 &&
                    Array.isArray(
                        savedBooking.detail
                    )
                ) {

                    const errors =
                        savedBooking.detail
                            .map(
                                (error) => {

                                    const field =
                                        Array.isArray(
                                            error.loc
                                        )
                                            ? error.loc.join(".")
                                            : "field";

                                    return (
                                        `${field}: ${error.msg}`
                                    );

                                }
                            )
                            .join("\n");


                    alert(
                        "Booking validation failed:\n\n" +
                        errors
                    );

                    return;

                }


                alert(
                    savedBooking.detail ||
                    "Booking failed."
                );

                return;

            }


            // ==================================================
            // BOOKING SUCCESS
            // ==================================================

            console.log(
                "BOOKING CREATED SUCCESSFULLY:"
            );

            console.log(
                savedBooking
            );


            // ==================================================
            // SUCCESS DATA
            // ==================================================

            const successData = {

                ...bookingData,


                // ----------------------------------------------
                // USER
                // ----------------------------------------------

                user_id:
                    booking.user_id,


                // ----------------------------------------------
                // MOVIE
                // ----------------------------------------------

                movie_id:
                    booking.movie_id,


                movie_title:
                    movieTitle,


                movie: {

                    id:
                        movieId,

                    title:
                        movieTitle,

                    image:
                        movieImageFile,

                    rating:
                        movieRating

                },


                // ----------------------------------------------
                // IMAGE
                // ----------------------------------------------

                image:
                    movieImageFile,


                // ----------------------------------------------
                // SEATS
                // ----------------------------------------------

                seats:
                    seats,


                // ----------------------------------------------
                // PRICE
                // ----------------------------------------------

                pricePerSeat:
                    pricePerSeat,

                price:
                    totalPrice,


                // ----------------------------------------------
                // PAYMENT
                // ----------------------------------------------

                paymentMethod:
                    method,


                // ----------------------------------------------
                // BOOKING ID
                // ----------------------------------------------

                booking_id:
                    savedBooking.booking_id

            };


            // ==================================================
            // SAVE LOCAL BOOKING
            // ==================================================

            let oldBookings = [];


            try {

                oldBookings =
                    JSON.parse(
                        localStorage.getItem(
                            "bookings"
                        ) || "[]"
                    );

                if (
                    !Array.isArray(
                        oldBookings
                    )
                ) {

                    oldBookings = [];

                }

            }

            catch (error) {

                console.error(
                    "Local booking data error:",
                    error
                );

                oldBookings = [];

            }


            const localBooking = {

                ...successData,

                bookingId:
                    savedBooking.booking_id

            };


            localStorage.setItem(

                "bookings",

                JSON.stringify(
                    [
                        ...oldBookings,
                        localBooking
                    ]
                )

            );


            // ==================================================
            // NAVIGATE TO SUCCESS
            // ==================================================

            navigate(
                "/success",
                {
                    state:
                        successData
                }
            );

        }

        catch (error) {

            console.error(
                "PAYMENT / BOOKING ERROR:",
                error
            );


            alert(
                "Booking failed. Please check whether FastAPI backend is running."
            );

        }

    };


    // ==================================================
    // JSX
    // ==================================================

    return (

        <>

            <Navbar />


            <div className="payment-page">


                <div className="payment-card">


                    {/* ======================================
                        HEADER
                    ====================================== */}

                    <h1>
                        💳 Payment
                    </h1>


                    {/* ======================================
                        MOVIE
                    ====================================== */}

                    <div className="payment-movie">


                        {movieImage ? (

                            <img

                                src={movieImage}

                                alt={
                                    movieTitle ||
                                    "Movie"
                                }

                                className="payment-image"

                                onError={(e) => {

                                    console.error(
                                        "Payment image failed:",
                                        movieImageFile
                                    );

                                    e.currentTarget.style.display =
                                        "none";

                                }}

                            />

                        ) : (

                            <div className="no-movie-image">

                                🎬 No Image

                            </div>

                        )}


                        <h2>

                            🎬{" "}

                            {movieTitle}

                        </h2>


                        <p>

                            ⭐{" "}

                            {movieRating}

                        </p>


                    </div>


                    {/* ======================================
                        BOOKING INFORMATION
                    ====================================== */}

                    <div className="booking-info">


                        <p>

                            🏙 City:{" "}

                            {bookingData.city ||
                                "N/A"}

                        </p>


                        <p>

                            🏢 Theatre:{" "}

                            {bookingData.theatre ||
                                "N/A"}

                        </p>


                        <p>

                            📅 Date:{" "}

                            {bookingData.date ||
                                "N/A"}

                        </p>


                        <p>

                            ⏰ Time:{" "}

                            {bookingData.time ||
                                "N/A"}

                        </p>


                        <p>

                            💺 Seats:{" "}

                            {seats.length > 0

                                ? seats.join(", ")

                                : "None"}

                        </p>


                        <p>

                            🎟 Tickets:{" "}

                            {seats.length}

                        </p>


                    </div>


                    {/* ======================================
                        PRICE
                    ====================================== */}

                    <h2 className="amount">

                        Total ₹
                        {totalPrice}

                    </h2>


                    {/* ======================================
                        PAYMENT METHODS
                    ====================================== */}

                    <div className="payment-options">


                        {/* UPI */}

                        <button

                            type="button"

                            className={

                                method === "UPI"

                                    ? "payment-option active"

                                    : "payment-option"

                            }

                            onClick={() =>
                                setMethod(
                                    "UPI"
                                )
                            }

                        >

                            📱

                            <p>
                                UPI
                            </p>

                        </button>


                        {/* CARD */}

                        <button

                            type="button"

                            className={

                                method === "CARD"

                                    ? "payment-option active"

                                    : "payment-option"

                            }

                            onClick={() =>
                                setMethod(
                                    "CARD"
                                )
                            }

                        >

                            💳

                            <p>
                                Card
                            </p>

                        </button>


                        {/* NET BANKING */}

                        <button

                            type="button"

                            className={

                                method === "NET BANKING"

                                    ? "payment-option active"

                                    : "payment-option"

                            }

                            onClick={() =>
                                setMethod(
                                    "NET BANKING"
                                )
                            }

                        >

                            🏦

                            <p>
                                Net Banking
                            </p>

                        </button>


                    </div>


                    {/* ======================================
                        CONFIRM PAYMENT
                    ====================================== */}

                    <button

                        type="button"

                        className="pay-btn"

                        onClick={
                            payment
                        }

                    >

                        Confirm Payment ✅

                    </button>


                    {/* ======================================
                        BACK
                    ====================================== */}

                    <button

                        type="button"

                        className="back-btn"

                        onClick={() =>
                            navigate(-1)
                        }

                    >

                        ← Back

                    </button>


                </div>

            </div>


            <Footer />

        </>

    );

}


export default Payment;
