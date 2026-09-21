import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { jsPDF } from "jspdf";
import QRCode from "qrcode";

import { getMovieImage } from "../utils/movieImages";

import "../styles/Profile.css";


function Profile() {

    const navigate = useNavigate();


    // ==================================================
    // USER
    // ==================================================

    const storedUser =
        localStorage.getItem("user");


    let user = null;


    try {

        user = storedUser
            ? JSON.parse(storedUser)
            : null;

    }

    catch (error) {

        console.error(
            "Invalid user data:",
            error
        );

        localStorage.removeItem("user");

    }


    // ==================================================
    // STATE
    // ==================================================

    const [bookings, setBookings] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");


    // ==================================================
    // FETCH BOOKINGS FROM BACKEND
    // ==================================================

    useEffect(() => {

        const fetchBookings = async () => {

            if (!user?.id) {

                setLoading(false);

                return;

            }


            try {

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
                    "PROFILE BOOKINGS:",
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
                    "Profile Booking Error:",
                    error
                );


                setBookings([]);

            }

            finally {

                setLoading(false);

            }

        };


        fetchBookings();

    }, [user?.id]);


    // ==================================================
    // DATE HELPERS
    // ==================================================

    const getBookingDate =
        (dateValue) => {

            if (!dateValue) {

                return null;

            }


            const dateString =
                String(dateValue).trim();


            // ------------------------------------------------
            // YYYY-MM-DD
            // ------------------------------------------------

            if (
                /^\d{4}-\d{2}-\d{2}$/.test(
                    dateString
                )
            ) {

                return dateString;

            }


            // ------------------------------------------------
            // DD-MM-YYYY
            // ------------------------------------------------

            if (
                /^\d{2}-\d{2}-\d{4}$/.test(
                    dateString
                )
            ) {

                const [
                    day,
                    month,
                    year
                ] =
                    dateString.split("-");


                return (
                    `${year}-${month}-${day}`
                );

            }


            // ------------------------------------------------
            // DD/MM/YYYY
            // ------------------------------------------------

            if (
                /^\d{2}\/\d{2}\/\d{4}$/.test(
                    dateString
                )
            ) {

                const [
                    day,
                    month,
                    year
                ] =
                    dateString.split("/");


                return (
                    `${year}-${month}-${day}`
                );

            }


            // ------------------------------------------------
            // Normal JavaScript date
            // ------------------------------------------------

            const parsedDate =
                new Date(dateString);


            if (
                !Number.isNaN(
                    parsedDate.getTime()
                )
            ) {

                const year =
                    parsedDate.getFullYear();


                const month =
                    String(
                        parsedDate.getMonth() + 1
                    ).padStart(2, "0");


                const day =
                    String(
                        parsedDate.getDate()
                    ).padStart(2, "0");


                return (
                    `${year}-${month}-${day}`
                );

            }


            return null;

        };


    // ==================================================
    // TODAY
    // ==================================================

    const getToday = () => {

        const today =
            new Date();


        const year =
            today.getFullYear();


        const month =
            String(
                today.getMonth() + 1
            ).padStart(2, "0");


        const day =
            String(
                today.getDate()
            ).padStart(2, "0");


        return (
            `${year}-${month}-${day}`
        );

    };


    // ==================================================
    // GET BOOKING DATE + TIME
    // ==================================================

    const getBookingDateTime =
        (booking) => {

            if (!booking.date) {

                return null;

            }


            const datePart =
                getBookingDate(
                    booking.date
                );


            if (!datePart) {

                return null;

            }


            let timePart =
                booking.time ||
                "00:00";


            timePart =
                String(timePart)
                    .trim();


            // ------------------------------------------------
            // PM
            // ------------------------------------------------

            if (
                timePart
                    .toUpperCase()
                    .includes("PM")
            ) {

                const parts =
                    timePart
                        .replace(
                            /PM/i,
                            ""
                        )
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


            // ------------------------------------------------
            // AM
            // ------------------------------------------------

            else if (
                timePart
                    .toUpperCase()
                    .includes("AM")
            ) {

                const parts =
                    timePart
                        .replace(
                            /AM/i,
                            ""
                        )
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
                Number.isNaN(
                    result.getTime()
                )
            ) {

                return null;

            }


            return result;

        };


    // ==================================================
    // CHECK COMPLETED
    // ==================================================

    const isCompleted =
        (booking) => {

            const bookingDateTime =
                getBookingDateTime(
                    booking
                );


            if (!bookingDateTime) {

                return false;

            }


            return (
                bookingDateTime <
                new Date()
            );

        };


    // ==================================================
    // SEARCH BOOKINGS
    // ==================================================

    const searchedBookings =
        bookings.filter(
            (booking) => {

                const movieName =
                    typeof booking.movie ===
                    "object"

                        ? booking.movie?.title

                        : booking.movie;


                const bookingId =
                    String(
                        booking.booking_id ||
                        booking.bookingId ||
                        booking.id ||
                        ""
                    );


                const searchText =
                    search
                        .toLowerCase()
                        .trim();


                if (!searchText) {

                    return true;

                }


                return (

                    movieName
                        ?.toLowerCase()
                        .includes(searchText)

                    ||

                    booking.city
                        ?.toLowerCase()
                        .includes(searchText)

                    ||

                    booking.theatre
                        ?.toLowerCase()
                        .includes(searchText)

                    ||

                    bookingId
                        .toLowerCase()
                        .includes(searchText)

                );

            }
        );


    // ==================================================
    // UPCOMING BOOKINGS
    // ==================================================

    const upcomingBookings =
        searchedBookings
            .filter(
                (booking) => {

                    // Do not show cancelled bookings

                    if (
                        booking.status
                            ?.toLowerCase() ===
                        "cancelled"
                    ) {

                        return false;

                    }


                    return !isCompleted(
                        booking
                    );

                }
            )
            .sort(
                (a, b) => {

                    const dateA =
                        getBookingDateTime(
                            a
                        ) ||
                        new Date(
                            "9999-12-31"
                        );


                    const dateB =
                        getBookingDateTime(
                            b
                        ) ||
                        new Date(
                            "9999-12-31"
                        );


                    return (
                        dateA - dateB
                    );

                }
            );


    // ==================================================
    // COMPLETED BOOKINGS
    // ==================================================

    const completedBookings =
        searchedBookings
            .filter(
                (booking) => {

                    // Do not show cancelled bookings

                    if (
                        booking.status
                            ?.toLowerCase() ===
                        "cancelled"
                    ) {

                        return false;

                    }


                    return isCompleted(
                        booking
                    );

                }
            )
            .sort(
                (a, b) => {

                    const dateA =
                        getBookingDateTime(
                            a
                        ) ||
                        new Date(
                            "0000-01-01"
                        );


                    const dateB =
                        getBookingDateTime(
                            b
                        ) ||
                        new Date(
                            "0000-01-01"
                        );


                    return (
                        dateB - dateA
                    );

                }
            );


    // ==================================================
    // LOGOUT
    // ==================================================

    const logout = () => {

        localStorage.removeItem(
            "user"
        );


        navigate(
            "/login"
        );

    };


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
                        "No JSON response"
                    );

                }


                console.log(
                    "PROFILE CANCEL RESPONSE:",
                    data
                );


                // ------------------------------------------------
                // SUCCESS
                // ------------------------------------------------

                if (response.ok) {

                    alert(
                        data.message ||
                        "Booking cancelled successfully"
                    );


                    setBookings(
                        (previousBookings) =>

                            previousBookings.map(
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
                            )

                    );

                }


                // ------------------------------------------------
                // FAILED
                // ------------------------------------------------

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
    // IMAGE -> BASE64
    // ==================================================

    const getImageBase64 =
        async (url) => {

            if (!url) {

                return null;

            }


            try {

                const response =
                    await fetch(url);


                if (!response.ok) {

                    throw new Error(
                        "Unable to load image"
                    );

                }


                const blob =
                    await response.blob();


                return new Promise(
                    (resolve) => {

                        const reader =
                            new FileReader();


                        reader.onloadend =
                            () => {

                                resolve(
                                    reader.result
                                );

                            };


                        reader.onerror =
                            () => {

                                resolve(
                                    null
                                );

                            };


                        reader.readAsDataURL(
                            blob
                        );

                    }
                );

            }

            catch (error) {

                console.error(
                    "Image Error:",
                    error
                );


                return null;

            }

        };


    // ==================================================
    // DOWNLOAD TICKET
    // ==================================================

    const downloadTicket =
        async (booking) => {

            try {

                const pdf =
                    new jsPDF();


                // ------------------------------------------
                // Movie name
                // ------------------------------------------

                const movieName =
                    typeof booking.movie ===
                    "object"

                        ? booking.movie?.title

                        : booking.movie;


                // ------------------------------------------
                // Booking ID
                // ------------------------------------------

                const bookingId =
                    booking.booking_id ||
                    booking.bookingId ||
                    booking.id ||
                    "N/A";


                // ------------------------------------------
                // Movie filename
                // ------------------------------------------

                const movieFile =
                    typeof booking.movie ===
                    "object"

                        ? booking.movie?.image

                        : booking.image;


                // ------------------------------------------
                // Movie image
                // IMPORTANT:
                // Convert filename to actual image URL
                // ------------------------------------------

                const movieImage =
                    getMovieImage(
                        movieFile
                    );


                let movieImageBase64 =
                    null;


                if (movieImage) {

                    movieImageBase64 =
                        await getImageBase64(
                            movieImage
                        );

                }


                // ------------------------------------------
                // Seats
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
                // QR
                // ------------------------------------------

                const qrText = `

MovieHub Ticket

Booking ID : ${bookingId}

Movie : ${movieName}

City : ${booking.city}

Theatre : ${booking.theatre}

Date : ${booking.date}

Time : ${booking.time}

Seats : ${seats.join(", ")}

Amount : Rs.${booking.price}

Status : ${booking.status}

`;


                const qrImage =
                    await QRCode.toDataURL(
                        qrText
                    );


                // ------------------------------------------
                // Background
                // ------------------------------------------

                pdf.setFillColor(
                    15,
                    23,
                    42
                );


                pdf.rect(
                    0,
                    0,
                    210,
                    297,
                    "F"
                );


                // ------------------------------------------
                // Header
                // ------------------------------------------

                pdf.setFillColor(
                    229,
                    9,
                    20
                );


                pdf.roundedRect(
                    15,
                    15,
                    180,
                    35,
                    8,
                    8,
                    "F"
                );


                pdf.setTextColor(
                    255,
                    255,
                    255
                );


                pdf.setFontSize(
                    25
                );


                pdf.text(
                    "MovieHub",
                    72,
                    38
                );


                // ------------------------------------------
                // Ticket card
                // ------------------------------------------

                pdf.setFillColor(
                    255,
                    255,
                    255
                );


                pdf.roundedRect(
                    15,
                    65,
                    180,
                    170,
                    10,
                    10,
                    "F"
                );


                // ------------------------------------------
                // Title
                // ------------------------------------------

                pdf.setTextColor(
                    229,
                    9,
                    20
                );


                pdf.setFontSize(
                    20
                );


                pdf.text(
                    "MOVIE TICKET",
                    65,
                    90
                );


                pdf.line(
                    30,
                    95,
                    180,
                    95
                );


                // ------------------------------------------
                // Movie poster
                // ------------------------------------------

                if (movieImageBase64) {

                    try {

                        pdf.addImage(
                            movieImageBase64,
                            "JPEG",
                            25,
                            110,
                            45,
                            65
                        );

                    }

                    catch (error) {

                        console.error(
                            "PDF Image Error:",
                            error
                        );

                    }

                }


                // ------------------------------------------
                // QR
                // ------------------------------------------

                pdf.addImage(
                    qrImage,
                    "PNG",
                    150,
                    115,
                    35,
                    35
                );


                // ------------------------------------------
                // Details
                // ------------------------------------------

                pdf.setTextColor(
                    40,
                    40,
                    40
                );


                pdf.setFontSize(
                    12
                );


                const details = [

                    `Booking ID : ${bookingId}`,

                    `Movie : ${movieName}`,

                    `City : ${booking.city}`,

                    `Theatre : ${booking.theatre}`,

                    `Date : ${booking.date}`,

                    `Time : ${booking.time}`,

                    `Seats : ${seats.join(", ")}`,

                    `Amount : Rs.${booking.price}`

                ];


                let y = 112;


                details.forEach(
                    (item) => {

                        pdf.text(
                            item,
                            80,
                            y
                        );


                        y += 12;

                    }
                );


                // ------------------------------------------
                // Paid section
                // ------------------------------------------

                pdf.setFillColor(
                    229,
                    9,
                    20
                );


                pdf.roundedRect(
                    35,
                    205,
                    140,
                    25,
                    5,
                    5,
                    "F"
                );


                pdf.setTextColor(
                    255,
                    255,
                    255
                );


                pdf.setFontSize(
                    16
                );


                pdf.text(
                    `Paid : Rs.${booking.price}`,
                    65,
                    221
                );


                // ------------------------------------------
                // Footer
                // ------------------------------------------

                pdf.setFontSize(
                    12
                );


                pdf.text(
                    "Thank you for booking with MovieHub",
                    43,
                    260
                );


                pdf.text(
                    "Enjoy your movie",
                    75,
                    275
                );


                // ------------------------------------------
                // Save
                // ------------------------------------------

                pdf.save(
                    `MovieHub_Ticket_${bookingId}.pdf`
                );

            }

            catch (error) {

                console.error(
                    "Download Ticket Error:",
                    error
                );


                alert(
                    "Unable to download ticket"
                );

            }

        };


    // ==================================================
    // BOOKING CARD
    // ==================================================

    const renderBookingCard =
        (
            booking,
            index,
            completed
        ) => {

            // ------------------------------------------
            // Movie name
            // ------------------------------------------

            const movieName =
                typeof booking.movie ===
                "object"

                    ? booking.movie?.title

                    : booking.movie;


            // ------------------------------------------
            // Movie filename
            // ------------------------------------------

            const movieFile =
                typeof booking.movie ===
                "object"

                    ? booking.movie?.image

                    : booking.image;


            // ------------------------------------------
            // IMPORTANT:
            // Convert filename into actual image URL
            // ------------------------------------------

            const movieImage =
                getMovieImage(
                    movieFile
                );


            // ------------------------------------------
            // Booking ID
            // ------------------------------------------

            const bookingId =
                booking.booking_id ||
                booking.bookingId ||
                booking.id ||
                "N/A";


            // ------------------------------------------
            // Seats
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


            return (

                <div

                    className={

                        completed

                            ? "booking-card completed-booking"

                            : "booking-card upcoming-booking"

                    }

                    key={
                        bookingId ||
                        index
                    }

                >


                    {/* ================================= */}
                    {/* MOVIE IMAGE */}
                    {/* ================================= */}

                    {movieImage && (

                        <img

                            src={
                                movieImage
                            }

                            alt={
                                movieName ||
                                "Movie"
                            }

                            className="booking-movie-image"

                            onError={(e) => {

                                console.error(
                                    "Profile movie image failed:",
                                    movieFile
                                );


                                e.currentTarget.style.display =
                                    "none";

                            }}

                        />

                    )}


                    {/* ================================= */}
                    {/* MOVIE TITLE */}
                    {/* ================================= */}

                    <h4>

                        🎬{" "}

                        {movieName ||
                            "Movie"}

                    </h4>


                    {/* ================================= */}
                    {/* BOOKING ID */}
                    {/* ================================= */}

                    <p>

                        🎟 Booking ID:{" "}

                        {bookingId}

                    </p>


                    {/* ================================= */}
                    {/* CITY */}
                    {/* ================================= */}

                    <p>

                        📍 City:{" "}

                        {booking.city ||
                            "N/A"}

                    </p>


                    {/* ================================= */}
                    {/* THEATRE */}
                    {/* ================================= */}

                    <p>

                        🏢 Theatre:{" "}

                        {booking.theatre ||
                            "N/A"}

                    </p>


                    {/* ================================= */}
                    {/* DATE */}
                    {/* ================================= */}

                    <p>

                        📅 Date:{" "}

                        {booking.date ||
                            "N/A"}

                    </p>


                    {/* ================================= */}
                    {/* TIME */}
                    {/* ================================= */}

                    <p>

                        ⏰ Time:{" "}

                        {booking.time ||
                            "N/A"}

                    </p>


                    {/* ================================= */}
                    {/* SEATS */}
                    {/* ================================= */}

                    <p>

                        💺 Seats:{" "}

                        {seats.length > 0

                            ? seats.join(
                                ", "
                            )

                            : "N/A"}

                    </p>


                    {/* ================================= */}
                    {/* AMOUNT */}
                    {/* ================================= */}

                    <p>

                        💰 Amount: ₹

                        {booking.price ||
                            0}

                    </p>


                    {/* ================================= */}
                    {/* STATUS */}
                    {/* ================================= */}

                    <div

                        className={

                            completed

                                ? "booking-status completed-status"

                                : "booking-status upcoming-status"

                        }

                    >

                        {completed

                            ? "✅ Completed"

                            : "🎟 Upcoming"}

                    </div>


                    {/* ================================= */}
                    {/* DOWNLOAD TICKET */}
                    {/* ================================= */}

                    <button

                        type="button"

                        className="download-booking-btn"

                        onClick={() =>
                            downloadTicket(
                                booking
                            )
                        }

                    >

                        📄 Download Ticket

                    </button>


                    {/* ================================= */}
                    {/* CANCEL */}
                    {/* ================================= */}

                    {!completed && (

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


                </div>

            );

        };


    // ==================================================
    // LOGIN CHECK
    // ==================================================

    if (!user) {

        return (

            <div className="profile-page">

                <div className="profile-card">

                    <h2>

                        Please Login First

                    </h2>


                    <button

                        type="button"

                        className="home-btn"

                        onClick={() =>
                            navigate(
                                "/login"
                            )
                        }

                    >

                        Go To Login

                    </button>

                </div>

            </div>

        );

    }


    // ==================================================
    // LOADING
    // ==================================================

    if (loading) {

        return (

            <div className="profile-page">

                <div className="profile-card">

                    <h2>

                        Loading your profile...

                    </h2>

                </div>

            </div>

        );

    }


    // ==================================================
    // PAGE
    // ==================================================

    return (

        <div className="profile-page">

            <div className="profile-card">


                {/* ======================================
                    HEADER
                ====================================== */}

                <h1>

                    🎬 MovieHub Profile

                </h1>


                {/* ======================================
                    PROFILE ICON
                ====================================== */}

                <div className="profile-icon">

                    👤

                </div>


                {/* ======================================
                    USER DETAILS
                ====================================== */}

                <div className="profile-details">

                    <h2>

                        {user.name}

                    </h2>


                    <p>

                        📧 {user.email}

                    </p>


                    <p>

                        🆔 User ID: {user.id}

                    </p>

                </div>


                {/* ======================================
                    BOOKING HISTORY
                ====================================== */}

                <div className="booking-history">


                    <h3>

                        🎟 My Bookings

                    </h3>


                    {/* =================================
                        SEARCH
                    ================================= */}

                    <input

                        type="text"

                        placeholder="Search bookings..."

                        className="booking-search"

                        value={search}

                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }

                    />


                    {/* =================================
                        UPCOMING
                    ================================= */}

                    <div className="booking-section">


                        <div className="section-title upcoming-title">


                            <span>

                                🎟 Upcoming Movies

                            </span>


                            <span className="booking-count">

                                {
                                    upcomingBookings.length
                                }

                            </span>


                        </div>


                        {upcomingBookings.length === 0 ? (

                            <p className="section-empty">

                                No upcoming bookings

                            </p>

                        ) : (

                            upcomingBookings.map(

                                (
                                    booking,
                                    index
                                ) =>

                                    renderBookingCard(

                                        booking,

                                        index,

                                        false

                                    )

                            )

                        )}

                    </div>


                    {/* =================================
                        COMPLETED
                    ================================= */}

                    <div className="booking-section completed-section">


                        <div className="section-title completed-title">


                            <span>

                                ✅ Completed Movies

                            </span>


                            <span className="booking-count">

                                {
                                    completedBookings.length
                                }

                            </span>


                        </div>


                        {completedBookings.length === 0 ? (

                            <p className="section-empty">

                                No completed bookings

                            </p>

                        ) : (

                            completedBookings.map(

                                (
                                    booking,
                                    index
                                ) =>

                                    renderBookingCard(

                                        booking,

                                        index,

                                        true

                                    )

                            )

                        )}

                    </div>


                </div>


                {/* ======================================
                    HOME
                ====================================== */}

                <button

                    type="button"

                    className="home-btn"

                    onClick={() =>
                        navigate("/")
                    }

                >

                    🏠 Back To Home

                </button>


                {/* ======================================
                    LOGOUT
                ====================================== */}

                <button

                    type="button"

                    className="logout-btn"

                    onClick={logout}

                >

                    Logout

                </button>


            </div>

        </div>

    );

}


export default Profile;