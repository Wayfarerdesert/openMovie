const movieSearchBox = document.getElementById('movie-search-box');
const searchList = document.getElementById('search-list');
const resultGrid = document.getElementById('result-grid');
const watchlistContainer = document.getElementById('watchlist-container')
const historyContainer = document.getElementById('history-container');
const movieDetailsContainer = document.querySelector('.movieDetails');
// https://www.omdbapi.com/?t=spiderman&y=2007&apikey=8502611c

function reloadPage() {
    location.reload(); // Reloads the page
}

// load movies from API
async function loadMovies(searchTerm) {
    const URL = `https://www.omdbapi.com/?apikey=8502611c&s=${searchTerm}&page=1`;
    const result = await fetch(`${URL}`);
    const data = await result.json();
    // console.log(data.Search);
    if (data.Response == "True") displayMovieList(data.Search);
}

// loadMovies('batman');

function findMovies() {
    let searchTerm = (movieSearchBox.value).trim();
    if (searchTerm.length > 0) {
        movieDetailsContainer.classList.add('blurred');
        searchList.classList.remove('hide-search-list');
        loadMovies(searchTerm);
    } else {
        movieDetailsContainer.classList.remove('blurred');
        searchList.classList.add('hide-search-list');
    }
}

function displayMovieList(movies) {
    searchList.innerHTML = "";
    for (let idx = 0; idx < movies.length; idx++) {
        let movieListItem = document.createElement('div');
        movieListItem.dataset.id = movies[idx].imdbID;
        movieListItem.classList.add('search-list-item');
        if (movies[idx].Poster != "N/A")
            moviePoster = movies[idx].Poster;
        else
            moviePoster = "./assets/no-image.webp";

        movieListItem.innerHTML = `
            <div class="search-item-thumbnail">
                <img src="${moviePoster}">
            </div>
            <div class="search-item-info">
                <h3>${movies[idx].Title}</h3>
                <p>${movies[idx].Year}</p>
            </div>
        `;
        searchList.appendChild(movieListItem);
    }
    loadMovieDetails();
};

function loadMovieDetails() {
    const searchListMovies = searchList.querySelectorAll('.search-list-item');
    searchListMovies.forEach(movie => {
        movie.addEventListener('click', async () => {
            // console.log(movie.dataset.id);
            searchList.classList.add('hide-search-list');
            movieSearchBox.value = "";
            const result = await fetch(`https://www.omdbapi.com/?apikey=8502611c&i=${movie.dataset.id}`)

            const movieDetails = await result.json();
            // console.log(movieDetails);
            movieDetailsContainer.classList.remove('blurred');
            displayMovieDetails(movieDetails);
            searchHistory(movieDetails);
            console.log('movie details loaded')
        });
    });
}

function displayMovieDetails(details) {
    const ratingSources = [
        { name: "imdb", img: "./assets/ratings/imdb.webp" },
        { name: "rottentomatoes", img: "./assets/ratings/rottentomatoes.webp" },
        { name: "metacritic", img: "./assets/ratings/metacritic.webp" }
    ];

    let ratingsHTML = ratingSources.map((source, index) => `
        <div class="brand">
            <img src="${source.img}" alt="${source.name}" />
            <p>${details.Ratings?.[index]?.Value ?? 'N/A'}</p>
        </div>
    `).join('');

    // Check if the movie is already in the watchlist
    const isInWatchlist = userWatchlist.some(movie => movie.movieId === details.imdbID);

    const watchlistButtonHTML = isInWatchlist
        ? `<div class="removefromWtchList" id="watchlist-button"><i class="fa-solid fa-check"></i></div>`
        : `<div class="addToWtchList" id="watchlist-button"><i class="fa-solid fa-plus"></i></div>`;

    resultGrid.innerHTML = `
        <div class="movie-poster">
            ${watchlistButtonHTML}
            <img src="${(details.Poster != 'N/A') ? details.Poster : './assets/no-image.webp'}" alt="movie poster">
        </div>
        <div class="movie-info">
            <h3 class="movie-title">${details.Title}</h3>
            <p class="genre"><b></b>${details.Genre}</p>

            <ul class="movie-misc-info">
                <li class="year">${details.Year}</li>
                <li class="rating">${details.Rated}</li>
                <li class="runtime">${details.Runtime}</li>
            </ul>

            <p class="director"><b>Director: </b>${details.Director}</p>
            <p class="writer"><b>Writer: </b>${details.Writer}</p>
            <p class="actors"><b>Actors: </b>${details.Actors}</p>
            <p class="plot"><b>Plot: </b>${details.Plot}</p>
            <p class="language"><b>Language: </b>${details.Language}</p>
            <p class="awards"><b>Awards <i class="fas fa-award"></i>: </b>${details.Awards}</p>
            <p class="released">Released: ${details.Released}</p>
            <div class="ratings">
                ${ratingsHTML}
            </div>
        </div>
    `;
    console.log('Movie details rendered')

    addMovieToWatchlist(details)
};

