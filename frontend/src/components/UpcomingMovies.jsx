import { useEffect, useState } from "react";

import "../styles/UpcomingMovies.css";

import { getMovieImage } from "../utils/movieImages";


function UpcomingMovies() {

    const [movies, setMovies] = useState([]);

    const [selectedTrailer, setSelectedTrailer] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // --------------------------------------------------
    // Fetch Upcoming Movies
    // --------------------------------------------------

    useEffect(() => {

        const fetchUpcomingMovies = async () => {

            try {

                const response = await fetch(
                    "http://40.192.61.165:8000/movies/"
                );


                if (!response.ok) {

                    throw new Error(
                        "Failed to fetch movies"
                    );

                }


                const data =
                    await response.json();


                // ------------------------------------------
                // Only upcoming movies
                // ------------------------------------------

                const upcomingMovies =
                    data.filter(
                        (movie) =>
                            movie.movie_type ===
                            "upcoming"
                    );


                // ------------------------------------------
                // Convert database movie data
                // ------------------------------------------

                const formattedMovies =
                    upcomingMovies.map((movie) => ({

                        id: movie.id,

                        title: movie.title,

                        image:
                            getMovieImage(
                                movie.image
                            ),

                        release:
                            movie.release_date,

                        genre:
                            movie.genre,

                        trailer:
                            movie.trailer

                    }));


                setMovies(
                    formattedMovies
                );

            }

            catch (error) {

                console.error(
                    "Upcoming Movies Error:",
                    error
                );

                setError(
                    "Unable to load upcoming movies"
                );

            }

            finally {

                setLoading(false);

            }

        };


        fetchUpcomingMovies();

    }, []);


    // --------------------------------------------------
    // Convert YouTube URL to Embed URL
    // --------------------------------------------------

    const getEmbedUrl = (url) => {

        if (!url) {
            return "";
        }


        // ------------------------------------------
        // youtu.be URL
        // ------------------------------------------

        if (
            url.includes("youtu.be/")
        ) {

            const videoId =
                url
                    .split("youtu.be/")[1]
                    .split("?")[0];


            return (
                `https://www.youtube.com/embed/${videoId}`
            );

        }


        // ------------------------------------------
        // youtube.com/watch URL
        // ------------------------------------------

        if (
            url.includes("youtube.com/watch")
        ) {

            const videoId =
                new URL(url)
                    .searchParams
                    .get("v");


            return (
                `https://www.youtube.com/embed/${videoId}`
            );

        }


        return url;

    };


    // --------------------------------------------------
    // Loading
    // --------------------------------------------------

    if (loading) {

        return (

            <section className="upcoming-section">

                <h2>
                    Upcoming Movies
                </h2>

                <p>
                    Loading upcoming movies...
                </p>

            </section>

        );

    }


    // --------------------------------------------------
    // Error
    // --------------------------------------------------

    if (error) {

        return (

            <section className="upcoming-section">

                <h2>
                    Upcoming Movies
                </h2>

                <p>
                    {error}
                </p>

            </section>

        );

    }


    // --------------------------------------------------
    // No upcoming movies
    // --------------------------------------------------

    if (movies.length === 0) {

        return (

            <section className="upcoming-section">

                <h2>
                    Upcoming Movies
                </h2>

                <p>
                    No upcoming movies available.
                </p>

            </section>

        );

    }


    // --------------------------------------------------
    // JSX
    // --------------------------------------------------

    return (

        <section className="upcoming-section">


            <h2>
                Upcoming Movies
            </h2>


            <div className="upcoming-container">


                {movies.map((movie) => (

                    <div
                        className="upcoming-card"
                        key={movie.id}
                    >


                        {/* Movie Image */}

                        <div className="upcoming-image">


                            {movie.image ? (

                                <img
                                    src={movie.image}
                                    alt={movie.title}
                                />

                            ) : (

                                <div
                                    className="no-movie-image"
                                >
                                    🎬
                                </div>

                            )}


                            <span>
                                Coming Soon
                            </span>


                        </div>


                        {/* Movie Information */}

                        <div className="upcoming-content">


                            <h3>
                                {movie.title}
                            </h3>


                            <p>
                                🎭 {movie.genre}
                            </p>


                            <p>
                                📅 Release:{" "}
                                {movie.release}
                            </p>


                            {/* Trailer */}

                            {movie.trailer && (

                                <button
                                    onClick={() =>
                                        setSelectedTrailer(
                                            movie.trailer
                                        )
                                    }
                                >
                                    ▶ Watch Trailer
                                </button>

                            )}


                        </div>


                    </div>

                ))}


            </div>


            {/* Trailer Modal */}

            {selectedTrailer && (

                <div className="trailer-modal">


                    <div className="trailer-box">


                        <button
                            className="close-btn"
                            onClick={() =>
                                setSelectedTrailer(null)
                            }
                        >
                            ✖
                        </button>


                        <iframe
                            width="100%"
                            height="400"
                            src={getEmbedUrl(
                                selectedTrailer
                            )}
                            title="Movie Trailer"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        >
                        </iframe>


                    </div>


                </div>

            )}


        </section>

    );

}


export default UpcomingMovies;