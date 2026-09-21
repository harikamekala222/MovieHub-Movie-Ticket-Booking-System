import { useEffect, useState } from "react";

import {
    useLocation,
    useNavigate
} from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import { getMovieImage } from "../utils/movieImages";

import "../styles/Theatres.css";


function Theatres() {

    const location = useLocation();

    const navigate = useNavigate();


    // ==================================================
    // MOVIE / CITY / AREA
    // ==================================================

    const movieFromState =
        location.state?.movie;

    const city =
        location.state?.city || "All";

    const selectedArea =
        location.state?.area || "All";


    // ==================================================
    // MOVIE
    // ==================================================

    const movie = movieFromState
        ? {
            ...movieFromState,
            image:
                getMovieImage(
                    movieFromState.image
                )
        }
        : null;


    // ==================================================
    // STATE
    // ==================================================

    const [selectedDate, setSelectedDate] =
        useState("");


    const [selectedShow, setSelectedShow] =
        useState({

            theatre: "",

            theatreId: "",

            area: "",

            time: "",

            showTimingId: "",

            price: 0,

            language: ""

        });


    const [theatres, setTheatres] =
        useState([]);


    const [showTimings, setShowTimings] =
        useState([]);


    const [loading, setLoading] =
        useState(true);


    const [error, setError] =
        useState("");


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


        return `${year}-${month}-${day}`;

    };


    // ==================================================
    // RESET SELECTED SHOW
    // ==================================================

    const resetSelectedShow = () => {

        setSelectedShow({

            theatre: "",

            theatreId: "",

            area: "",

            time: "",

            showTimingId: "",

            price: 0,

            language: ""

        });

    };


    // ==================================================
    // CONVERT TIME TO MINUTES
    // ==================================================

    const timeToMinutes = (timeString) => {

        if (
            timeString === null ||
            timeString === undefined
        ) {

            return null;

        }


        const time =
            String(timeString)
                .trim()
                .toUpperCase();


        if (!time) {

            return null;

        }


        // ==================================================
        // 12-HOUR FORMAT
        // ==================================================

        const twelveHourMatch =
            time.match(
                /^(\d{1,2}):(\d{2})\s*(AM|PM)$/
            );


        if (twelveHourMatch) {

            let hour =
                Number(
                    twelveHourMatch[1]
                );


            const minute =
                Number(
                    twelveHourMatch[2]
                );


            const period =
                twelveHourMatch[3];


            if (
                hour < 1 ||
                hour > 12
            ) {

                console.warn(
                    "Invalid 12-hour show time:",
                    timeString
                );

                return null;

            }


            if (
                minute < 0 ||
                minute > 59
            ) {

                console.warn(
                    "Invalid minute:",
                    timeString
                );

                return null;

            }


            // AM

            if (period === "AM") {

                if (hour === 12) {

                    hour = 0;

                }

            }


            // PM

            if (period === "PM") {

                if (hour !== 12) {

                    hour += 12;

                }

            }


            return (
                hour * 60
            ) + minute;

        }


        // ==================================================
        // 24-HOUR FORMAT
        // ==================================================

        const twentyFourHourMatch =
            time.match(
                /^(\d{1,2}):(\d{2})$/
            );


        if (twentyFourHourMatch) {

            const hour =
                Number(
                    twentyFourHourMatch[1]
                );


            const minute =
                Number(
                    twentyFourHourMatch[2]
                );


            if (
                hour < 0 ||
                hour > 23
            ) {

                console.warn(
                    "Invalid 24-hour show time:",
                    timeString
                );

                return null;

            }


            if (
                minute < 0 ||
                minute > 59
            ) {

                console.warn(
                    "Invalid minute:",
                    timeString
                );

                return null;

            }


            return (
                hour * 60
            ) + minute;

        }


        console.warn(
            "Invalid show time format:",
            timeString
        );


        return null;

    };


    // ==================================================
    // CONVERT MINUTES TO AM / PM
    // ==================================================

    const minutesToAmPm = (totalMinutes) => {

        if (
            totalMinutes === null ||
            totalMinutes === undefined
        ) {

            return "";

        }


        let minutes =
            Number(totalMinutes);


        if (
            Number.isNaN(minutes)
        ) {

            return "";

        }


        minutes =
            (
                minutes % 1440
                + 1440
            ) % 1440;


        let hour =
            Math.floor(
                minutes / 60
            );


        const minute =
            minutes % 60;


        const period =
            hour >= 12
                ? "PM"
                : "AM";


        if (hour === 0) {

            hour = 12;

        }
        else if (hour > 12) {

            hour -= 12;

        }


        return (
            String(hour) +
            ":" +
            String(minute).padStart(2, "0") +
            " " +
            period
        );

    };


    // ==================================================
    // FORMAT SHOW TIME
    // ==================================================

    const formatShowTime = (timeString) => {

        const minutes =
            timeToMinutes(
                timeString
            );


        if (minutes === null) {

            return String(
                timeString || ""
            );

        }


        return minutesToAmPm(
            minutes
        );

    };


    // ==================================================
    // GET SHOW LANGUAGE
    //
    // Supports:
    // language
    // show_language
    // showLanguage
    //
    // If no language exists:
    // return empty string
    // ==================================================

    const getShowLanguage = (show) => {

        const language =
            show.language ??
            show.show_language ??
            show.showLanguage ??
            "";


        if (
            language === null ||
            language === undefined
        ) {

            return "";

        }


        const languageText =
            String(language).trim();


        if (
            !languageText ||
            languageText.toLowerCase() ===
            "language not available"
        ) {

            return "";

        }


        return languageText;

    };


    // ==================================================
    // CHECK WHETHER SHOW TIME IS AVAILABLE
    // ==================================================

    const isShowTimeAvailable = (show) => {

        if (!selectedDate) {

            return true;

        }


        const today =
            getToday();


        // Future date

        if (
            selectedDate > today
        ) {

            return true;

        }


        // Past date

        if (
            selectedDate < today
        ) {

            return false;

        }


        // Today

        const showMinutes =
            timeToMinutes(
                show.show_time
            );


        if (
            showMinutes === null
        ) {

            return false;

        }


        const now =
            new Date();


        const currentMinutes =
            (
                now.getHours() * 60
            ) +
            now.getMinutes();


        return (
            showMinutes >
            currentMinutes
        );

    };


    // ==================================================
    // FETCH THEATRES + SHOW TIMINGS
    // ==================================================

    useEffect(() => {

        const fetchData = async () => {

            try {

                setLoading(true);

                setError("");


                // ======================================
                // FETCH THEATRES
                // ======================================

                const theatreResponse =
                    await fetch(
                        "http://40.192.61.165:8000/theatres/"
                    );


                if (
                    !theatreResponse.ok
                ) {

                    throw new Error(
                        "Failed to fetch theatres"
                    );

                }


                const theatreData =
                    await theatreResponse.json();


                console.log(
                    "THEATRES DATA:",
                    theatreData
                );


                setTheatres(
                    Array.isArray(
                        theatreData
                    )
                        ? theatreData
                        : []
                );


                // ======================================
                // FETCH SHOW TIMINGS
                // ======================================

                if (
                    movie?.id
                ) {

                    const showResponse =
                        await fetch(
                            `http://40.192.61.165:8000/show-timings/movie/${movie.id}`
                        );


                    if (
                        !showResponse.ok
                    ) {

                        throw new Error(
                            "Failed to fetch show timings"
                        );

                    }


                    const showData =
                        await showResponse.json();


                    console.log(
                        "SHOW TIMINGS DATA:",
                        showData
                    );


                    setShowTimings(
                        Array.isArray(
                            showData
                        )
                            ? showData
                            : []
                    );

                }
                else {

                    setShowTimings([]);

                }

            }
            catch (err) {

                console.error(
                    "Theatre API Error:",
                    err
                );


                setError(
                    "Unable to load theatres. Please try again."
                );

            }
            finally {

                setLoading(false);

            }

        };


        fetchData();

    }, [movie?.id]);


    // ==================================================
    // CHECK SHOW DATE
    // ==================================================

    const isShowForSelectedDate = (show) => {

        if (!selectedDate) {

            return true;

        }


        const showDate =
            show.show_date ||
            show.date ||
            show.showDate;


        // Backend currently may not have show_date

        if (!showDate) {

            return true;

        }


        return (
            String(showDate)
                .substring(0, 10)
            ===
            selectedDate
        );

    };


    // ==================================================
    // FILTER THEATRES BY CITY + AREA
    // ==================================================

    const locationFilteredTheatres =
        theatres.filter(
            (theatre) => {

                // ======================================
                // CITY
                // ======================================

                const theatreCity =
                    String(
                        theatre.city || ""
                    )
                        .trim()
                        .toLowerCase();


                const selectedCity =
                    String(
                        city || "All"
                    )
                        .trim()
                        .toLowerCase();


                const cityMatches =
                    selectedCity === "all" ||
                    theatreCity ===
                    selectedCity;


                // ======================================
                // AREA
                // ======================================

                const theatreArea =
                    String(
                        theatre.area || ""
                    )
                        .trim()
                        .toLowerCase();


                const selectedAreaValue =
                    String(
                        selectedArea || "All"
                    )
                        .trim()
                        .toLowerCase();


                const areaMatches =
                    selectedAreaValue === "all" ||
                    theatreArea ===
                    selectedAreaValue;


                return (
                    cityMatches &&
                    areaMatches
                );

            }
        );


    // ==================================================
    // GET SHOW TIMES FOR THEATRE
    // ==================================================

    const getTheatreShowTimes =
        (theatreId) => {

            return showTimings.filter(
                (show) => {

                    // ==================================
                    // THEATRE ID
                    // ==================================

                    const showTheatreId =
                        show.theatre_id ??
                        show.theatreId ??
                        show.theatre?.id;


                    const theatreMatches =
                        Number(
                            showTheatreId
                        )
                        ===
                        Number(
                            theatreId
                        );


                    if (
                        !theatreMatches
                    ) {

                        return false;

                    }


                    // ==================================
                    // DATE
                    // ==================================

                    const dateMatches =
                        isShowForSelectedDate(
                            show
                        );


                    if (
                        !dateMatches
                    ) {

                        return false;

                    }


                    // ==================================
                    // TIME
                    // ==================================

                    const timeAvailable =
                        isShowTimeAvailable(
                            show
                        );


                    if (
                        !timeAvailable
                    ) {

                        return false;

                    }


                    return true;

                }
            );

        };


    // ==================================================
    // ONLY THEATRES HAVING AVAILABLE SHOWS
    // ==================================================

    const availableTheatres =
        locationFilteredTheatres
            .map(
                (theatre) => {

                    const times =
                        getTheatreShowTimes(
                            theatre.id
                        );


                    return {

                        ...theatre,

                        availableTimes:
                            times

                    };

                }
            )
            .filter(
                (theatre) =>
                    theatre
                        .availableTimes
                        .length > 0
            );


    // ==================================================
    // SELECT SHOW
    // ==================================================

    const selectShow = (
        theatreName,
        theatreId,
        area,
        show
    ) => {

        const language =
            getShowLanguage(
                show
            );


        console.log(
            "SELECTED SHOW:",
            {
                theatreName,
                theatreId,
                area,
                show,
                language
            }
        );


        setSelectedShow({

            theatre:
                theatreName,

            theatreId:
                theatreId,

            area:
                area,

            time:
                show.show_time,

            showTimingId:
                show.id,

            price:
                Number(
                    show.price
                ) || 0,

            language:
                language

        });

    };


    // ==================================================
    // CONTINUE TO SEATS
    // ==================================================

    const continueBooking =
        (theatre) => {

            // ==========================================
            // DATE CHECK
            // ==========================================

            if (!selectedDate) {

                alert(
                    "Please select booking date"
                );

                return;

            }


            // ==========================================
            // THEATRE CHECK
            // ==========================================

            if (
                Number(
                    selectedShow.theatreId
                )
                !==
                Number(
                    theatre.id
                )
            ) {

                alert(
                    "Please select show time"
                );

                return;

            }


            // ==========================================
            // TIME CHECK
            // ==========================================

            if (
                !selectedShow.time
            ) {

                alert(
                    "Please select show time"
                );

                return;

            }


            // ==========================================
            // SHOW TIMING ID CHECK
            // ==========================================

            if (
                !selectedShow.showTimingId
            ) {

                alert(
                    "Invalid show timing"
                );

                return;

            }


            // ==========================================
            // PRICE CHECK
            //
            // Price is NOT displayed on this page,
            // but it is still required for booking.
            // ==========================================

            if (
                !selectedShow.price ||
                Number(
                    selectedShow.price
                ) <= 0
            ) {

                alert(
                    "Ticket price is not available"
                );

                return;

            }


            // ==========================================
            // NAVIGATE TO SEATS
            // ==========================================

            navigate(
                "/seats",
                {
                    state: {

                        // ==============================
                        // MOVIE
                        // ==============================

                        movie: {

                            id:
                                movie.id,

                            title:
                                movie.title,

                            image:
                                movieFromState?.image ||
                                movie.image,

                            rating:
                                movie.rating,

                            genre:
                                movie.genre

                        },


                        // ==============================
                        // CITY
                        // ==============================

                        city:
                            theatre.city,


                        // ==============================
                        // AREA
                        // ==============================

                        area:
                            theatre.area,


                        // ==============================
                        // THEATRE
                        // ==============================

                        theatre:
                            theatre.name,

                        theatreId:
                            theatre.id,


                        // ==============================
                        // DATE
                        // ==============================

                        date:
                            selectedDate,


                        // ==============================
                        // TIME
                        // ==============================

                        time:
                            formatShowTime(
                                selectedShow.time
                            ),


                        // ==============================
                        // SHOW TIMING ID
                        // ==============================

                        showTimingId:
                            selectedShow.showTimingId,


                        // ==============================
                        // LANGUAGE
                        // ==============================

                        language:
                            selectedShow.language || "",


                        // ==============================
                        // PRICE
                        //
                        // Hidden on Theatres page.
                        // Sent to Seats page.
                        // ==============================

                        pricePerSeat:
                            selectedShow.price

                    }

                }
            );

        };


    // ==================================================
    // NO MOVIE SELECTED
    // ==================================================

    if (!movieFromState) {

        return (

            <>

                <Navbar />

                <div className="theatre-page">

                    <div className="theatre-message">

                        <div className="theatre-message-icon">
                            🎬
                        </div>

                        <h2>
                            No Movie Selected
                        </h2>

                        <p>
                            Please select a movie
                            before selecting a theatre.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/movies"
                                )
                            }
                        >
                            ← Back To Movies
                        </button>

                    </div>

                </div>

                <Footer />

            </>

        );

    }


    // ==================================================
    // LOADING
    // ==================================================

    if (loading) {

        return (

            <>

                <Navbar />

                <div className="theatre-page">

                    <div className="theatre-message">

                        <div className="theatre-spinner">
                        </div>

                        <h2>
                            Loading Theatres... 🎬
                        </h2>

                        <p>
                            Finding theatres and
                            available show timings.
                        </p>

                    </div>

                </div>

                <Footer />

            </>

        );

    }


    // ==================================================
    // ERROR
    // ==================================================

    if (error) {

        return (

            <>

                <Navbar />

                <div className="theatre-page">

                    <div className="theatre-message">

                        <div className="theatre-message-icon">
                            ⚠️
                        </div>

                        <h2>
                            {error}
                        </h2>

                        <p>
                            Please make sure the
                            MovieHub backend is running.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                window.location.reload()
                            }
                        >
                            🔄 Retry
                        </button>

                    </div>

                </div>

                <Footer />

            </>

        );

    }


    // ==================================================
    // JSX
    // ==================================================

    return (

        <>

            <Navbar />


            <div className="theatre-page">


                {/* ======================================
                    PAGE HEADER
                ====================================== */}

                <div className="theatre-header">

                    <div className="theatre-header-icon">
                        🏢
                    </div>


                    <h1>
                        Select Theatre
                    </h1>


                    <p>
                        Choose a theatre and
                        show time for your movie.
                    </p>


                    {/* CITY */}

                    <div className="selected-city">

                        📍{" "}

                        <strong>

                            {city === "All"
                                ? "All Cities"
                                : city}

                        </strong>

                    </div>


                    {/* AREA */}

                    {selectedArea !== "All" &&
                        selectedArea && (

                            <div className="selected-city">

                                📌{" "}

                                <strong>
                                    {selectedArea}
                                </strong>

                            </div>

                        )}

                </div>


                {/* ======================================
                    SELECTED MOVIE
                ====================================== */}

                <div className="selected-movie">

                    {movie.image ? (

                        <img
                            src={movie.image}
                            alt={movie.title}
                            className="theatre-movie-image"

                            onError={(e) => {

                                console.error(
                                    "Theatre image failed:",
                                    movie.image
                                );

                                e.currentTarget.style.display =
                                    "none";

                            }}

                        />

                    ) : (

                        <div className="no-theatre-image">
                            🎬
                        </div>

                    )}


                    <div className="selected-movie-info">

                        <h2>
                            🎬 {movie.title}
                        </h2>


                        <p>
                            ⭐ Rating:{" "}
                            {movie.rating || "N/A"}
                        </p>


                        {movie.genre && (

                            <p>
                                🎭 {movie.genre}
                            </p>

                        )}

                    </div>

                </div>


                {/* ======================================
                    DATE SELECTION
                ====================================== */}

                <div className="date-box">

                    <h3>
                        📅 Select Date
                    </h3>


                    <input
                        type="date"
                        value={selectedDate}
                        min={getToday()}

                        onChange={(e) => {

                            setSelectedDate(
                                e.target.value
                            );

                            resetSelectedShow();

                        }}

                    />

                </div>


                {/* ======================================
                    THEATRES
                ====================================== */}

                <div className="theatres-list">


                    {/* ==================================
                        NO THEATRES
                    ================================== */}

                    {availableTheatres.length === 0 ? (

                        <div className="no-theatres">

                            <div>
                                🏢
                            </div>


                            <h2>
                                No Shows Available
                            </h2>


                            <p>

                                No show timings are
                                available for{" "}

                                <strong>
                                    {movie.title}
                                </strong>{" "}

                                {selectedArea !== "All"
                                    ? `in ${selectedArea}, `
                                    : ""}

                                {city !== "All"
                                    ? `${city}.`
                                    : "in the selected location."}

                            </p>


                            <p>
                                Please select another
                                date or location.
                            </p>

                        </div>

                    ) : (

                        /* ==================================
                           AVAILABLE THEATRES
                        ================================== */

                        availableTheatres.map(
                            (theatre) => {

                                const times =
                                    theatre.availableTimes;


                                const isSelectedTheatre =
                                    Number(
                                        selectedShow.theatreId
                                    )
                                    ===
                                    Number(
                                        theatre.id
                                    );


                                return (

                                    <div
                                        className={
                                            isSelectedTheatre
                                                ? "theatre-card selected-theatre"
                                                : "theatre-card"
                                        }

                                        key={
                                            theatre.id
                                        }
                                    >


                                        {/* ============================
                                            THEATRE NAME
                                        ============================ */}

                                        <h2>

                                            🏢{" "}

                                            {theatre.name}

                                        </h2>


                                        {/* ============================
                                            LOCATION
                                        ============================ */}

                                        <p>

                                            📍{" "}

                                            {theatre.area
                                                ? `${theatre.area}, `
                                                : ""}

                                            {theatre.city}

                                        </p>


                                        {/* ============================
                                            SCREENS
                                        ============================ */}

                                        {theatre.screens !==
                                            undefined && (

                                            <p>

                                                🎥{" "}

                                                {theatre.screens}

                                                {" "}

                                                Screens

                                            </p>

                                        )}


                                        {/* ============================
                                            SHOW TIMES
                                        ============================ */}

                                        <div className="show-section">

                                            <h3>
                                                ⏰ Show Times
                                            </h3>


                                            <div className="show-times">

                                                {times.map(
                                                    (show) => {

                                                        const isSelected =
                                                            Number(
                                                                selectedShow.theatreId
                                                            )
                                                            ===
                                                            Number(
                                                                theatre.id
                                                            )
                                                            &&
                                                            Number(
                                                                selectedShow.showTimingId
                                                            )
                                                            ===
                                                            Number(
                                                                show.id
                                                            );


                                                        const language =
                                                            getShowLanguage(
                                                                show
                                                            );


                                                        return (

                                                            <button
                                                                key={
                                                                    show.id
                                                                }

                                                                type="button"

                                                                className={
                                                                    isSelected
                                                                        ? "active-time"
                                                                        : ""
                                                                }

                                                                onClick={() =>
                                                                    selectShow(
                                                                        theatre.name,
                                                                        theatre.id,
                                                                        theatre.area,
                                                                        show
                                                                    )
                                                                }
                                                            >

                                                                {/* ================================
                                                                    SHOW TIME
                                                                ================================= */}

                                                                <div className="show-time-main">

                                                                    ⏰{" "}

                                                                    {
                                                                        formatShowTime(
                                                                            show.show_time
                                                                        )
                                                                    }

                                                                </div>


                                                                {/* ================================
                                                                    LANGUAGE
                                                                    ONLY IF AVAILABLE
                                                                ================================= */}

                                                                {language && (

                                                                    <div className="show-language">

                                                                        🎭{" "}

                                                                        {language}

                                                                    </div>

                                                                )}

                                                            </button>

                                                        );

                                                    }
                                                )}

                                            </div>

                                        </div>


                                        {/* ============================
                                            SELECT SEATS
                                        ============================ */}

                                        <button
                                            type="button"
                                            className="seat-btn"

                                            onClick={() =>
                                                continueBooking(
                                                    theatre
                                                )
                                            }
                                        >

                                            💺 Select Seats

                                        </button>


                                    </div>

                                );

                            }

                        )

                    )}

                </div>

            </div>


            <Footer />

        </>

    );

}


export default Theatres;