window.addEventListener('click', (event) => {
    if (event.target.className != 'form-control') {
        searchList.classList.add('hide-search-list');
    }
});

//? Movies WatchList ========================================================================
let userWatchlist = []

function saveWatchlist() {
    localStorage.setItem('userWatchlist', JSON.stringify(userWatchlist));
}

function addMovieToWatchlist(details) {
    const watchlistButton = document.getElementById('watchlist-button');

    watchlistButton.addEventListener('click', () => {
        const isInWatchlist = userWatchlist.some(movie => movie.movieId === details.imdbID);

        if (isInWatchlist) {
            // Remove movie from the watchlist
            userWatchlist = userWatchlist.filter(movie => movie.movieId !== details.imdbID);
            console.log('Removed from watchlist:', details.Title);
            watchlistButton.innerHTML = `<i class="addToWtchList fa-solid fa-plus"></i>`;
        } else {
            // Add movie to the watchlist
            const movie = {
                movieId: details.imdbID,
                title: details.Title,
                poster: details.Poster,
                year: details.Year,
                runtime: details.Runtime,
                rated: details.Rated,
                rating: details.Ratings,
                plot: details.Plot,
                director: details.Director,
                actors: details.Actors
            };
            userWatchlist.push(movie);
            console.log('Added to watchlist:', details.Title);
            watchlistButton.innerHTML = `<i class="removefromWtchList fa-solid fa-check"></i>`;
        }

        // Save to localStorage and update the displayed watchlist
        saveWatchlist();
        renderWatchlist();
    });
}

function deleteFromWatchList(movieId) {
    userWatchlist = userWatchlist.filter(movie => movie.movieId !== movieId);
    console.log('Removed movie with ID:', movieId);

    // Update localStorage and re-render the watchlist
    saveWatchlist();
    renderWatchlist();
}


function renderWatchlist() {
    watchlistContainer.innerHTML = userWatchlist.map((movie, index) => `
        <div class="movie-thumbnail" data-movie-id="${movie.movieId}">
            <div class="info-title-wrapper">
                <div class="movie-poster">
                    <div class="removefromWtchList" id="removeButton-${movie.movieId}">
                        <i class="fa-solid fa-check"></i></div>
                    <img src="${movie.poster}" alt="movie poster" />
                </div>
                <div class="movie-info">
                    <div class="movie-title-wrapper">
                        <div class="counter">${index + 1}.</div>
                        <h4>${movie.title}</h4>
                    </div>
                    <ul class="movie-misc-info">
                        <li class="year">${movie.year}</li>
                        <li class="runtime">${movie.runtime}</li>
                        <li class="runtime">${movie.rated}</li>
                    </ul>
                    <div class="movieRating">
                        <i class="fa-solid fa-star"></i>
                        <p>${movie.rating?.[0]?.Value.split("/")[0] ?? '0.0'}</p>
                    </div>
                </div>
            </div>
            <div class="movie-info-extended">
                <p class="plot">${movie.plot}</p>
                <div class="people">
                    <p class="director"><b>Director: </b>${movie.director}</p>
                    <p class="actors"><b>Actors: </b>${movie.actors}</p>
                </div>
            </div>
        </div>
    `).join('');

    // Update the counter element with the number of titles in the watchlist
    const counterElement = document.querySelector('.counter p');
    counterElement.textContent = `${userWatchlist.length} title${userWatchlist.length !== 1 ? 's' : ''}`;

    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('removefromWtchList')) {
            const movieId = event.target.closest('.movie-thumbnail').getAttribute('data-movie-id');
            if (movieId) {
                deleteFromWatchList(movieId);
            }
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const storedWatchlist = localStorage.getItem('userWatchlist');
    if (storedWatchlist) {
        userWatchlist = JSON.parse(storedWatchlist);
        renderWatchlist();
    }
});

