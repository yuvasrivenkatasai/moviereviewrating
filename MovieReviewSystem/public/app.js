
// ==========================================
// MOVIEVERSE - MOVIE REVIEW SYSTEM
// ==========================================

// Load data from browser LocalStorage
let movies = JSON.parse(localStorage.getItem("movies")) || [];
let viewers = JSON.parse(localStorage.getItem("viewers")) || [];
let reviews = JSON.parse(localStorage.getItem("reviews")) || [];

function saveData() {
    localStorage.setItem("movies", JSON.stringify(movies));
    localStorage.setItem("viewers", JSON.stringify(viewers));
    localStorage.setItem("reviews", JSON.stringify(reviews));
    updateDashboard();
}

// Unique IDs
function newId() {
    return Date.now().toString() +
        Math.random().toString(16).slice(2);
}

// Escape user text before displaying it in HTML
function safe(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Navigation
function showSection(sectionId) {

    document.querySelectorAll(".section").forEach(section => {
        section.classList.add("hidden");
    });

    document.getElementById(sectionId).classList.remove("hidden");

    if (sectionId === "movies") displayMovies();
    if (sectionId === "viewers") displayViewers();
    if (sectionId === "reviews") {
        updateReviewDropdowns();
        displayReviews();
    }
}

// ==========================================
// MOVIE MANAGEMENT
// ==========================================

function addMovie() {

    const title = document.getElementById("movieTitle").value.trim();
    const year = Number(document.getElementById("movieYear").value);
    const genre = document.getElementById("movieGenre").value;
    const description = document.getElementById("movieDescription").value.trim();

    if (!title || !year || !genre || !description) {
        alert("Please fill all movie details.");
        return;
    }

    if (!Number.isInteger(year) || year < 1888 || year > 2100) {
        alert("Enter a valid movie release year.");
        return;
    }

    movies.push({
        id: newId(),
        title,
        year,
        genre,
        description
    });

    saveData();

    document.getElementById("movieTitle").value = "";
    document.getElementById("movieYear").value = "";
    document.getElementById("movieGenre").value = "";
    document.getElementById("movieDescription").value = "";

    displayMovies();
    updateReviewDropdowns();

    alert("Movie added successfully!");
}

function displayMovies() {

    const list = document.getElementById("movieList");

    const search = document.getElementById("searchMovie")
        .value.toLowerCase();

    const genre = document.getElementById("filterGenre").value;

    const filtered = movies.filter(movie => {

        return movie.title.toLowerCase().includes(search) &&
            (!genre || movie.genre === genre);
    });

    list.innerHTML = "";

    if (filtered.length === 0) {
        list.innerHTML = "<p>No movies found.</p>";
        return;
    }

    filtered.forEach(movie => {

        const rating = getAverageRating(movie.id);
        const count = reviews.filter(r => r.movieId === movie.id).length;

        list.innerHTML += `
            <div class="card">

                <h3>🎬 ${safe(movie.title)}</h3>

                <p><b>Year:</b> ${movie.year}</p>

                <p><b>Genre:</b> ${safe(movie.genre)}</p>

                <p>${safe(movie.description)}</p>

                <p class="stars">
                    ★ ${rating.toFixed(1)} / 5
                </p>

                <p>${count} Reviews</p>

                <button onclick="editMovie('${movie.id}')">
                    Edit
                </button>

                <button onclick="deleteMovie('${movie.id}')">
                    Delete
                </button>

            </div>
        `;
    });
}

// Edit movie
function editMovie(id) {

    const movie = movies.find(m => m.id === id);

    if (!movie) return;

    const title = prompt("Enter movie title:", movie.title);

    if (title === null) return;

    const yearInput = prompt("Enter release year:", movie.year);

    if (yearInput === null) return;

    const year = Number(yearInput);

    if (!title.trim() || !Number.isInteger(year) ||
        year < 1888 || year > 2100) {
        alert("Invalid movie details.");
        return;
    }

    const genre = prompt("Enter genre:", movie.genre);

    if (genre === null) return;

    const description = prompt(
        "Enter description:", movie.description
    );

    if (description === null) return;

    movie.title = title.trim();
    movie.year = year;
    movie.genre = genre.trim();
    movie.description = description.trim();

    saveData();
    displayMovies();
    alert("Movie updated successfully!");
}

// Delete movie
function deleteMovie(id) {

    if (!confirm("Delete this movie and its reviews?")) return;

    movies = movies.filter(movie => movie.id !== id);

    reviews = reviews.filter(review => review.movieId !== id);

    saveData();
    displayMovies();
    updateReviewDropdowns();

    alert("Movie deleted successfully!");
}

// ==========================================
// VIEWER MANAGEMENT
// ==========================================

function addViewer() {

    const name = document.getElementById("viewerName").value.trim();

    const email = document.getElementById("viewerEmail")
        .value.trim().toLowerCase();

    if (!name || !email) {
        alert("Enter viewer name and email.");
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert("Enter a valid email address.");
        return;
    }

    if (viewers.some(v => v.email.toLowerCase() === email)) {
        alert("This viewer is already registered.");
        return;
    }

    viewers.push({
        id: newId(),
        name,
        email
    });

    saveData();

    document.getElementById("viewerName").value = "";
    document.getElementById("viewerEmail").value = "";

    displayViewers();
    updateReviewDropdowns();

    alert("Viewer registered successfully!");
}

function displayViewers() {

    const list = document.getElementById("viewerList");

    list.innerHTML = "";

    if (viewers.length === 0) {
        list.innerHTML = "<p>No registered viewers.</p>";
        return;
    }

    viewers.forEach(viewer => {

        const count = reviews.filter(
            r => r.viewerId === viewer.id
        ).length;

        list.innerHTML += `
            <div class="card">

                <h3>👤 ${safe(viewer.name)}</h3>

                <p>${safe(viewer.email)}</p>

                <p>Reviews submitted: ${count}</p>

                <button onclick="editViewer('${viewer.id}')">
                    Edit
                </button>

                <button onclick="deleteViewer('${viewer.id}')">
                    Delete
                </button>

            </div>
        `;
    });
}

function editViewer(id) {

    const viewer = viewers.find(v => v.id === id);

    if (!viewer) return;

    const name = prompt("Enter viewer name:", viewer.name);

    if (name === null) return;

    const email = prompt("Enter viewer email:", viewer.email);

    if (email === null) return;

    const cleanEmail = email.trim().toLowerCase();

    if (!name.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        alert("Enter valid viewer details.");
        return;
    }

    if (viewers.some(v =>
        v.id !== id && v.email.toLowerCase() === cleanEmail
    )) {
        alert("Email already registered.");
        return;
    }

    viewer.name = name.trim();
    viewer.email = cleanEmail;

    saveData();
    displayViewers();

    alert("Viewer updated!");
}

function deleteViewer(id) {

    if (!confirm("Delete this viewer and all their reviews?")) return;

    viewers = viewers.filter(v => v.id !== id);

    reviews = reviews.filter(r => r.viewerId !== id);

    saveData();
    displayViewers();
    updateReviewDropdowns();

    alert("Viewer deleted successfully!");
}

// ==========================================
// REVIEW AND RATING MANAGEMENT
// ==========================================

function updateReviewDropdowns() {

    const movieSelect = document.getElementById("reviewMovie");
    const viewerSelect = document.getElementById("reviewViewer");

    movieSelect.innerHTML = movies.map(movie => `
        <option value="${movie.id}">
            ${safe(movie.title)}
        </option>
    `).join("");

    viewerSelect.innerHTML = viewers.map(viewer => `
        <option value="${viewer.id}">
            ${safe(viewer.name)}
        </option>
    `).join("");
}

function addReview() {

    const movieId = document.getElementById("reviewMovie").value;

    const viewerId = document.getElementById("reviewViewer").value;

    const rating = Number(
        document.getElementById("reviewRating").value
    );

    const text = document.getElementById("reviewText").value.trim();

    if (!movieId || !viewerId) {
        alert("Please add a movie and register a viewer first.");
        return;
    }

    if (!text) {
        alert("Please write a review.");
        return;
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        alert("Rating must be between 1 and 5.");
        return;
    }

    // DUPLICATE REVIEW PREVENTION
    const duplicate = reviews.find(review =>
        review.movieId === movieId &&
        review.viewerId === viewerId
    );

    if (duplicate) {

        alert(
            "Duplicate review rejected! This viewer has already reviewed this movie. Please edit the existing review."
        );

        return;
    }

    reviews.push({
        id: newId(),
        movieId,
        viewerId,
        rating,
        text,
        date: new Date().toLocaleDateString()
    });

    saveData();

    document.getElementById("reviewText").value = "";

    displayReviews();
    displayMovies();

    alert("Review submitted successfully!");
}

// Average rating calculation
function getAverageRating(movieId) {

    const movieReviews = reviews.filter(
        r => r.movieId === movieId
    );

    if (movieReviews.length === 0) return 0;

    const total = movieReviews.reduce(
        (sum, r) => sum + Number(r.rating), 0
    );

    return total / movieReviews.length;
}

// Edit existing review
function editReview(id) {

    const review = reviews.find(r => r.id === id);

    if (!review) return;

    const rating = prompt(
        "Enter new rating (1-5):",
        review.rating
    );

    if (rating === null) return;

    const newRating = Number(rating);

    if (!Number.isInteger(newRating) ||
        newRating < 1 || newRating > 5) {
        alert("Rating must be between 1 and 5.");
        return;
    }

    const text = prompt("Edit your review:", review.text);

    if (text === null || !text.trim()) {
        alert("Review cannot be empty.");
        return;
    }

    // Update existing record, not a new record
    review.rating = newRating;
    review.text = text.trim();

    saveData();
    displayReviews();
    displayMovies();

    alert("Review updated successfully!");
}

// Delete review
function deleteReview(id) {

    if (!confirm("Delete this review?")) return;

    reviews = reviews.filter(r => r.id !== id);

    saveData();
    displayReviews();
    displayMovies();

    alert("Review deleted!");
}

// ==========================================
// DUPLICATE RECORD DETECTION
// ==========================================

function displayReviews() {

    const list = document.getElementById("reviewList");

    const warning = document.getElementById("duplicateWarning");

    list.innerHTML = "";
    warning.innerHTML = "";

    const groups = new Map();

    reviews.forEach(review => {

        const key = review.viewerId + "_" + review.movieId;

        if (!groups.has(key)) {
            groups.set(key, []);
        }

        groups.get(key).push(review);
    });

    const duplicates = new Set();

    groups.forEach(group => {

        if (group.length > 1) {
            group.forEach(review => duplicates.add(review.id));
        }
    });

    if (duplicates.size > 0) {

        warning.innerHTML = `
            <div class="warning">
                ⚠ WARNING: ${duplicates.size} duplicate review records
                detected. Please review the flagged records.
            </div>
        `;
    }

    if (reviews.length === 0) {
        list.innerHTML = "<p>No reviews available.</p>";
        return;
    }

    reviews.forEach(review => {

        const movie = movies.find(
            m => m.id === review.movieId
        );

        const viewer = viewers.find(
            v => v.id === review.viewerId
        );

        const flagged = duplicates.has(review.id);

        list.innerHTML += `
            <div class="review">

                <h3>${safe(movie?.title || "Unknown Movie")}</h3>

                <p><b>Viewer:</b>
                    ${safe(viewer?.name || "Unknown Viewer")}
                </p>

                <p class="stars">
                    ${"★".repeat(review.rating)}
                    ${"☆".repeat(5 - review.rating)}
                </p>

                <p>${safe(review.text)}</p>

                <p><small>${safe(review.date || "")}</small></p>

                ${flagged ? `
                    <div class="warning">
                        ⚠ DUPLICATE RECORD
                    </div>
                ` : ""}

                <button onclick="editReview('${review.id}')">
                    Edit Review
                </button>

                <button onclick="deleteReview('${review.id}')">
                    Delete Review
                </button>

            </div>
        `;
    });
}

// ==========================================
// DASHBOARD
// ==========================================

function updateDashboard() {

    document.getElementById("movieCount").textContent =
        movies.length;

    document.getElementById("viewerCount").textContent =
        viewers.length;

    document.getElementById("reviewCount").textContent =
        reviews.length;

    const total = reviews.reduce(
        (sum, review) => sum + Number(review.rating), 0
    );

    const average = reviews.length
        ? total / reviews.length
        : 0;

    document.getElementById("averageRating").textContent =
        average.toFixed(1);
}

// Initial loading
updateDashboard();
updateReviewDropdowns();
displayMovies();
displayViewers();
displayReviews();
