import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import { getMovieImage } from "../utils/movieImages";

import "../styles/AdminMovies.css";

const API = "http://40.192.61.165:8000";

function AdminMovies() {
    const navigate = useNavigate();

    // =================================================
    // MAIN DATA
    // =================================================

    const [movies, setMovies] = useState([]);
    const [locations, setLocations] = useState([]);
    const [theatres, setTheatres] = useState([]);
    const [showTimings, setShowTimings] = useState([]);

    const [loading, setLoading] = useState(true);

    const [editingId, setEditingId] = useState(null);

    // =================================================
    // SHOW TIMING EDITING
    // =================================================

    const [editingTimingId, setEditingTimingId] = useState(null);

    // =================================================
    // SHOW TIMING FORM
    // =================================================

    const [showHour, setShowHour] = useState("");
    const [showMinute, setShowMinute] = useState("00");
    const [showPeriod, setShowPeriod] = useState("AM");

    const [showLanguage, setShowLanguage] = useState("");
    const [showPrice, setShowPrice] = useState("");

    // =================================================
    // LOCATION / AREA / THEATRE
    // =================================================

    const [selectedLocationId, setSelectedLocationId] = useState("");
    const [selectedAreaId, setSelectedAreaId] = useState("");
    const [selectedTheatreId, setSelectedTheatreId] = useState("");

    // =================================================
    // EMPTY MOVIE FORM
    // =================================================

    const emptyForm = {
        title: "",
        image: "",
        rating: "",
        genre: "",
        duration: "",
        language: "",
        release_date: "",
        director: "",
        cast: "",
        description: "",
        trailer: "",

        movie_type: "now_showing",
        refund_policy: "refundable",

        location: "",
        locationArea: "",
        theatre: ""
    };

    const [form, setForm] = useState(emptyForm);

    // =================================================
    // SAFE TEXT
    // =================================================

    const getSafeText = (value) => {
        if (value === null || value === undefined) {
            return "";
        }

        if (
            typeof value === "string" ||
            typeof value === "number"
        ) {
            return String(value);
        }

        if (typeof value === "object") {
            if (
                value.name !== undefined &&
                value.name !== null
            ) {
                return getSafeText(value.name);
            }

            if (
                value.city !== undefined &&
                value.city !== null
            ) {
                return getSafeText(value.city);
            }

            if (
                value.area !== undefined &&
                value.area !== null
            ) {
                return getSafeText(value.area);
            }

            if (
                value.title !== undefined &&
                value.title !== null
            ) {
                return getSafeText(value.title);
            }

            if (
                value.id !== undefined &&
                value.id !== null
            ) {
                return String(value.id);
            }
        }

        return "";
    };

    // =================================================
    // GET LOCATION AREAS
    // =================================================

    const getLocationAreas = (location) => {
        if (!location) {
            return [];
        }

        if (Array.isArray(location.area)) {
            return location.area;
        }

        if (Array.isArray(location.areas)) {
            return location.areas;
        }

        return [];
    };

    // =================================================
    // FIND LOCATION BY CITY
    // =================================================

    const findLocationByCity = (city) => {
        const cityText = getSafeText(city)
            .trim()
            .toLowerCase();

        if (!cityText) {
            return null;
        }

        return (
            locations.find((location) => {
                const locationCity = getSafeText(location.city)
                    .trim()
                    .toLowerCase();

                return locationCity === cityText;
            }) || null
        );
    };

    // =================================================
    // FIND AREA
    // =================================================

    const findAreaInLocation = (location, areaId) => {
        if (!location || !areaId) {
            return null;
        }

        const areas = getLocationAreas(location);

        return (
            areas.find(
                (area) =>
                    Number(area.id) === Number(areaId)
            ) || null
        );
    };

    // =================================================
    // FIND THEATRE
    // =================================================

    const findTheatreById = (theatreId) => {
        if (!theatreId) {
            return null;
        }

        return (
            theatres.find(
                (theatre) =>
                    Number(theatre.id) === Number(theatreId)
            ) || null
        );
    };

    // =================================================
    // FETCH MOVIES
    // =================================================

    const fetchMovies = async () => {
        try {
            setLoading(true);

            const response = await fetch(
                `${API}/movies/`
            );

            if (!response.ok) {
                throw new Error("Unable to fetch movies");
            }

            const data = await response.json();

            setMovies(
                Array.isArray(data) ? data : []
            );
        } catch (error) {
            console.error(
                "Movie Fetch Error:",
                error
            );

            alert("Unable to load movies");
        } finally {
            setLoading(false);
        }
    };

    // =================================================
    // FETCH LOCATIONS
    // =================================================

    const fetchLocations = async () => {
        try {
            const response = await fetch(
                `${API}/locations/`
            );

            if (!response.ok) {
                throw new Error(
                    "Unable to fetch locations"
                );
            }

            const data = await response.json();

            console.log("LOCATIONS API:", data);

            setLocations(
                Array.isArray(data) ? data : []
            );
        } catch (error) {
            console.error(
                "Location Fetch Error:",
                error
            );
        }
    };

    // =================================================
    // FETCH THEATRES
    // =================================================

    const fetchTheatres = async () => {
        try {
            const response = await fetch(
                `${API}/theatres/`
            );

            if (!response.ok) {
                throw new Error(
                    "Unable to fetch theatres"
                );
            }

            const data = await response.json();

            console.log("THEATRES API:", data);

            setTheatres(
                Array.isArray(data) ? data : []
            );
        } catch (error) {
            console.error(
                "Theatre Fetch Error:",
                error
            );
        }
    };

    // =================================================
    // FETCH SHOW TIMINGS
    // =================================================

    const fetchShowTimings = async (movieId) => {
        if (!movieId) {
            setShowTimings([]);
            return;
        }

        try {
            const response = await fetch(
                `${API}/show-timings/movie/${movieId}`
            );

            if (!response.ok) {
                throw new Error(
                    "Unable to fetch show timings"
                );
            }

            const data = await response.json();

            console.log(
                "SHOW TIMINGS API:",
                data
            );

            setShowTimings(
                Array.isArray(data) ? data : []
            );
        } catch (error) {
            console.error(
                "Show Timing Fetch Error:",
                error
            );

            setShowTimings([]);
        }
    };

    // =================================================
    // INITIAL LOAD
    // =================================================

    useEffect(() => {
        fetchMovies();
        fetchLocations();
        fetchTheatres();
    }, []);

    // =================================================
    // RESET SHOW FORM
    // =================================================

    const resetShowForm = () => {
        setEditingTimingId(null);

        setShowHour("");
        setShowMinute("00");
        setShowPeriod("AM");

        setShowLanguage("");
        setShowPrice("");
    };

    // =================================================
    // PARSE SHOW TIME
    // =================================================

    const parseShowTime = (time) => {
        if (!time) {
            return;
        }

        const value = String(time)
            .trim()
            .toUpperCase();

        const match12 = value.match(
            /^(\d{1,2}):(\d{2})\s*(AM|PM)$/
        );

        if (match12) {
            setShowHour(
                String(Number(match12[1]))
            );

            setShowMinute(match12[2]);
            setShowPeriod(match12[3]);

            return;
        }

        const match24 = value.match(
            /^(\d{1,2}):(\d{2})$/
        );

        if (match24) {
            let hour = Number(match24[1]);
            const minute = match24[2];

            let period = "AM";

            if (hour >= 12) {
                period = "PM";
            }

            if (hour === 0) {
                hour = 12;
            } else if (hour > 12) {
                hour -= 12;
            }

            setShowHour(String(hour));
            setShowMinute(minute);
            setShowPeriod(period);
        }
    };

    // =================================================
    // FORM CHANGE
    // =================================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));

        if (
            name === "movie_type" &&
            value === "upcoming"
        ) {
            setSelectedLocationId("");
            setSelectedAreaId("");
            setSelectedTheatreId("");

            setShowTimings([]);

            resetShowForm();

            setForm((previous) => ({
                ...previous,
                movie_type: value,
                location: "",
                locationArea: "",
                theatre: ""
            }));
        }
    };

    // =================================================
    // LOCATION CHANGE
    // =================================================

    const handleLocationChange = (e) => {
        const locationId = e.target.value;

        setSelectedLocationId(locationId);
        setSelectedAreaId("");
        setSelectedTheatreId("");

        const location = locations.find(
            (item) =>
                Number(item.id) ===
                Number(locationId)
        );

        setForm((previous) => ({
            ...previous,

            location: getSafeText(location?.city),

            locationArea: "",
            theatre: ""
        }));
    };

    // =================================================
    // AREA CHANGE
    // =================================================

    const handleAreaChange = (e) => {
        const areaId = e.target.value;

        setSelectedAreaId(areaId);
        setSelectedTheatreId("");

        const location = locations.find(
            (item) =>
                Number(item.id) ===
                Number(selectedLocationId)
        );

        const area = findAreaInLocation(
            location,
            areaId
        );

        setForm((previous) => ({
            ...previous,

            location: getSafeText(location?.city),

            locationArea: getSafeText(area?.name),

            theatre: ""
        }));
    };

    // =================================================
    // THEATRE CHANGE
    // =================================================

    const handleTheatreChange = (e) => {
        const theatreId = e.target.value;

        setSelectedTheatreId(theatreId);

        const theatre =
            findTheatreById(theatreId);

        if (!theatre) {
            return;
        }

        setForm((previous) => ({
            ...previous,

            location: getSafeText(theatre.city),

            locationArea: getSafeText(theatre.area),

            theatre: getSafeText(theatre.name)
        }));
    };

    // =================================================
    // SELECTED LOCATION
    // =================================================

    const getSelectedLocation = () => {
        return locations.find(
            (location) =>
                Number(location.id) ===
                Number(selectedLocationId)
        );
    };

    // =================================================
    // SELECTED AREA
    // =================================================

    const getSelectedArea = () => {
        const location =
            getSelectedLocation();

        if (!location) {
            return null;
        }

        return findAreaInLocation(
            location,
            selectedAreaId
        );
    };

    // =================================================
    // FILTER THEATRES
    // =================================================

    const filteredTheatres = selectedAreaId
        ? theatres.filter(
              (theatre) =>
                  Number(theatre.location_id) ===
                  Number(selectedAreaId)
          )
        : [];

    // =================================================
    // TIME TO MINUTES
    // =================================================

    const timeToMinutes = (time) => {
        if (!time) {
            return null;
        }

        const value = String(time)
            .trim()
            .toUpperCase();

        const match12 = value.match(
            /^(\d{1,2}):(\d{2})\s*(AM|PM)$/
        );

        if (match12) {
            let hour = Number(match12[1]);
            const minute = Number(match12[2]);
            const period = match12[3];

            if (
                hour < 1 ||
                hour > 12 ||
                minute < 0 ||
                minute > 59
            ) {
                return null;
            }

            if (period === "AM") {
                if (hour === 12) {
                    hour = 0;
                }
            } else {
                if (hour !== 12) {
                    hour += 12;
                }
            }

            return hour * 60 + minute;
        }

        const match24 = value.match(
            /^(\d{1,2}):(\d{2})$/
        );

        if (match24) {
            const hour = Number(match24[1]);
            const minute = Number(match24[2]);

            if (
                hour < 0 ||
                hour > 23 ||
                minute < 0 ||
                minute > 59
            ) {
                return null;
            }

            return hour * 60 + minute;
        }

        return null;
    };

    // =================================================
    // MINUTES TO TIME
    // =================================================

    const minutesToTime = (minutes) => {
        minutes =
            ((minutes % 1440) + 1440) %
            1440;

        let hour = Math.floor(
            minutes / 60
        );

        const minute = minutes % 60;

        let period = "AM";

        if (hour >= 12) {
            period = "PM";
        }

        if (hour === 0) {
            hour = 12;
        } else if (hour > 12) {
            hour -= 12;
        }

        return `${hour}:${String(
            minute
        ).padStart(2, "0")} ${period}`;
    };

    // =================================================
    // PARSE DURATION
    // =================================================

    const parseDuration = (duration) => {
        if (!duration) {
            return 0;
        }

        const text = String(duration)
            .toLowerCase()
            .trim();

        let total = 0;

        const hours = text.match(
            /(\d+(?:\.\d+)?)\s*h/
        );

        const minutes = text.match(
            /(\d+)\s*m/
        );

        if (hours) {
            total +=
                Number(hours[1]) * 60;
        }

        if (minutes) {
            total += Number(minutes[1]);
        }

        if (
            !hours &&
            !minutes &&
            !Number.isNaN(Number(text))
        ) {
            total = Number(text);
        }

        return total;
    };

    // =================================================
    // CURRENT SHOW TIME
    // =================================================

    const getCurrentShowTime = () => {
        if (!showHour) {
            return "";
        }

        return `${showHour}:${showMinute} ${showPeriod}`;
    };

    // =================================================
    // NEXT SHOW TIME
    // =================================================

    const calculateNextShowTime = () => {
        const current =
            getCurrentShowTime();

        if (!current) {
            return "";
        }

        const duration =
            parseDuration(form.duration);

        if (!duration) {
            return "";
        }

        const currentMinutes =
            timeToMinutes(current);

        if (currentMinutes === null) {
            return "";
        }

        return minutesToTime(
            currentMinutes +
                duration +
                15
        );
    };

    // =================================================
    // SAVE MOVIE
    // =================================================

    const saveMovie = async (e) => {
        e.preventDefault();

        if (!form.title.trim()) {
            alert("Please enter movie name");
            return;
        }

        if (!form.release_date) {
            alert("Please select release date");
            return;
        }

        if (!form.refund_policy) {
            alert("Please select refund policy");
            return;
        }

        if (
            form.movie_type ===
            "now_showing"
        ) {
            if (!selectedLocationId) {
                alert("Please select location");
                return;
            }

            if (!selectedAreaId) {
                alert("Please select area");
                return;
            }

            if (!selectedTheatreId) {
                alert("Please select theatre");
                return;
            }
        }

        try {
            const url = editingId
                ? `${API}/movies/${editingId}`
                : `${API}/movies/`;

            const method = editingId
                ? "PUT"
                : "POST";

            const movieData = {
                ...form,

                location:
                    form.movie_type ===
                    "upcoming"
                        ? ""
                        : form.location,

                locationArea:
                    form.movie_type ===
                    "upcoming"
                        ? ""
                        : form.locationArea,

                theatre:
                    form.movie_type ===
                    "upcoming"
                        ? ""
                        : form.theatre
            };

            const response = await fetch(
                url,
                {
                    method,
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify(
                        movieData
                    )
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                alert(
                    data.detail ||
                        "Unable to save movie"
                );
                return;
            }

            const movieId =
                editingId || data.id;

            alert(
                editingId
                    ? "Movie updated successfully"
                    : "Movie added successfully"
            );

            await fetchMovies();

            if (
                form.movie_type ===
                "upcoming"
            ) {
                cancelEdit();
                return;
            }

            setEditingId(movieId);

            await fetchShowTimings(
                movieId
            );
        } catch (error) {
            console.error(
                "Save Movie Error:",
                error
            );

            alert(
                "Backend connection failed"
            );
        }
    };

    // =================================================
    // SAVE SHOW TIMING
    // =================================================

    const saveShowTiming = async () => {
        console.log(
            "SAVE SHOW TIMING CLICKED"
        );

        console.log({
            editingId,
            selectedTheatreId,
            showLanguage,
            showHour,
            showMinute,
            showPeriod,
            showPrice
        });

        if (
            form.movie_type !==
            "now_showing"
        ) {
            alert(
                "Show timings are only required for Now Showing movies."
            );
            return;
        }

        if (!editingId) {
            alert(
                "First save the movie. Click Add Movie/Update Movie first."
            );
            return;
        }

        if (!selectedTheatreId) {
            alert("Please select theatre.");
            return;
        }

        if (!showLanguage) {
            alert(
                "Please select show language."
            );
            return;
        }

        const showTime =
            getCurrentShowTime();

        if (!showTime) {
            alert(
                "Please select show time."
            );
            return;
        }

        if (
            !showPrice ||
            Number(showPrice) <= 0
        ) {
            alert(
                "Please enter a valid ticket price."
            );
            return;
        }

        try {
            const url =
                editingTimingId
                    ? `${API}/show-timings/${editingTimingId}`
                    : `${API}/show-timings/`;

            const method =
                editingTimingId
                    ? "PUT"
                    : "POST";

            const requestBody = {
                movie_id:
                    Number(editingId),

                theatre_id:
                    Number(
                        selectedTheatreId
                    ),

                language:
                    showLanguage,

                show_time:
                    showTime,

                price:
                    Number(showPrice)
            };

            console.log(
                "SHOW TIMING REQUEST:",
                requestBody
            );

            const response =
                await fetch(
                    url,
                    {
                        method,
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify(
                            requestBody
                        )
                    }
                );

            const data =
                await response.json();

            console.log(
                "SHOW TIMING RESPONSE:",
                data
            );

            if (!response.ok) {
                alert(
                    data.detail ||
                        (editingTimingId
                            ? "Unable to update show timing"
                            : "Unable to add show timing")
                );
                return;
            }

            alert(
                editingTimingId
                    ? "Show timing updated successfully"
                    : "Show timing added successfully"
            );

            resetShowForm();

            await fetchShowTimings(
                editingId
            );
        } catch (error) {
            console.error(
                "Save Show Timing Error:",
                error
            );

            alert(
                "Backend connection failed"
            );
        }
    };

    // =================================================
    // EDIT SHOW TIMING
    // =================================================

    const editShowTiming = (timing) => {
        setEditingTimingId(timing.id);

        setShowLanguage(
            getSafeText(timing.language)
        );

        setShowPrice(
            String(timing.price ?? "")
        );

        parseShowTime(
            timing.show_time
        );

        const theatre =
            findTheatreById(
                timing.theatre_id
            );

        if (theatre) {
            const theatreCity =
                getSafeText(
                    theatre.city
                ).trim();

            const theatreArea =
                getSafeText(
                    theatre.area
                ).trim();

            const location =
                findLocationByCity(
                    theatreCity
                );

            if (location) {
                setSelectedLocationId(
                    String(location.id)
                );

                let area = null;

                if (
                    theatre.location_id
                ) {
                    area =
                        findAreaInLocation(
                            location,
                            theatre.location_id
                        );
                }

                if (!area) {
                    area =
                        getLocationAreas(
                            location
                        ).find(
                            (item) =>
                                getSafeText(
                                    item.name
                                )
                                    .trim()
                                    .toLowerCase() ===
                                theatreArea
                                    .toLowerCase()
                        );
                }

                if (area) {
                    setSelectedAreaId(
                        String(area.id)
                    );
                }

                setSelectedTheatreId(
                    String(theatre.id)
                );

                setForm((previous) => ({
                    ...previous,

                    location:
                        theatreCity,

                    locationArea:
                        theatreArea,

                    theatre:
                        getSafeText(
                            theatre.name
                        )
                }));
            }
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // =================================================
    // DELETE SHOW TIMING
    // =================================================

    const deleteShowTiming =
        async (timingId) => {
            if (
                !window.confirm(
                    "Are you sure you want to delete this show timing?"
                )
            ) {
                return;
            }

            try {
                const response =
                    await fetch(
                        `${API}/show-timings/${timingId}`,
                        {
                            method: "DELETE"
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {
                    alert(
                        data.detail ||
                            "Unable to delete show timing"
                    );
                    return;
                }

                alert(
                    "Show timing deleted successfully"
                );

                if (
                    editingTimingId ===
                    timingId
                ) {
                    resetShowForm();
                }

                await fetchShowTimings(
                    editingId
                );
            } catch (error) {
                console.error(
                    "Delete Show Timing Error:",
                    error
                );

                alert(
                    "Backend connection failed"
                );
            }
        };

    // =================================================
    // EDIT MOVIE
    // =================================================

    const editMovie = async (movie) => {
        console.log(
            "================ EDIT MOVIE ================"
        );

        console.log("MOVIE:", movie);

        setEditingId(movie.id);

        const movieType =
            getSafeText(
                movie.movie_type
            ) || "now_showing";

        const movieCity =
            getSafeText(
                movie.location
            ).trim();

        const movieArea =
            getSafeText(
                movie.locationArea
            ).trim();

        const movieTheatre =
            getSafeText(
                movie.theatre
            ).trim();

        setForm({
            title:
                getSafeText(
                    movie.title
                ),

            image:
                getSafeText(
                    movie.image
                ),

            rating:
                getSafeText(
                    movie.rating
                ),

            genre:
                getSafeText(
                    movie.genre
                ),

            duration:
                getSafeText(
                    movie.duration
                ),

            language:
                getSafeText(
                    movie.language
                ),

            release_date:
                getSafeText(
                    movie.release_date
                ),

            director:
                getSafeText(
                    movie.director
                ),

            cast:
                getSafeText(
                    movie.cast
                ),

            description:
                getSafeText(
                    movie.description
                ),

            trailer:
                getSafeText(
                    movie.trailer
                ),

            movie_type:
                movieType,

            refund_policy:
                getSafeText(
                    movie.refund_policy
                ) || "refundable",

            location:
                movieCity,

            locationArea:
                movieArea,

            theatre:
                movieTheatre
        });

        resetShowForm();

        if (
            movieType ===
            "upcoming"
        ) {
            setSelectedLocationId("");
            setSelectedAreaId("");
            setSelectedTheatreId("");

            setShowTimings([]);

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

            return;
        }

        let theatre = null;

        if (movie.theatre_id) {
            theatre =
                findTheatreById(
                    movie.theatre_id
                );
        }

        if (
            !theatre &&
            movieTheatre
        ) {
            theatre =
                theatres.find(
                    (item) =>
                        getSafeText(
                            item.name
                        )
                            .trim()
                            .toLowerCase() ===
                        movieTheatre
                            .trim()
                            .toLowerCase()
                ) || null;
        }

        if (theatre) {
            const theatreCity =
                getSafeText(
                    theatre.city
                ).trim();

            const theatreArea =
                getSafeText(
                    theatre.area
                ).trim();

            let location =
                findLocationByCity(
                    theatreCity
                );

            if (!location) {
                location =
                    findLocationByCity(
                        movieCity
                    );
            }

            if (location) {
                setSelectedLocationId(
                    String(location.id)
                );

                let area = null;

                if (
                    theatre.location_id
                ) {
                    area =
                        findAreaInLocation(
                            location,
                            theatre.location_id
                        );
                }

                if (!area) {
                    area =
                        getLocationAreas(
                            location
                        ).find(
                            (item) =>
                                getSafeText(
                                    item.name
                                )
                                    .trim()
                                    .toLowerCase() ===
                                theatreArea
                                    .trim()
                                    .toLowerCase()
                        ) || null;
                }

                if (area) {
                    setSelectedAreaId(
                        String(area.id)
                    );
                } else {
                    setSelectedAreaId("");
                }

                setSelectedTheatreId(
                    String(theatre.id)
                );

                setForm((previous) => ({
                    ...previous,

                    location:
                        getSafeText(
                            location.city
                        ),

                    locationArea:
                        theatreArea,

                    theatre:
                        getSafeText(
                            theatre.name
                        )
                }));
            }
        } else {
            let location =
                findLocationByCity(
                    movieCity
                );

            if (location) {
                setSelectedLocationId(
                    String(location.id)
                );

                let area =
                    getLocationAreas(
                        location
                    ).find(
                        (item) =>
                            getSafeText(
                                item.name
                            )
                                .trim()
                                .toLowerCase() ===
                            movieArea
                                .trim()
                                .toLowerCase()
                    );

                if (area) {
                    setSelectedAreaId(
                        String(area.id)
                    );

                    const theatreList =
                        theatres.filter(
                            (item) =>
                                Number(
                                    item.location_id
                                ) ===
                                Number(
                                    area.id
                                )
                        );

                    const matchingTheatre =
                        theatreList.find(
                            (item) =>
                                getSafeText(
                                    item.name
                                )
                                    .trim()
                                    .toLowerCase() ===
                                movieTheatre
                                    .trim()
                                    .toLowerCase()
                        );

                    if (
                        matchingTheatre
                    ) {
                        setSelectedTheatreId(
                            String(
                                matchingTheatre.id
                            )
                        );
                    }
                }
            }
        }

        await fetchShowTimings(
            movie.id
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // =================================================
    // DELETE MOVIE
    // =================================================

    const deleteMovie =
        async (movieId) => {
            if (
                !window.confirm(
                    "Are you sure you want to delete this movie?"
                )
            ) {
                return;
            }

            try {
                const response =
                    await fetch(
                        `${API}/movies/${movieId}`,
                        {
                            method: "DELETE"
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {
                    alert(
                        data.detail ||
                            "Unable to delete movie"
                    );
                    return;
                }

                alert(
                    "Movie deleted successfully"
                );

                if (
                    editingId ===
                    movieId
                ) {
                    cancelEdit();
                }

                await fetchMovies();
            } catch (error) {
                console.error(
                    "Delete Movie Error:",
                    error
                );

                alert(
                    "Backend connection failed"
                );
            }
        };

    // =================================================
    // CANCEL EDIT
    // =================================================

    const cancelEdit = () => {
        setEditingId(null);

        setForm(emptyForm);

        setSelectedLocationId("");
        setSelectedAreaId("");
        setSelectedTheatreId("");

        setShowTimings([]);

        resetShowForm();
    };

    // =================================================
    // THEATRE NAME
    // =================================================

    const getTheatreName =
        (theatreId) => {
            const theatre =
                findTheatreById(
                    theatreId
                );

            return theatre
                ? getSafeText(
                      theatre.name
                  )
                : `Theatre ID: ${theatreId}`;
        };

    // =================================================
    // LOCATION NAME
    // =================================================

    const getLocationName =
        (theatreId) => {
            const theatre =
                findTheatreById(
                    theatreId
                );

            return theatre
                ? getSafeText(
                      theatre.city
                  ) || "Unknown Location"
                : "Unknown Location";
        };

    // =================================================
    // AREA NAME
    // =================================================

    const getAreaName =
        (theatreId) => {
            const theatre =
                findTheatreById(
                    theatreId
                );

            return theatre
                ? getSafeText(
                      theatre.area
                  ) || "Unknown Area"
                : "Unknown Area";
        };

    // =================================================
    // LOGOUT
    // =================================================

    const handleLogout = () => {
        if (
            !window.confirm(
                "Are you sure you want to logout?"
            )
        ) {
            return;
        }

        localStorage.removeItem(
            "adminLoggedIn"
        );

        navigate("/admin-login");
    };

    // =================================================
    // RENDER
    // =================================================

    return (
        <>
            <Navbar />

            <div className="admin-movies-page">
                <div className="admin-movies-container">

                    {/* HEADER */}

                    <div className="admin-header">
                        <div>
                            <h1>
                                🎬 MovieHub Admin
                            </h1>

                            <p>
                                Manage Movies
                            </p>
                        </div>

                        <button
                            type="button"
                            className="admin-logout-btn"
                            onClick={
                                handleLogout
                            }
                        >
                            🚪 Logout
                        </button>
                    </div>

                    {/* MOVIE FORM */}

                    <div className="admin-form-card">
                        <h2>
                            {editingId
                                ? "✏️ Edit Movie"
                                : "➕ Add New Movie"}
                        </h2>

                        <form
                            onSubmit={
                                saveMovie
                            }
                        >
                            <div className="form-grid">

                                {/* MOVIE NAME */}

                                <div className="form-group">
                                    <label>
                                        Movie Name
                                    </label>

                                    <input
                                        type="text"
                                        name="title"
                                        value={
                                            form.title
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter movie name"
                                        required
                                    />
                                </div>

                                {/* POSTER */}

                                <div className="form-group">
                                    <label>
                                        Poster Image Filename
                                    </label>

                                    <input
                                        type="text"
                                        name="image"
                                        value={
                                            form.image
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Example: GDN.jpg"
                                    />
                                </div>

                                {/* RATING */}

                                <div className="form-group">
                                    <label>
                                        Rating
                                    </label>

                                    <input
                                        type="text"
                                        name="rating"
                                        value={
                                            form.rating
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Example: 8.5/10"
                                    />
                                </div>

                                {/* GENRE */}

                                <div className="form-group">
                                    <label>
                                        Genre
                                    </label>

                                    <input
                                        type="text"
                                        name="genre"
                                        value={
                                            form.genre
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Action, Drama"
                                    />
                                </div>

                                {/* DURATION */}

                                <div className="form-group">
                                    <label>
                                        Duration
                                    </label>

                                    <input
                                        type="text"
                                        name="duration"
                                        value={
                                            form.duration
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Example: 2h 30m"
                                    />

                                    <small>
                                        Used to calculate
                                        the next available
                                        show time.
                                    </small>
                                </div>

                                {/* MOVIE LANGUAGE */}

                                <div className="form-group">
                                    <label>
                                        Language
                                    </label>

                                    <input
                                        type="text"
                                        name="language"
                                        value={
                                            form.language
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Example: Tamil"
                                    />

                                    <small>
                                        Main language of
                                        the movie.
                                    </small>
                                </div>

                                {/* RELEASE DATE */}

                                <div className="form-group">
                                    <label>
                                        📅 Release Date
                                    </label>

                                    <input
                                        type="date"
                                        name="release_date"
                                        value={
                                            form.release_date
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />
                                </div>

                                {/* MOVIE TYPE */}

                                <div className="form-group">
                                    <label>
                                        Movie Type
                                    </label>

                                    <select
                                        name="movie_type"
                                        value={
                                            form.movie_type
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >
                                        <option value="now_showing">
                                            Now Showing
                                        </option>

                                        <option value="upcoming">
                                            Upcoming Movie
                                        </option>
                                    </select>
                                </div>

                                {/* REFUND */}

                                <div className="form-group">
                                    <label>
                                        💰 Refund Policy
                                    </label>

                                    <select
                                        name="refund_policy"
                                        value={
                                            form.refund_policy
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    >
                                        <option value="refundable">
                                            Refundable
                                        </option>

                                        <option value="non_refundable">
                                            Non-Refundable
                                        </option>
                                    </select>
                                </div>

                                {/* LOCATION / AREA / THEATRE */}

                                {form.movie_type ===
                                    "now_showing" && (
                                    <>
                                        {/* LOCATION */}

                                        <div className="form-group">
                                            <label>
                                                📍 Location
                                            </label>

                                            <select
                                                value={
                                                    selectedLocationId
                                                }
                                                onChange={
                                                    handleLocationChange
                                                }
                                            >
                                                <option value="">
                                                    Select Location
                                                </option>

                                                {locations.map(
                                                    (
                                                        location
                                                    ) => (
                                                        <option
                                                            key={
                                                                location.id
                                                            }
                                                            value={
                                                                location.id
                                                            }
                                                        >
                                                            {getSafeText(
                                                                location.city
                                                            )}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </div>

                                        {/* AREA */}

                                        <div className="form-group">
                                            <label>
                                                📌 Area
                                            </label>

                                            <select
                                                value={
                                                    selectedAreaId
                                                }
                                                onChange={
                                                    handleAreaChange
                                                }
                                                disabled={
                                                    !selectedLocationId
                                                }
                                            >
                                                <option value="">
                                                    {selectedLocationId
                                                        ? "Select Area"
                                                        : "Select Location First"}
                                                </option>

                                                {getLocationAreas(
                                                    getSelectedLocation()
                                                ).map(
                                                    (
                                                        area
                                                    ) => (
                                                        <option
                                                            key={
                                                                area.id
                                                            }
                                                            value={
                                                                area.id
                                                            }
                                                        >
                                                            {getSafeText(
                                                                area.name
                                                            )}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </div>

                                        {/* THEATRE */}

                                        <div className="form-group">
                                            <label>
                                                🎭 Theatre
                                            </label>

                                            <select
                                                value={
                                                    selectedTheatreId
                                                }
                                                onChange={
                                                    handleTheatreChange
                                                }
                                                disabled={
                                                    !selectedAreaId
                                                }
                                            >
                                                <option value="">
                                                    {selectedAreaId
                                                        ? "Select Theatre"
                                                        : "Select Area First"}
                                                </option>

                                                {filteredTheatres.map(
                                                    (
                                                        theatre
                                                    ) => (
                                                        <option
                                                            key={
                                                                theatre.id
                                                            }
                                                            value={
                                                                theatre.id
                                                            }
                                                        >
                                                            {getSafeText(
                                                                theatre.name
                                                            )}
                                                        </option>
                                                    )
                                                )}
                                            </select>

                                            {selectedAreaId && (
                                                <small>
                                                    {
                                                        filteredTheatres.length
                                                    }{" "}
                                                    theatre(s)
                                                    available
                                                    in{" "}
                                                    {getSafeText(
                                                        getSelectedArea()
                                                            ?.name
                                                    )}
                                                </small>
                                            )}
                                        </div>

                                        {/* SHOW LANGUAGE */}

                                        <div className="form-group">
                                            <label>
                                                🌐 Show Language
                                            </label>

                                            <select
    value={showLanguage}
    onChange={(e) =>
        setShowLanguage(e.target.value)
    }
>
    <option value="">
        Select Language
    </option>

    <option value="Tamil">
        Tamil
    </option>

    <option value="Telugu">
        Telugu
    </option>

    <option value="Malayalam">
        Malayalam
    </option>

    <option value="Hindi">
        Hindi
    </option>

    <option value="English">
        English
    </option>

    <option value="Kannada">
        Kannada
    </option>
</select>
                                        </div>

                                        {/* SHOW TIME */}

                                        <div className="form-group">
                                            <label>
                                                🕐 Show Time
                                            </label>

                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    gap:
                                                        "8px",
                                                    alignItems:
                                                        "center"
                                                }}
                                            >
                                                <select
                                                    value={
                                                        showHour
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        setShowHour(
                                                            e
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                >
                                                    <option value="">
                                                        Hour
                                                    </option>

                                                    {Array.from(
                                                        {
                                                            length: 12
                                                        },
                                                        (
                                                            _,
                                                            index
                                                        ) => {
                                                            const hour =
                                                                index +
                                                                1;

                                                            return (
                                                                <option
                                                                    key={
                                                                        hour
                                                                    }
                                                                    value={String(
                                                                        hour
                                                                    )}
                                                                >
                                                                    {String(
                                                                        hour
                                                                    ).padStart(
                                                                        2,
                                                                        "0"
                                                                    )}
                                                                </option>
                                                            );
                                                        }
                                                    )}
                                                </select>

                                                <strong>
                                                    :
                                                </strong>

                                                <select
                                                    value={
                                                        showMinute
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        setShowMinute(
                                                            e
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                >
                                                    {[
                                                        "00",
                                                        "05",
                                                        "10",
                                                        "15",
                                                        "20",
                                                        "25",
                                                        "30",
                                                        "35",
                                                        "40",
                                                        "45",
                                                        "50",
                                                        "55"
                                                    ].map(
                                                        (
                                                            minute
                                                        ) => (
                                                            <option
                                                                key={
                                                                    minute
                                                                }
                                                                value={
                                                                    minute
                                                                }
                                                            >
                                                                {
                                                                    minute
                                                                }
                                                            </option>
                                                        )
                                                    )}
                                                </select>

                                                <select
                                                    value={
                                                        showPeriod
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        setShowPeriod(
                                                            e
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                >
                                                    <option value="AM">
                                                        AM
                                                    </option>

                                                    <option value="PM">
                                                        PM
                                                    </option>
                                                </select>
                                            </div>

                                            {getCurrentShowTime() && (
                                                <p>
                                                    Selected
                                                    Show Time:{" "}
                                                    <strong>
                                                        {
                                                            getCurrentShowTime()
                                                        }
                                                    </strong>
                                                </p>
                                            )}

                                            {getCurrentShowTime() &&
                                                form.duration &&
                                                calculateNextShowTime() && (
                                                    <p>
                                                        ⏭️ Next
                                                        available
                                                        show:{" "}
                                                        <strong>
                                                            {
                                                                calculateNextShowTime()
                                                            }
                                                        </strong>
                                                    </p>
                                                )}
                                        </div>

                                        {/* PRICE */}

                                        <div className="form-group">
                                            <label>
                                                💰 Ticket Price
                                            </label>

                                            <input
                                                type="number"
                                                min="1"
                                                value={
                                                    showPrice
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    setShowPrice(
                                                        e
                                                            .target
                                                            .value
                                                    )
                                                }
                                                placeholder="Example: 200"
                                            />
                                        </div>

                                        {/* ADD SHOW */}

                                        <div className="form-group">
                                            <label>
                                                &nbsp;
                                            </label>

                                            <button
                                                type="button"
                                                onClick={
                                                    saveShowTiming
                                                }
                                                className="add-show-btn"
                                            >
                                                {editingTimingId
                                                    ? "💾 Update Show"
                                                    : "➕ Add Show"}
                                            </button>

                                            {editingTimingId && (
                                                <button
                                                    type="button"
                                                    onClick={
                                                        resetShowForm
                                                    }
                                                    style={{
                                                        marginTop:
                                                            "8px"
                                                    }}
                                                >
                                                    Cancel Show
                                                    Edit
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}

                                {/* UPCOMING */}

                                {form.movie_type ===
                                    "upcoming" && (
                                    <div
                                        className="form-group full-width"
                                        style={{
                                            padding:
                                                "15px",
                                            background:
                                                "#eff6ff",
                                            borderRadius:
                                                "8px"
                                        }}
                                    >
                                        🎬{" "}
                                        <strong>
                                            Upcoming Movie
                                        </strong>

                                        <br />

                                        <small>
                                            Location, area,
                                            theatre, ticket
                                            price and show
                                            timing are not
                                            required.
                                        </small>
                                    </div>
                                )}

                                {/* TRAILER */}

                                <div className="form-group">
                                    <label>
                                        Trailer YouTube URL
                                    </label>

                                    <input
                                        type="text"
                                        name="trailer"
                                        value={
                                            form.trailer
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="https://youtu.be/xxxxx"
                                    />
                                </div>

                                {/* DIRECTOR */}

                                <div className="form-group">
                                    <label>
                                        Director
                                    </label>

                                    <input
                                        type="text"
                                        name="director"
                                        value={
                                            form.director
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Director name"
                                    />
                                </div>

                                {/* CAST */}

                                <div className="form-group full-width">
                                    <label>
                                        Cast
                                    </label>

                                    <input
                                        type="text"
                                        name="cast"
                                        value={
                                            form.cast
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Actor 1, Actor 2, Actor 3"
                                    />
                                </div>

                                {/* DESCRIPTION */}

                                <div className="form-group full-width">
                                    <label>
                                        Description
                                    </label>

                                    <textarea
                                        name="description"
                                        value={
                                            form.description
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter movie description"
                                        rows="5"
                                    />
                                </div>
                            </div>

                            {/* FORM BUTTONS */}

                            <div className="admin-form-buttons">
                                <button
                                    type="submit"
                                    className="add-movie-btn"
                                >
                                    {editingId
                                        ? "💾 Update Movie"
                                        : "➕ Add Movie"}
                                </button>

                                {editingId && (
                                    <button
                                        type="button"
                                        className="cancel-edit-btn"
                                        onClick={
                                            cancelEdit
                                        }
                                    >
                                        Cancel Edit
                                    </button>
                                )}
                            </div>
                        </form>

                        {/* SHOW TIMING LIST */}

                        {editingId &&
                            form.movie_type ===
                                "now_showing" && (
                                <div
                                    style={{
                                        marginTop:
                                            "30px",
                                        paddingTop:
                                            "20px",
                                        borderTop:
                                            "1px solid #ddd"
                                    }}
                                >
                                    <h3>
                                        🎟️ Movie Show
                                        Schedule
                                    </h3>

                                    <p>
                                        Only theatres
                                        with show
                                        timings will be
                                        displayed to
                                        customers.
                                    </p>

                                    {showTimings.length ===
                                    0 ? (
                                        <p>
                                            No show timings
                                            added yet.
                                        </p>
                                    ) : (
                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                flexDirection:
                                                    "column",
                                                gap:
                                                    "12px"
                                            }}
                                        >
                                            {showTimings.map(
                                                (
                                                    timing
                                                ) => (
                                                    <div
                                                        key={
                                                            timing.id
                                                        }
                                                        style={{
                                                            display:
                                                                "flex",
                                                            justifyContent:
                                                                "space-between",
                                                            alignItems:
                                                                "center",
                                                            padding:
                                                                "15px",
                                                            border:
                                                                "1px solid #ddd",
                                                            borderRadius:
                                                                "8px"
                                                        }}
                                                    >
                                                        <div>
                                                            <strong>
                                                                📍{" "}
                                                                {
                                                                    getLocationName(
                                                                        timing.theatre_id
                                                                    )
                                                                }
                                                            </strong>

                                                            <br />

                                                            <span>
                                                                📌{" "}
                                                                {
                                                                    getAreaName(
                                                                        timing.theatre_id
                                                                    )
                                                                }
                                                            </span>

                                                            <br />

                                                            <span>
                                                                🎭{" "}
                                                                {
                                                                    getTheatreName(
                                                                        timing.theatre_id
                                                                    )
                                                                }
                                                            </span>

                                                            <br />

                                                            <span>
                                                                🌐{" "}
                                                                <strong>
                                                                    {
                                                                        getSafeText(
                                                                            timing.language
                                                                        ) ||
                                                                        "N/A"
                                                                    }
                                                                </strong>
                                                            </span>

                                                            <br />

                                                            <span>
                                                                🕐{" "}
                                                                {
                                                                    getSafeText(
                                                                        timing.show_time
                                                                    )
                                                                }
                                                            </span>

                                                            <br />

                                                            <span>
                                                                💰 ₹
                                                                {
                                                                    timing.price
                                                                }
                                                            </span>
                                                        </div>

                                                        <div
                                                            style={{
                                                                display:
                                                                    "flex",
                                                                gap:
                                                                    "8px",
                                                                flexDirection:
                                                                    "column"
                                                            }}
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    editShowTiming(
                                                                        timing
                                                                    )
                                                                }
                                                            >
                                                                ✏️
                                                                Edit
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    deleteShowTiming(
                                                                        timing.id
                                                                    )
                                                                }
                                                            >
                                                                🗑
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                    </div>

                    {/* EXISTING MOVIES */}

                    <div className="admin-list-card">
                        <h2>
                            🎞 Existing Movies
                        </h2>

                        {loading ? (
                            <p className="admin-message">
                                Loading movies...
                            </p>
                        ) : movies.length === 0 ? (
                            <p className="admin-message">
                                No movies available
                            </p>
                        ) : (
                            <div className="admin-movie-list">
                                {movies.map(
                                    (movie) => (
                                        <div
                                            className="admin-movie-item"
                                            key={
                                                movie.id
                                            }
                                        >
                                            {movie.image &&
                                            getMovieImage(
                                                movie.image
                                            ) ? (
                                                <img
                                                    src={getMovieImage(
                                                        movie.image
                                                    )}
                                                    alt={getSafeText(
                                                        movie.title
                                                    )}
                                                />
                                            ) : (
                                                <div className="admin-no-image">
                                                    🎬
                                                </div>
                                            )}

                                            <div className="admin-movie-info">
                                                <h3>
                                                    {getSafeText(
                                                        movie.title
                                                    )}
                                                </h3>

                                                <p>
                                                    ⭐{" "}
                                                    {getSafeText(
                                                        movie.rating
                                                    ) ||
                                                        "N/A"}
                                                </p>

                                                <p>
                                                    🎭{" "}
                                                    {getSafeText(
                                                        movie.genre
                                                    ) ||
                                                        "N/A"}
                                                </p>

                                                <p>
                                                    ⏱️{" "}
                                                    {getSafeText(
                                                        movie.duration
                                                    ) ||
                                                        "N/A"}
                                                </p>

                                                <p>
                                                    🌐{" "}
                                                    {getSafeText(
                                                        movie.language
                                                    ) ||
                                                        "N/A"}
                                                </p>

                                                <p>
                                                    📅{" "}
                                                    {getSafeText(
                                                        movie.release_date
                                                    ) ||
                                                        "N/A"}
                                                </p>

                                                {movie.location && (
                                                    <p>
                                                        📍{" "}
                                                        {getSafeText(
                                                            movie.location
                                                        )}
                                                    </p>
                                                )}

                                                {movie.locationArea && (
                                                    <p>
                                                        📌{" "}
                                                        {getSafeText(
                                                            movie.locationArea
                                                        )}
                                                    </p>
                                                )}

                                                {movie.theatre && (
                                                    <p>
                                                        🎭{" "}
                                                        {getSafeText(
                                                            movie.theatre
                                                        )}
                                                    </p>
                                                )}

                                                <p>
                                                    🎬 Type:{" "}
                                                    <strong>
                                                        {movie.movie_type ===
                                                        "upcoming"
                                                            ? "Upcoming"
                                                            : "Now Showing"}
                                                    </strong>
                                                </p>

                                                <p>
                                                    💰 Refund
                                                    Policy:{" "}
                                                    <strong>
                                                        {movie.refund_policy ===
                                                        "non_refundable"
                                                            ? "Non-Refundable"
                                                            : "Refundable"}
                                                    </strong>
                                                </p>

                                                {movie.trailer && (
                                                    <p>
                                                        ▶
                                                        Trailer
                                                        Available
                                                    </p>
                                                )}
                                            </div>

                                            <div className="admin-movie-actions">
                                                <button
                                                    className="edit-movie-btn"
                                                    onClick={() =>
                                                        editMovie(
                                                            movie
                                                        )
                                                    }
                                                >
                                                    ✏️ Edit
                                                </button>

                                                <button
                                                    className="delete-movie-btn"
                                                    onClick={() =>
                                                        deleteMovie(
                                                            movie.id
                                                        )
                                                    }
                                                >
                                                    🗑 Delete
                                                </button>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default AdminMovies;