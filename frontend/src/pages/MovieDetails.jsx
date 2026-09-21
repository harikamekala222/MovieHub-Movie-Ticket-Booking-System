import { useEffect, useState } from "react";

import {
    useLocation,
    useNavigate,
    useParams
} from "react-router-dom";

import {
    getMovieImage
} from "../utils/movieImages";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "../styles/MovieDetails.css";


function MovieDetails() {

    const location =
        useLocation();

    const navigate =
        useNavigate();

    const { id } =
        useParams();


    // ==================================================
    // MOVIE FROM PREVIOUS PAGE
    // ==================================================

    const selectedMovie =
        location.state?.movie;


    // ==================================================
    // STATE
    // ==================================================

    const [movie, setMovie] =
        useState(
            selectedMovie || null
        );

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // ==================================================
    // FETCH MOVIE
    // ==================================================

    useEffect(() => {

        const fetchMovie = async () => {

            if (!id) {

                setLoading(false);

                setError(
                    "Movie ID not found"
                );

                return;

            }


            try {

                setLoading(true);

                setError("");


                const response =
                    await fetch(
                        `http://40.192.61.165:8000/movies/${id}`
                    );


                if (!response.ok) {

                    throw new Error(
                        "Movie not found"
                    );

                }


                const data =
                    await response.json();


                // ==================================================
                // DEBUG IMAGE DATA
                // ==================================================

                console.log(
                    "MOVIE API DATA:",
                    data
                );

                console.log(
                    "MOVIE IMAGE FROM API:",
                    data.image
                );

                console.log(
                    "RESOLVED MOVIE IMAGE:",
                    getMovieImage(
                        data.image
                    )
                );


                // ==================================================
                // RESOLVE IMAGE
                // ==================================================

                const resolvedImage =
                    getMovieImage(
                        data.image
                    );


                // ==================================================
                // FORMAT MOVIE
                // ==================================================

                const formattedMovie = {

                    id:
                        data.id,

                    title:
                        data.title,

                    genre:
                        data.genre,

                    rating:
                        data.rating,

                    duration:
                        data.duration,

                    releaseDate:
                        data.release_date,

                    language:
                        data.language,

                    director:
                        data.director,

                    cast:
                        data.cast,

                    description:
                        data.description,

                    image:
                        resolvedImage,

                    imageFile:
                        data.image,

                    trailer:
                        data.trailer
                };


                console.log(
                    "FORMATTED MOVIE:",
                    formattedMovie
                );


                setMovie(
                    formattedMovie
                );

            }

            catch (error) {

                console.error(
                    "Movie Details Error:",
                    error
                );


                // ==================================================
                // USE MOVIE FROM PREVIOUS PAGE
                // ==================================================

                if (selectedMovie) {

                    console.log(
                        "Using selected movie:",
                        selectedMovie
                    );


                    const fallbackImage =
                        getMovieImage(
                            selectedMovie.image ||
                            selectedMovie.imageFile
                        );


                    setMovie({

                        ...selectedMovie,

                        image:
                            fallbackImage ||
                            selectedMovie.image ||
                            null

                    });

                }

                else {

                    setMovie(null);

                    setError(
                        "Unable to load movie details"
                    );

                }

            }

            finally {

                setLoading(false);

            }

        };


        fetchMovie();

    }, [id]);


    // ==================================================
    // SELECT LOCATION
    // ==================================================

    const selectLocation = () => {

        if (!movie) {

            return;

        }


        navigate(
            "/location",
            {
                state: {
                    movie: movie
                }
            }
        );

    };


    // ==================================================
    // LOADING
    // ==================================================

    if (loading) {

        return (

            <>

                <Navbar />

                <div className="movie-details-page">

                    <div className="movie-details-loading">

                        <div className="movie-details-spinner">
                        </div>

                        <h2>
                            Loading Movie Details... 🎬
                        </h2>

                    </div>

                </div>

                <Footer />

            </>

        );

    }


    // ==================================================
    // ERROR
    // ==================================================

    if (
        error ||
        !movie
    ) {

        return (

            <>

                <Navbar />

                <div className="movie-details-page">

                    <div className="movie-details-error">

                        <div className="error-icon">
                            🎬
                        </div>

                        <h2>
                            {
                                error ||
                                "No Movie Details Found"
                            }
                        </h2>

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
    // FINAL IMAGE
    // ==================================================

    const finalMovieImage =
        movie.image ||
        getMovieImage(
            movie.imageFile
        );


    // ==================================================
    // PAGE
    // ==================================================

    return (

        <>

            <Navbar />


            <div className="movie-details-page">


                <div className="movie-details-card">


                    {/* ==================================
                        MOVIE IMAGE
                    ================================== */}

                    <div className="details-image-wrapper">

                        {finalMovieImage ? (

                            <img

                                src={
                                    finalMovieImage
                                }

                                alt={
                                    movie.title ||
                                    "Movie"
                                }

                                className="details-image"

                                onError={(event) => {

                                    console.error(
                                        "Movie details image failed:",
                                        finalMovieImage
                                    );

                                    event.currentTarget.style.display =
                                        "none";

                                }}

                            />

                        ) : (

                            <div className="details-no-image">

                                🎬

                                <span>
                                    No Image
                                </span>

                            </div>

                        )}

                    </div>


                    {/* ==================================
                        MOVIE INFORMATION
                    ================================== */}

                    <div className="movie-details-content">


                        <h1>
                            {
                                movie.title ||
                                "Movie"
                            }
                        </h1>


                        <h3>
                            ⭐ Rating:{" "}
                            {
                                movie.rating ||
                                "N/A"
                            }
                        </h3>


                        <p>
                            🎭 Genre:{" "}
                            {
                                movie.genre ||
                                "N/A"
                            }
                        </p>


                        <p>
                            ⏱ Duration:{" "}
                            {
                                movie.duration ||
                                "N/A"
                            }
                        </p>


                        <p>
                            📅 Release Date:{" "}
                            {
                                movie.releaseDate ||
                                "N/A"
                            }
                        </p>


                        <p>
                            🗣 Language:{" "}
                            {
                                movie.language ||
                                "N/A"
                            }
                        </p>


                        <p>
                            🎥 Director:{" "}
                            {
                                movie.director ||
                                "N/A"
                            }
                        </p>


                        <p>
                            👥 Cast:{" "}
                            {
                                movie.cast ||
                                "N/A"
                            }
                        </p>


                        <p className="description">

                            📝{" "}

                            {
                                movie.description ||
                                "No description available."
                            }

                        </p>


                        {/* ==================================
                            BOOKING BUTTON
                        ================================== */}

                        <button
                            type="button"
                            onClick={
                                selectLocation
                            }
                        >
                            Select Location 📍
                        </button>


                    </div>


                </div>


            </div>


            <Footer />

        </>

    );

}


export default MovieDetails;