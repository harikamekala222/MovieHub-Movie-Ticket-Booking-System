import { useEffect, useState } from "react";

import {
    useLocation,
    useNavigate
} from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "../styles/SeatBooking.css";


function SeatBooking() {

    const location = useLocation();

    const navigate = useNavigate();


    // ==================================================
    // BOOKING INFORMATION
    // ==================================================

    const bookingInfo =
        location.state;


    const movie =
        bookingInfo?.movie;


    // ==================================================
    // STATE
    // ==================================================

    const [selectedSeats, setSelectedSeats] =
        useState([]);

    const [bookedSeats, setBookedSeats] =
        useState([]);

    const [loadingSeats, setLoadingSeats] =
        useState(true);

    const [seatError, setSeatError] =
        useState("");


    // ==================================================
    // SEAT LAYOUT
    // ==================================================

    const seatRows = {

        A: [
            "A1", "A2", "A3", "A4", "A5",
            "A6", "A7", "A8", "A9", "A10"
        ],

        B: [
            "B1", "B2", "B3", "B4", "B5",
            "B6", "B7", "B8", "B9", "B10"
        ],

        C: [
            "C1", "C2", "C3", "C4", "C5",
            "C6", "C7", "C8", "C9", "C10"
        ],

        D: [
            "D1", "D2", "D3", "D4", "D5",
            "D6", "D7", "D8", "D9", "D10"
        ],

        E: [
            "E1", "E2", "E3", "E4", "E5",
            "E6", "E7", "E8", "E9", "E10"
        ],

        F: [
            "F1", "F2", "F3", "F4", "F5",
            "F6", "F7", "F8", "F9", "F10"
        ],

        G: [
            "G1", "G2", "G3", "G4", "G5",
            "G6", "G7", "G8", "G9", "G10"
        ]

    };


    // ==================================================
    // PRICE PER SEAT
    // ==================================================

    // IMPORTANT:
    // Theatres.jsx sends price as pricePerSeat.
    // Therefore SeatBooking must read pricePerSeat.

    const pricePerSeat =
        Number(
            bookingInfo?.pricePerSeat ||
            0
        );


    // ==================================================
    // FETCH BOOKED SEATS
    // ==================================================

    useEffect(() => {

        const fetchBookedSeats = async () => {

            // ------------------------------------------
            // CHECK REQUIRED INFORMATION
            // ------------------------------------------

            if (
                !bookingInfo?.movie?.id ||
                !bookingInfo?.date ||
                !bookingInfo?.time ||
                !bookingInfo?.theatre
            ) {

                setBookedSeats([]);

                setLoadingSeats(false);

                return;

            }


            try {

                setLoadingSeats(true);

                setSeatError("");


                // --------------------------------------
                // GET VALUES
                // --------------------------------------

                const movieId =
                    bookingInfo.movie.id;

                const date =
                    bookingInfo.date;

                const time =
                    bookingInfo.time;

                const theatre =
                    bookingInfo.theatre;


                // --------------------------------------
                // API URL
                // --------------------------------------

                const url =
                    `http://40.192.61.165:8000/bookings/booked-seats/${movieId}/${encodeURIComponent(date)}/${encodeURIComponent(time)}/${encodeURIComponent(theatre)}`;


                console.log(
                    "BOOKED SEATS URL:",
                    url
                );


                // --------------------------------------
                // FETCH
                // --------------------------------------

                const response =
                    await fetch(url);


                if (!response.ok) {

                    throw new Error(
                        "Unable to fetch booked seats"
                    );

                }


                const data =
                    await response.json();


                console.log(
                    "BOOKED SEATS RESPONSE:",
                    data
                );


                // --------------------------------------
                // STORE BOOKED SEATS
                // --------------------------------------

                if (
                    data &&
                    Array.isArray(
                        data.booked_seats
                    )
                ) {

                    const seats =
                        data.booked_seats.map(
                            (seat) =>
                                String(seat)
                        );


                    setBookedSeats(
                        seats
                    );

                }

                else {

                    setBookedSeats([]);

                }

            }

            catch (error) {

                console.error(
                    "Booked Seats Error:",
                    error
                );


                setSeatError(
                    "Unable to load booked seats."
                );


                setBookedSeats([]);

            }

            finally {

                setLoadingSeats(false);

            }

        };


        fetchBookedSeats();

    }, [

        bookingInfo?.movie?.id,

        bookingInfo?.date,

        bookingInfo?.time,

        bookingInfo?.theatre

    ]);


    // ==================================================
    // NO BOOKING INFORMATION
    // ==================================================

    if (!bookingInfo || !movie) {

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
                        No Movie Data Found
                    </h2>


                    <p>
                        Please select a movie and
                        theatre before selecting seats.
                    </p>


                    <button
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
    // SELECT / UNSELECT SEAT
    // ==================================================

    const selectSeat = (seat) => {

        // ------------------------------------------
        // DO NOT ALLOW BOOKED SEATS
        // ------------------------------------------

        if (
            bookedSeats.includes(seat)
        ) {

            return;

        }


        // ------------------------------------------
        // REMOVE SELECTED SEAT
        // ------------------------------------------

        if (
            selectedSeats.includes(seat)
        ) {

            setSelectedSeats(
                (previousSeats) =>

                    previousSeats.filter(
                        (item) =>
                            item !== seat
                    )
            );

        }

        // ------------------------------------------
        // ADD SELECTED SEAT
        // ------------------------------------------

        else {

            setSelectedSeats(
                (previousSeats) => [

                    ...previousSeats,

                    seat

                ]
            );

        }

    };


    // ==================================================
    // TOTAL PRICE
    // ==================================================

    const totalPrice =
        selectedSeats.length *
        pricePerSeat;


    // ==================================================
    // CONTINUE BOOKING
    // ==================================================

    const continueBooking = () => {

        // ------------------------------------------
        // CHECK SEATS
        // ------------------------------------------

        if (
            selectedSeats.length === 0
        ) {

            alert(
                "Please select at least one seat"
            );

            return;

        }


        // ------------------------------------------
        // CHECK PRICE
        // ------------------------------------------

        if (
            pricePerSeat <= 0
        ) {

            alert(
                "Ticket price is not available for this show."
            );

            return;

        }


        // ------------------------------------------
        // GET LOGGED-IN USER
        // ------------------------------------------

        const storedUser =
            localStorage.getItem("user");


        if (!storedUser) {

            alert(
                "Please login before booking"
            );


            navigate(
                "/login",
                {
                    state: {
                        from: "/seats"
                    }
                }
            );


            return;

        }


        // ------------------------------------------
        // PARSE USER
        // ------------------------------------------

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


            navigate("/login");


            return;

        }


        // ------------------------------------------
        // VALIDATE USER ID
        // ------------------------------------------

        if (!user?.id) {

            alert(
                "User information not found. Please login again."
            );


            localStorage.removeItem(
                "user"
            );


            navigate("/login");


            return;

        }


        // ------------------------------------------
        // BOOKING DATA
        // ------------------------------------------

        const bookingData = {

            // --------------------------------------
            // Movie
            // --------------------------------------

            movie: {

                id:
                    movie.id,

                movie: 
                    movie.title,

                image:
                    movie.image,

                rating:
                    movie.rating

            },


            // --------------------------------------
            // Backend movie information
            // --------------------------------------

            movie_id:
                movie.id,

            movie_title:
                movie.title,


            // --------------------------------------
            // User
            // --------------------------------------

            user_id:
                user.id,


            // --------------------------------------
            // Movie image
            // --------------------------------------

            image:
                movie.image || "",


            // --------------------------------------
            // Location
            // --------------------------------------

            city:
                bookingInfo.city,


            // --------------------------------------
            // Theatre
            // --------------------------------------

            theatre:
                bookingInfo.theatre,

            theatreId:
                bookingInfo.theatreId,


            // --------------------------------------
            // Date and time
            // --------------------------------------

            date:
                bookingInfo.date,

            time:
                bookingInfo.time,


            // --------------------------------------
            // Show timing
            // --------------------------------------

            showTimingId:
                bookingInfo.showTimingId,


            // --------------------------------------
            // Seats
            // --------------------------------------

            seats:
                selectedSeats,


            // --------------------------------------
            // PRICE PER SEAT
            // --------------------------------------

            pricePerSeat:
                pricePerSeat,


            // --------------------------------------
            // TOTAL PRICE
            // --------------------------------------

            price:
                totalPrice

        };


        console.log(
            "PRICE PER SEAT:",
            pricePerSeat
        );


        console.log(
            "NUMBER OF SEATS:",
            selectedSeats.length
        );


        console.log(
            "TOTAL PRICE:",
            totalPrice
        );


        console.log(
            "FINAL BOOKING DATA:",
            bookingData
        );


        // ------------------------------------------
        // GO TO SUMMARY
        // ------------------------------------------

        navigate(
            "/summary",
            {
                state:
                    bookingData
            }
        );

    };


    // ==================================================
    // JSX
    // ==================================================

    return (

        <>

            <Navbar />


            <div className="seat-page">


                {/* ==================================
                    MOVIE
                ================================== */}

                <h1>

                    🎬 {movie.title}

                </h1>


                {/* ==================================
                    BOOKING INFORMATION
                ================================== */}

                <div className="booking-info">


                    <p>

                        📍{" "}

                        <strong>
                            City:
                        </strong>{" "}

                        {bookingInfo.city ||
                            "N/A"}

                    </p>


                    <p>

                        🏢{" "}

                        <strong>
                            Theatre:
                        </strong>{" "}

                        {bookingInfo.theatre ||
                            "N/A"}

                    </p>


                    <p>

                        📅{" "}

                        <strong>
                            Date:
                        </strong>{" "}

                        {bookingInfo.date ||
                            "N/A"}

                    </p>


                    <p>

                        ⏰{" "}

                        <strong>
                            Time:
                        </strong>{" "}

                        {bookingInfo.time ||
                            "N/A"}

                    </p>


                    <p>

                        💰{" "}

                        <strong>
                            Price per Seat:
                        </strong>{" "}

                        ₹{pricePerSeat}

                    </p>


                </div>


                {/* ==================================
                    SELECT SEATS
                ================================== */}

                <h2>

                    💺 Select Your Seats

                </h2>


                {/* ==================================
                    ERROR
                ================================== */}

                {seatError && (

                    <p
                        style={{
                            color: "red",
                            textAlign: "center"
                        }}
                    >

                        ⚠️ {seatError}

                    </p>

                )}


                {/* ==================================
                    LOADING
                ================================== */}

                {loadingSeats ? (

                    <div className="seat-loading">

                        <h3>

                            Loading booked seats...

                        </h3>


                        <p>

                            Please wait...

                        </p>

                    </div>

                ) : (

                    <>


                        {/* ==================================
                            SCREEN
                        ================================== */}

                        <div className="screen">

                            SCREEN

                        </div>


                        {/* ==================================
                            SEAT LAYOUT
                        ================================== */}

                        <div className="seat-layout">


                            {Object.entries(
                                seatRows
                            ).map(
                                ([row, seats]) => (

                                    <div
                                        className="seat-row"
                                        key={row}
                                    >


                                        <span className="row-name">

                                            {row}

                                        </span>


                                        {seats.map(
                                            (seat) => {

                                                const isBooked =
                                                    bookedSeats.includes(
                                                        seat
                                                    );


                                                const isSelected =
                                                    selectedSeats.includes(
                                                        seat
                                                    );


                                                return (

                                                    <button

                                                        key={seat}

                                                        type="button"

                                                        disabled={
                                                            isBooked
                                                        }

                                                        className={

                                                            isBooked

                                                                ? "seat booked"

                                                                : isSelected

                                                                    ? "seat selected"

                                                                    : "seat"

                                                        }

                                                        onClick={() =>
                                                            selectSeat(
                                                                seat
                                                            )
                                                        }

                                                    >

                                                        {seat}

                                                    </button>

                                                );

                                            }
                                        )}

                                    </div>

                                )
                            )}

                        </div>


                        {/* ==================================
                            LEGEND
                        ================================== */}

                        <div className="legend">


                            <span>
                                🟩 Available
                            </span>


                            <span>
                                🟧 Selected
                            </span>


                            <span>
                                🟥 Booked
                            </span>


                        </div>


                        {/* ==================================
                            SELECTED SEATS
                        ================================== */}

                        <div className="selected-seat-info">


                            <h3>

                                💺 Selected Seats

                            </h3>


                            <p>

                                {selectedSeats.length > 0

                                    ? selectedSeats.join(", ")

                                    : "None"}

                            </p>


                        </div>


                        {/* ==================================
                            TICKETS
                        ================================== */}

                        <h2>

                            🎟 Tickets:{" "}

                            {selectedSeats.length}

                        </h2>


                        {/* ==================================
                            PRICE
                        ================================== */}

                        <h2>

                            💰 Total Amount: ₹
                            {totalPrice}

                        </h2>


                        {/* ==================================
                            CONTINUE
                        ================================== */}

                        <button

                            type="button"

                            className="continue-btn"

                            onClick={
                                continueBooking
                            }

                        >

                            Continue Booking →

                        </button>


                    </>

                )}


            </div>


            <Footer />

        </>

    );

}


export default SeatBooking;