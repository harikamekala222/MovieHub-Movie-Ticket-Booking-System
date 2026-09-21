import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import { getMovieImage } from "../utils/movieImages";

import bookingBackground from "../background/booking-bg.jpg";

import "../styles/MyBookings.css";


function MyBookings() {

    const [bookings, setBookings] = useState([]);

    const [loading, setLoading] = useState(true);


    // ==================================================
    // FETCH USER BOOKINGS
    // ==================================================

    useEffect(() => {

        const fetchBookings = async () => {

            const storedUser =
                localStorage.getItem("user");


            if (!storedUser) {

                setLoading(false);

                return;
            }


            try {

                const user =
                    JSON.parse(storedUser);


                const response =
                    await fetch(
                        `http://40.192.61.165:8000/bookings/user/${user.id}`
                    );


                if (!response.ok) {

                    throw new Error(
                        "Failed to fetch bookings"
                    );

                }


                const data =
                    await response.json();


                console.log(
                    "MY BOOKINGS:",
                    data
                );


                setBookings(
                    Array.isArray(data)
                        ? data
                        : []
                );

            }

            catch (error) {

                console.error(
                    "Booking Error:",
                    error
                );


                setBookings([]);

            }

            finally {

                setLoading(false);

            }

        };


        fetchBookings();

    }, []);


    // ==================================================
    // GET BOOKING DATE AND TIME
    // ==================================================

    const getBookingDateTime = (booking) => {

        if (!booking.date) {

            return null;

        }


        try {

            const datePart =
                booking.date;


            let timePart =
                booking.time ||
                "00:00";


            // ------------------------------------------
            // PM
            // ------------------------------------------

            if (
                typeof timePart === "string" &&
                timePart.toUpperCase().includes("PM")
            ) {

                const parts =
                    timePart
                        .replace(/PM/i, "")
                        .trim()
                        .split(":");


                let hour =
                    parseInt(
                        parts[0],
                        10
                    );


                const minute =
                    parts[1] ||
                    "00";


                if (hour !== 12) {

                    hour += 12;

                }


                timePart =
                    `${hour
                        .toString()
                        .padStart(2, "0")}:${minute}`;

            }


            // ------------------------------------------
            // AM
            // ------------------------------------------

            else if (
                typeof timePart === "string" &&
                timePart.toUpperCase().includes("AM")
            ) {

                const parts =
                    timePart
                        .replace(/AM/i, "")
                        .trim()
                        .split(":");


                let hour =
                    parseInt(
                        parts[0],
                        10
                    );


                const minute =
                    parts[1] ||
                    "00";


                if (hour === 12) {

                    hour = 0;

                }


                timePart =
                    `${hour
                        .toString()
                        .padStart(2, "0")}:${minute}`;

            }


            const result =
                new Date(
                    `${datePart}T${timePart}`
                );


            if (
                isNaN(
                    result.getTime()
                )
            ) {

                return null;

            }


            return result;

        }

        catch (error) {

            console.error(
                "Date Error:",
                error
            );


            return null;

        }

    };


    // ==================================================
    // CURRENT DATE
    // ==================================================

    const now =
        new Date();


    // ==================================================
    // UPCOMING BOOKINGS
    // ==================================================

    const upcomingBookings =
        bookings.filter(
            (booking) => {

                if (
                    booking.status &&
                    booking.status.toLowerCase() ===
                    "cancelled"
                ) {

                    return false;

                }


                const bookingDateTime =
                    getBookingDateTime(
                        booking
                    );


                if (!bookingDateTime) {

                    return true;

                }


                return (
                    bookingDateTime >= now
                );

            }
        );


    // ==================================================
    // COMPLETED BOOKINGS
    // ==================================================

    const completedBookings =
        bookings.filter(
            (booking) => {

                if (
                    booking.status &&
                    booking.status.toLowerCase() ===
                    "cancelled"
                ) {

                    return false;

                }


                const bookingDateTime =
                    getBookingDateTime(
                        booking
                    );


                if (!bookingDateTime) {

                    return false;

                }


                return (
                    bookingDateTime < now
                );

            }
        );


    // ==================================================
    // CANCEL BOOKING
    // ==================================================

    const cancelBooking =
        async (booking) => {

            const bookingId =
                booking.booking_id;


            if (!bookingId) {

                alert(
                    "Booking ID not found"
                );

                return;

            }


            // ------------------------------------------
            // FRONTEND SAFETY CHECK
            // ------------------------------------------

            if (
                booking.refund_policy &&
                booking.refund_policy.toLowerCase() ===
                "non_refundable"
            ) {

                alert(
                    "This booking is non-refundable and cannot be cancelled."
                );

                return;

            }


            const confirmCancel =
                window.confirm(
                    "Are you sure you want to cancel this booking?"
                );


            if (!confirmCancel) {

                return;

            }


            try {

                console.log(
                    "CANCELLING BOOKING:",
                    bookingId
                );


                const response =
                    await fetch(
                        `http://40.192.61.165:8000/bookings/cancel/${encodeURIComponent(
                            bookingId
                        )}`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            }
                        }
                    );


                let data = {};


                try {

                    data =
                        await response.json();

                }

                catch (error) {

                    console.log(
                        "No JSON response:",
                        error
                    );

                }


                console.log(
                    "CANCEL BOOKING RESPONSE:",
                    data
                );


                if (response.ok) {

                    alert(
                        data.message ||
                        "Booking cancelled successfully"
                    );


                    setBookings(
                        (previousBookings) => {

                            return previousBookings.map(
                                (item) => {

                                    if (
                                        item.booking_id ===
                                        bookingId
                                    ) {

                                        return {
                                            ...item,
                                            status:
                                                "cancelled"
                                        };

                                    }


                                    return item;

                                }
                            );

                        }
                    );

                }

                else {

                    console.error(
                        "Cancel failed:",
                        data
                    );


                    alert(
                        data.detail ||
                        "Unable to cancel booking"
                    );

                }

            }

            catch (error) {

                console.error(
                    "Cancel Booking Error:",
                    error
                );


                alert(
                    "Unable to connect to backend. Please check whether FastAPI is running."
                );

            }

        };


    // ==================================================
    // BOOKING CARD
    // ==================================================

    const BookingCard =
        ({
            booking,
            upcoming
        }) => {


            const movieImage =
                getMovieImage(
                    booking.image
                );


            // ------------------------------------------
            // SEATS
            // ------------------------------------------

            const seats =
                Array.isArray(
                    booking.seats
                )
                    ? booking.seats.map(
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


                            return seat;

                        }
                    )
                    : [];


            // ------------------------------------------
            // BOOKING ID
            // ------------------------------------------

            const bookingId =
                booking.booking_id ||
                booking.bookingId ||
                booking.id ||
                "N/A";


            // ------------------------------------------
            // REFUND POLICY
            // ------------------------------------------

            const refundPolicy =
                (
                    booking.refund_policy ||
                    "refundable"
                ).toLowerCase();


            const isRefundable =
                refundPolicy ===
                "refundable";


            return (

                <div className="booking-card">

                    {/* =================================
                        POSTER
                    ================================= */}

                    <div className="booking-poster-wrapper">

                        {movieImage ? (

                            <img
                                src={movieImage}
                                alt={
                                    booking.movie ||
                                    "Movie"
                                }
                                className="booking-image"
                            />

                        ) : (

                            <div className="no-movie-image">

                                🎬

                                <span>
                                    No Image
                                </span>

                            </div>

                        )}

                    </div>


                    {/* =================================
                        CONTENT
                    ================================= */}

                    <div className="booking-content">

                        {/* =================================
                            HEADING
                        ================================= */}

                        <div className="booking-heading">

                            <div>

                                <h2>

                                    🎬{" "}

                                    {
                                        booking.movie ||
                                        "Movie"
                                    }

                                </h2>


                                <span
                                    className={
                                        upcoming
                                            ? "booking-status upcoming"
                                            : "booking-status completed"
                                    }
                                >

                                    {upcoming
                                        ? "🎟 Upcoming"
                                        : "✓ Completed"}

                                </span>

                            </div>

                        </div>


                        {/* =================================
                            DETAILS
                        ================================= */}

                        <div className="booking-details">

                            <div className="detail-item">

                                <span className="detail-label">
                                    🎟 Booking ID
                                </span>

                                <strong>
                                    {bookingId}
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span className="detail-label">
                                    🏙 City
                                </span>

                                <strong>
                                    {booking.city ||
                                        "N/A"}
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span className="detail-label">
                                    🏢 Theatre
                                </span>

                                <strong>
                                    {booking.theatre ||
                                        "N/A"}
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span className="detail-label">
                                    📅 Date
                                </span>

                                <strong>
                                    {booking.date ||
                                        "N/A"}
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span className="detail-label">
                                    ⏰ Time
                                </span>

                                <strong>
                                    {booking.time ||
                                        "N/A"}
                                </strong>

                            </div>


                            <div className="detail-item">

                                <span className="detail-label">
                                    💺 Seats
                                </span>

                                <strong>

                                    {seats.length > 0
                                        ? seats.join(", ")
                                        : "N/A"}

                                </strong>

                            </div>


                            <div className="detail-item">

                                <span className="detail-label">
                                    💰 Refund Policy
                                </span>

                                <strong>

                                    {isRefundable
                                        ? "Refundable"
                                        : "Non-Refundable"}

                                </strong>

                            </div>

                        </div>


                        {/* =================================
                            BOTTOM
                        ================================= */}

                        <div className="booking-bottom">

                            <div className="total-box">

                                <span>
                                    Total Amount
                                </span>

                                <strong>
                                    ₹{booking.price || 0}
                                </strong>

                            </div>


                            <div className="booking-confirmed">

                                {upcoming
                                    ? "Booking Confirmed ✓"
                                    : "Movie Completed ✓"}

                            </div>

                        </div>


                        {/* =================================
                            CANCEL BUTTON
                        ================================= */}

                        {upcoming &&
                            isRefundable && (

                                <button
                                    type="button"
                                    className="cancel-booking-btn"
                                    onClick={() =>
                                        cancelBooking(
                                            booking
                                        )
                                    }
                                >

                                    ❌ Cancel Booking

                                </button>

                            )}


                        {/* =================================
                            NON-REFUNDABLE MESSAGE
                        ================================= */}

                        {upcoming &&
                            !isRefundable && (

                                <div className="non-refundable-message">

                                    🚫 This booking is
                                    non-refundable and
                                    cannot be cancelled.

                                </div>

                            )}

                    </div>

                </div>

            );

        };


    // ==================================================
    // LOADING
    // ==================================================

    if (loading) {

        return (

            <>
                <Navbar />

                <div
                    className="my-bookings-page"
                    style={{
                        backgroundImage: `url(${bookingBackground})`
                    }}
                >

                    <div className="loading-box">

                        <div className="loading-spinner"></div>

                        <h2>
                            Loading your bookings...
                        </h2>

                    </div>

                </div>

                <Footer />
            </>

        );

    }


    // ==================================================
    // CHECK USER
    // ==================================================

    const storedUser =
        localStorage.getItem("user");


    let user = null;


    if (storedUser) {

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

        }

    }


    // ==================================================
    // NO USER
    // ==================================================

    if (!user) {

        return (

            <>
                <Navbar />

                <div
                    className="my-bookings-page"
                    style={{
                        backgroundImage: `url(${bookingBackground})`
                    }}
                >

                    <div className="empty-bookings">

                        <div className="empty-icon">
                            🔐
                        </div>

                        <h2>
                            Please Login First
                        </h2>

                        <p>
                            Login to view your movie
                            bookings.
                        </p>

                    </div>

                </div>

                <Footer />
            </>

        );

    }


    // ==================================================
    // MAIN PAGE
    // ==================================================

    return (

        <>

            <Navbar />

            <div
                className="my-bookings-page"
                style={{
                    backgroundImage: `url(${bookingBackground})`
                }}
            >

                {/* =================================
                    HEADER
                ================================= */}

                <div className="my-bookings-header">

                    <div className="header-icon">
                        🎟️
                    </div>

                    <h1>
                        My Bookings
                    </h1>

                    <p>
                        Manage and view all your
                        MovieHub bookings
                    </p>

                </div>


                {/* =================================
                    UPCOMING
                ================================= */}

                <section className="booking-section">

                    <div className="section-title">

                        <div>

                            <h2>
                                🎬 Upcoming Movies
                            </h2>

                            <p>
                                Your upcoming movie
                                shows
                            </p>

                        </div>


                        <span className="count-badge">

                            {
                                upcomingBookings.length
                            }

                        </span>

                    </div>


                    {upcomingBookings.length === 0 ? (

                        <div className="empty-section">

                            <div>
                                🎟️
                            </div>

                            <h3>
                                No Upcoming Movies
                            </h3>

                            <p>
                                You don't have any
                                upcoming movie
                                bookings.
                            </p>

                        </div>

                    ) : (

                        <div className="booking-list">

                            {upcomingBookings.map(
                                (booking, index) => (

                                    <BookingCard
                                        key={
                                            booking.booking_id ||
                                            booking.id ||
                                            index
                                        }
                                        booking={
                                            booking
                                        }
                                        upcoming={
                                            true
                                        }
                                    />

                                )
                            )}

                        </div>

                    )}

                </section>


                {/* =================================
                    COMPLETED
                ================================= */}

                <section className="booking-section completed-section">

                    <div className="section-title">

                        <div>

                            <h2>
                                🎥 Completed Movies
                            </h2>

                            <p>
                                Your previously watched
                                movies
                            </p>

                        </div>


                        <span className="count-badge completed-count">

                            {
                                completedBookings.length
                            }

                        </span>

                    </div>


                    {completedBookings.length === 0 ? (

                        <div className="empty-section">

                            <div>
                                🎬
                            </div>

                            <h3>
                                No Completed Movies
                            </h3>

                            <p>
                                Your completed movie
                                bookings will appear
                                here.
                            </p>

                        </div>

                    ) : (

                        <div className="booking-list">

                            {completedBookings.map(
                                (booking, index) => (

                                    <BookingCard
                                        key={
                                            booking.booking_id ||
                                            booking.id ||
                                            index
                                        }
                                        booking={
                                            booking
                                        }
                                        upcoming={
                                            false
                                        }
                                    />

                                )
                            )}

                        </div>

                    )}

                </section>

            </div>

            <Footer />

        </>

    );

}


export default MyBookings;