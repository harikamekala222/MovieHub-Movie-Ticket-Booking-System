import { useEffect, useState } from "react";

import MovieCard from "../components/MovieCard";

import { getMovieImage } from "../utils/movieImages";

import "../styles/Movie.css";


function Movies() {

    const [movies, setMovies] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    // Search
    const [search, setSearch] = useState("");

    // Genre filter
    const [genre, setGenre] = useState("All");

    // Rating filter
    const [rating, setRating] = useState("All");


    // =================================================
    // GET NOW SHOWING MOVIES
    // =================================================

    useEffect(() => {

        const fetchMovies = async () => {

            try {

                setLoading(true);

                setError("");


                const response =
                    await fetch(
                        "http://40.192.61.165:8000/movies/"
                    );


                if (!response.ok) {

                    throw new Error(
                        "Failed to fetch movies"
                    );

                }


                const data =
                    await response.json();


                // ------------------------------------------------
                // ONLY NOW SHOWING MOVIES
                // ------------------------------------------------

                const nowShowingMovies =
                    data.filter(
                        (movie) =>
                            movie.movie_type ===
                            "now_showing"
                    );


                // ------------------------------------------------
                // FORMAT MOVIE DATA
                // ------------------------------------------------

                const formattedMovies =
                    nowShowingMovies.map(
                        (movie) => ({

                            id:
                                movie.id,

                            title:
                                movie.title,

                            genre:
                                movie.genre,

                            rating:
                                movie.rating,

                            duration:
                                movie.duration,

                            releaseDate:
                                movie.release_date,

                            language:
                                movie.language,

                            director:
                                movie.director,

                            cast:
                                movie.cast,

                            description:
                                movie.description,

                            /*
                             * Convert database filename
                             * into actual frontend image URL.
                             */

                            image:
                                getMovieImage(
                                    movie.image
                                ),

                            /*
                             * Keep original filename.
                             * Useful when passing movie data
                             * to other pages.
                             */

                            imageFile:
                                movie.image,

                            trailer:
                                movie.trailer

                        })
                    );


                setMovies(
                    formattedMovies
                );

            }

            catch (error) {

                console.error(
                    "Movies Error:",
                    error
                );


                setError(
                    "Unable to load movies"
                );

            }

            finally {

                setLoading(false);

            }

        };


        fetchMovies();

    }, []);


    // =================================================
    // GET GENRES
    // =================================================

    const genres = [

        "All",

        ...new Set(

            movies

                .map(
                    (movie) =>
                        movie.genre
                )

                .filter(
                    (genre) =>
                        genre
                )

        )

    ];


    // =================================================
    // FILTER MOVIES
    // =================================================

    const filteredMovies =
        movies.filter(
            (movie) => {

                // -----------------------------------------
                // SEARCH
                // -----------------------------------------

                const searchText =
                    search
                        .toLowerCase()
                        .trim();


                const movieTitle =
                    movie.title
                        ?.toLowerCase() ||
                    "";


                const movieGenre =
                    movie.genre
                        ?.toLowerCase() ||
                    "";


                const movieLanguage =
                    movie.language
                        ?.toLowerCase() ||
                    "";


                const matchesSearch =
                    !searchText ||

                    movieTitle.includes(
                        searchText
                    ) ||

                    movieGenre.includes(
                        searchText
                    ) ||

                    movieLanguage.includes(
                        searchText
                    );


                // -----------------------------------------
                // GENRE
                // -----------------------------------------

                const matchesGenre =
                    genre === "All" ||

                    movie.genre
                        ?.toLowerCase()
                        .includes(
                            genre.toLowerCase()
                        );


                // -----------------------------------------
                // RATING
                // -----------------------------------------

                let matchesRating =
                    true;


                if (rating !== "All") {

                    const movieRating =
                        parseFloat(
                            movie.rating
                        ) || 0;


                    matchesRating =
                        movieRating >=
                        Number(rating);

                }


                return (
                    matchesSearch &&
                    matchesGenre &&
                    matchesRating
                );

            }
        );


    // =================================================
    // CLEAR FILTERS
    // =================================================

    const clearFilters = () => {

        setSearch("");

        setGenre("All");

        setRating("All");

    };


    // =================================================
    // LOADING
    // =================================================

    if (loading) {

        return (

            <section className="movies-section">

                <div className="movies-loading">

                    <div className="movie-spinner">
                    </div>

                    <h2>
                        Loading Movies... 🎬
                    </h2>

                </div>

            </section>

        );

    }


    // =================================================
    // ERROR
    // =================================================

    if (error) {

        return (

            <section className="movies-section">

                <div className="movies-error">

                    <h2>
                        ❌ {error}
                    </h2>

                    <p>
                        Please make sure the
                        MovieHub backend is running.
                    </p>

                </div>

            </section>

        );

    }


    // =================================================
    // PAGE
    // =================================================

    return (

        <section className="movies-section">


            {/* ==========================================
                HEADING
            ========================================== */}

            <h2>
                Latest Movies 🎬
            </h2>


            {/* ==========================================
                SEARCH + FILTER
            ========================================== */}

            <div className="movie-filters">


                {/* SEARCH */}

                <div className="movie-search">

                    <input

                        type="text"

                        placeholder="🔎 Search movies..."

                        value={search}

                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }

                    />

                </div>


                {/* GENRE */}

                <div className="movie-filter">

                    <select

                        value={genre}

                        onChange={(e) =>
                            setGenre(
                                e.target.value
                            )
                        }

                    >

                        {genres.map(
                            (item) => (

                                <option
                                    key={item}
                                    value={item}
                                >

                                    {item === "All"
                                        ? "🎭 All Genres"
                                        : item}

                                </option>

                            )
                        )}

                    </select>

                </div>


                {/* RATING */}

                <div className="movie-filter">

                    <select

                        value={rating}

                        onChange={(e) =>
                            setRating(
                                e.target.value
                            )
                        }

                    >

                        <option value="All">
                            ⭐ All Ratings
                        </option>

                        <option value="9">
                            ⭐ 9+ Rating
                        </option>

                        <option value="8">
                            ⭐ 8+ Rating
                        </option>

                        <option value="7">
                            ⭐ 7+ Rating
                        </option>

                        <option value="6">
                            ⭐ 6+ Rating
                        </option>

                    </select>

                </div>


                {/* CLEAR */}

                {(search ||
                    genre !== "All" ||
                    rating !== "All") && (

                    <button

                        type="button"

                        className="clear-filter-btn"

                        onClick={
                            clearFilters
                        }

                    >

                        ✖ Clear

                    </button>

                )}

            </div>


            {/* ==========================================
                RESULT COUNT
            ========================================== */}

            <div className="movie-result-info">

                <p>

                    Showing{" "}

                    <strong>
                        {filteredMovies.length}
                    </strong>{" "}

                    {filteredMovies.length === 1
                        ? "movie"
                        : "movies"}

                </p>

            </div>


            {/* ==========================================
                MOVIES
            ========================================== */}

            {filteredMovies.length === 0 ? (

                <div className="no-movies">

                    <div className="no-movies-icon">
                        🎬
                    </div>

                    <h3>
                        No Movies Found
                    </h3>

                    <p>
                        Try changing your search
                        or filters.
                    </p>


                    <button

                        type="button"

                        className="clear-filter-btn"

                        onClick={
                            clearFilters
                        }

                    >

                        Clear Filters

                    </button>

                </div>

            ) : (

                <div className="movie-container">

                    {filteredMovies.map(
                        (movie) => (

                            <MovieCard

                                key={
                                    movie.id
                                }

                                movie={
                                    movie
                                }

                            />

                        )
                    )}

                </div>

            )}

        </section>

    );

}


export default Movies;
