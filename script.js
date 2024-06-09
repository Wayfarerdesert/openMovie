const movieSearchBox = document.getElementById('movie-search-box');
const searchList = document.getElementById('search-list');
const resultGrid = document.getElementById('result-grid');
const historyContainer = document.getElementById('history-container');

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
        searchList.classList.remove('hide-search-list');
        loadMovies(searchTerm);
    } else {
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
            console.log(movieDetails);
            displayMovieDetails(movieDetails);
            searchHistory(movieDetails);
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

    resultGrid.innerHTML = `
        <div class="movie-poster">
            <img src="${(details.Poster != 'N/A') ? details.Poster : './assets/no-image.webp'}" alt="movie poster">
        </div>
        <div class="movie-info">
            <h3 class="movie-title">${details.Title}</h3>
            <ul class="movie-misc-info">
                <li class="year"><b>Year: </b>${details.Year}</li>
                <li class="rating">Rating: ${details.Rated}</li>
                <li class="released">Released: ${details.Released}</li>
            </ul>
            <p class="genre"><b>Genre: </b>${details.Genre}</p>
            <p class="writer"><b>Writer: </b>${details.Writer}</p>
            <p class="actors"><b>Actors: </b>${details.Actors}</p>
            <p class="plot"><b>Plot: </b>${details.Plot}</p>
            <p class="language"><b>Language: </b>${details.Language}</p>
            <p class="awards"><i class="fas fa-award">&nbsp;</i><b>Awards: </b>${details.Awards}</p>
            <div class="ratings">
                ${ratingsHTML}
            </div>
        </div>
    `;
};

window.addEventListener('click', (event) => {
    if (event.target.className != 'form-control') {
        searchList.classList.add('hide-search-list');
    }
});

//? Movie Search History
let searchedMovies = [];

function renderHistory() {
    historyContainer.innerHTML = searchedMovies.slice().reverse().map(movie => `
        <div class="movie-thumbnail">
            <div class="movie-poster">
            <img src="${movie.poster}" a.movie-info lt="movie poster" />
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
    let poster = (details.Poster != 'N/A') ? details.Poster : './assets/no-image.webp'
    let title = details.Title
    let year = details.Year

    // Add the movie details to the searchedMovies array
    if (title !== '' && year !== '') {
        searchedMovies.push({ poster, title, year });
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
