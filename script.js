const API_KEY = '30bf92e7'; 
const movieInput = document.getElementById('movieInput');
const searchBtn = document.getElementById('searchBtn');
const movieGrid = document.getElementById('movieGrid');
const sortFilter = document.getElementById('sortFilter');
const loader = document.getElementById('loader');
const placeholder = document.getElementById('placeholder');

let moviesData = [];

async function searchMovies() {
    const query = movieInput.value.trim();
    
    // Mandatory Error Handling: Empty input
    if (!query) {
        alert("Please enter a movie title!");
        return;
    }

    // Toggle UI states
    loader.classList.remove('hidden');
    placeholder.classList.add('hidden');
    movieGrid.innerHTML = '';

    try {
        const response = await fetch(`https://www.omdbapi.com/?s=${query}&apikey=${API_KEY}`);
        const data = await response.json();

        if (data.Response === "True") { 

            // Fetching details for each to get Plot, Genre, and Rating (Mandatory)
            const detailPromises = data.Search.map(movie => 
                fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${API_KEY}`).then(res => res.json())
            );
            moviesData = await Promise.all(detailPromises);
            renderMovies(moviesData);
        } else { 
            
            // Mandatory Error Handling: Movie not found
            movieGrid.innerHTML = `<p class="error-msg">Movie not found. Please try another title.</p>`;
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        loader.classList.add('hidden');
    }
}

function renderMovies(movies) {
    movieGrid.innerHTML = movies.map(movie => `
        <div class="movie-card">
            <div class="poster-wrapper">
                <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'}" alt="${movie.Title}">
                <div class="rating-badge">⭐ ${movie.imdbRating}</div>
            </div>
            <div class="movie-info">
                <h3>${movie.Title}</h3>
                <div class="movie-meta">
                    <span>${movie.Year}</span> | <span class="genre-tag">${movie.Genre.split(',')[0]}</span>
                </div>
                <p class="plot">${movie.Plot}</p>
            </div>
        </div>
    `).join('');
}

// Mandatory: Filtering/Sorting by Year or Rating
sortFilter.addEventListener('change', () => {
    let sorted = [...moviesData];
    if (sortFilter.value === 'year') {
        sorted.sort((a, b) => parseInt(b.Year) - parseInt(a.Year));
    } else if (sortFilter.value === 'rating') {
        sorted.sort((a, b) => parseFloat(b.imdbRating) - parseFloat(a.imdbRating));
    }
    renderMovies(sorted);
});

searchBtn.addEventListener('click', searchMovies);
movieInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchMovies();
});