//? Movies WatchList ENDs

//? Movie Search History ========================================================================
let searchedMovies = [];

function renderHistory() {
    historyContainer.innerHTML = searchedMovies.slice().reverse().map(movie => `
        <div class="movie-thumbnail" data-movie-id="${movie.movieId}">
            <div class="delete-movie" data-movie-id="${movie.movieId}">X</div>
            <div class="movie-poster-history">
                <img src="${movie.poster}" alt="movie poster" />
            </div>
            <div class="movie-info">
                <h4>${movie.title}</h4>
                <p>${movie.year}</p>
            </div>
        </div>
    `).join('');
};

if (localStorage.getItem('searchedMovies')) {
    searchedMovies = JSON.parse(localStorage.getItem('searchedMovies'));
    renderHistory();
}

function searchHistory(details) {
    // Check if the required details exist and are valid
    let movieId = details.imdbID
    let poster = (details.Poster != 'N/A') ? details.Poster : './assets/no-image.webp'
    let title = details.Title
    let year = details.Year

    // Add the movie details to the searchedMovies array
    if (title !== '' && year !== '') {
        searchedMovies.push({ movieId, poster, title, year });
        // Save the updated searchedMovies array to localStorage
        localStorage.setItem('searchedMovies', JSON.stringify(searchedMovies));
    }
    // Render the history
    renderHistory();
}

function clearHistory() {
    localStorage.removeItem('searchedMovies');
    searchedMovies = [];
    renderHistory();
}

// Function to delete a specific movie from History
function deleteMovie(movieID) {
    console.log('Deleting movie with ID:', movieID);
    searchedMovies = searchedMovies.filter(movie => movie.movieId !== movieID);
    console.log('Updated searchedMovies:', searchedMovies);
    localStorage.setItem('searchedMovies', JSON.stringify(searchedMovies));
    renderHistory();
}

function rearrangeSearchHistory(movieID) {
    const movieIndex = searchedMovies.findIndex(movie => movie.movieId === movieID);
    if (movieIndex !== -1) {
        const [movie] = searchedMovies.splice(movieIndex, 1); // Remove the movie from its current position
        searchedMovies.push(movie); // Add the movie to the beginning of the array
        localStorage.setItem('searchedMovies', JSON.stringify(searchedMovies));
        renderHistory();
    }
}

// Event listener for clicks on delete buttons
window.addEventListener('click', async (event) => {
    if (event.target.classList.contains('delete-movie')) {
        const movieID = event.target.getAttribute('data-movie-id');
        // console.log('Deleting movieID:', movieID);
        deleteMovie(movieID);
    }

    if (event.target.closest('.movie-thumbnail')) {
        const movieThumbnail = event.target.closest('.movie-thumbnail');
        const movieID = movieThumbnail.getAttribute('data-movie-id');
        console.log('Fetching movieID:', movieID);
        rearrangeSearchHistory(movieID)
        const result = await fetch(`https://www.omdbapi.com/?apikey=8502611c&i=${movieID}`);
        const movieDetails = await result.json();
        displayMovieDetails(movieDetails);
    }

    if (localStorage.getItem('searchedMovies')) {
        searchedMovies = JSON.parse(localStorage.getItem('searchedMovies'));
        // console.log('Updated localStorage searchedMovies:', searchedMovies);
    }
});
//? Movie Search History ENDs
