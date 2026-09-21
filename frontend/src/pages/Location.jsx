import { useEffect, useState } from "react";

import {
    useLocation,
    useNavigate
} from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "../styles/Location.css";


function Location() {

    const navigate = useNavigate();

    const location = useLocation();


    // ==================================================
    // MOVIE
    // ==================================================

    const movie =
        location.state?.movie;


    // ==================================================
    // STATE
    // ==================================================

    const [cities, setCities] =
        useState([]);

    const [areas, setAreas] =
        useState([]);

    const [selectedCity, setSelectedCity] =
        useState("");

    const [theatreData, setTheatreData] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // ==================================================
    // FETCH LOCATIONS
    // ==================================================

    useEffect(() => {

        const fetchLocations = async () => {

            try {

                setLoading(true);

                setError("");


                // ==================================================
                // CHECK MOVIE
                // ==================================================

                if (!movie?.id) {

                    setCities([]);

                    setAreas([]);

                    setLoading(false);

                    return;

                }


                // ==================================================
                // FETCH THEATRES
                // ==================================================

                const theatreResponse =
                    await fetch(
                        "http://40.192.61.165:8000/theatres/"
                    );


                if (!theatreResponse.ok) {

                    throw new Error(
                        "Failed to fetch theatres"
                    );

                }


                const theatreData =
                    await theatreResponse.json();


                const theatres =
                    Array.isArray(theatreData)
                        ? theatreData
                        : [];


                // ==================================================
                // FETCH SHOW TIMINGS
                // ==================================================

                const showResponse =
                    await fetch(
                        `http://40.192.61.165:8000/show-timings/movie/${movie.id}`
                    );


                if (!showResponse.ok) {

                    throw new Error(
                        "Failed to fetch show timings"
                    );

                }


                const showData =
                    await showResponse.json();


                const showTimings =
                    Array.isArray(showData)
                        ? showData
                        : [];


                // ==================================================
                // GET THEATRE IDS FOR THIS MOVIE
                // ==================================================

                const theatreIdsWithMovie =
                    new Set();


                showTimings.forEach(
                    (show) => {

                        const theatreId =
                            show.theatre_id ??
                            show.theatreId ??
                            show.theatre?.id;


                        if (
                            theatreId !== undefined &&
                            theatreId !== null
                        ) {

                            theatreIdsWithMovie.add(
                                Number(theatreId)
                            );

                        }

                    }
                );


                // ==================================================
                // FILTER THEATRES
                // ==================================================

                const movieTheatres =
                    theatres.filter(
                        (theatre) => {

                            return theatreIdsWithMovie.has(
                                Number(theatre.id)
                            );

                        }
                    );


                setTheatreData(
                    movieTheatres
                );


                // ==================================================
                // GET UNIQUE CITIES
                // ==================================================

                const uniqueCities = [
                    ...new Set(
                        movieTheatres
                            .map(
                                (theatre) =>
                                    theatre.city
                            )
                            .filter(Boolean)
                    )
                ];


                setCities(
                    uniqueCities
                );

            }

            catch (err) {

                console.error(
                    "Location Error:",
                    err
                );


                setError(
                    "Unable to load available locations"
                );

            }

            finally {

                setLoading(false);

            }

        };


        fetchLocations();

    }, [movie?.id]);


    // ==================================================
    // SELECT CITY
    // ==================================================

    const selectCity = (city) => {

        setSelectedCity(
            city
        );


        const cityTheatres =
            theatreData.filter(
                (theatre) => {

                    return (
                        String(
                            theatre.city || ""
                        )
                            .trim()
                            .toLowerCase()
                        ===
                        String(
                            city || ""
                        )
                            .trim()
                            .toLowerCase()
                    );

                }
            );


        // ==================================================
        // UNIQUE AREAS
        // ==================================================

        const uniqueAreas = [

            ...new Set(

                cityTheatres
                    .map(
                        (theatre) =>
                            theatre.area
                    )
                    .filter(Boolean)

            )

        ];


        setAreas(
            uniqueAreas
        );

    };


    // ==================================================
    // SELECT AREA
    // ==================================================

    const selectArea = (area) => {

        navigate(
            "/theatres",
            {
                state: {

                    movie:
                        movie,

                    city:
                        selectedCity,

                    area:
                        area

                }

            }
        );

    };


    // ==================================================
    // BACK TO CITIES
    // ==================================================

    const backToCities = () => {

        setSelectedCity("");

        setAreas([]);

    };


    // ==================================================
    // NO MOVIE
    // ==================================================

    if (!movie) {

        return (

            <>

                <Navbar />

                <div className="location-page">

                    <div className="location-message">

                        <div className="location-message-icon">
                            🎬
                        </div>

                        <h2>
                            No Movie Selected
                        </h2>

                        <p>
                            Please select a movie
                            before choosing a location.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/movies")
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

                <div className="location-page">

                    <div className="location-message">

                        <div className="location-spinner">
                        </div>

                        <h2>
                            Loading Locations... 📍
                        </h2>

                        <p>

                            Finding cities where{" "}

                            <strong>
                                {movie.title}
                            </strong>{" "}

                            is available.

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

                <div className="location-page">

                    <div className="location-message">

                        <div className="location-message-icon">
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
                            🔄 Try Again
                        </button>

                    </div>

                </div>

                <Footer />

            </>

        );

    }


    // ==================================================
    // NO CITIES
    // ==================================================

    if (cities.length === 0) {

        return (

            <>

                <Navbar />

                <div className="location-page">

                    <div className="location-message">

                        <div className="location-message-icon">
                            📍
                        </div>

                        <h2>
                            No Locations Available
                        </h2>

                        <p>

                            <strong>
                                {movie.title}
                            </strong>{" "}

                            is currently not available
                            in any location.

                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/movies")
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
    // PAGE
    // ==================================================

    return (

        <>

            <Navbar />


            <div className="location-page">


                {/* ======================================
                    HEADER
                ====================================== */}

                <div className="location-header">

                    <div className="location-icon">
                        📍
                    </div>


                    <h1>

                        {selectedCity
                            ? "Select Your Area"
                            : "Select Your City"}

                    </h1>


                    <p>

                        {selectedCity
                            ? `Choose an area in ${selectedCity} to find available theatres.`
                            : "Choose a city to find available theatres."}

                    </p>


                    {/* SELECTED MOVIE */}

                    <div className="selected-movie">

                        <span>
                            🎬 Movie:
                        </span>

                        <strong>
                            {movie.title || "Movie"}
                        </strong>

                    </div>


                    {/* SELECTED CITY */}

                    {selectedCity && (

                        <div className="selected-location">

                            📍{" "}

                            <strong>
                                {selectedCity}
                            </strong>

                        </div>

                    )}

                </div>


                {/* ======================================
                    CITY LIST
                ====================================== */}

                {!selectedCity && (

                    <div className="location-options">

                        {cities.map(
                            (city) => (

                                <div
                                    className="location-item"
                                    key={city}
                                >

                                    <button
                                        type="button"
                                        className="location-option"
                                        onClick={() =>
                                            selectCity(city)
                                        }
                                    >

                                        <span className="location-option-icon">
                                            🏙️
                                        </span>

                                        <span className="location-option-name">
                                            {city}
                                        </span>

                                    </button>

                                </div>

                            )
                        )}

                    </div>

                )}


                {/* ======================================
                    AREA LIST
                ====================================== */}

                {selectedCity && (

                    <>

                        <div className="location-options">

                            {areas.length > 0 ? (

                                areas.map(
                                    (area) => (

                                        <div
                                            className="location-item"
                                            key={area}
                                        >

                                            <button
                                                type="button"
                                                className="location-option"
                                                onClick={() =>
                                                    selectArea(area)
                                                }
                                            >

                                                <span className="location-option-icon">
                                                    📍
                                                </span>

                                                <span className="location-option-name">
                                                    {area}
                                                </span>

                                            </button>

                                        </div>

                                    )
                                )

                            ) : (

                                <div className="location-message">

                                    <div className="location-message-icon">
                                        📍
                                    </div>

                                    <h2>
                                        No Areas Available
                                    </h2>

                                    <p>
                                        No theatres are available
                                        in {selectedCity}.
                                    </p>

                                </div>

                            )}

                        </div>


                        {/* ======================================
                            BACK
                        ====================================== */}

                        <div className="location-back">

                            <button
                                type="button"
                                onClick={
                                    backToCities
                                }
                            >

                                ← Back To Cities

                            </button>

                        </div>

                    </>

                )}

            </div>


            <Footer />

        </>

    );

}


export default Location;