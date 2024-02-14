function search() {
    var searchType = document.getElementById("searchType").value;
    var searchCategory = document.getElementById("searchCategory").value;
    var searchTerm = document.getElementById("searchInput").value;
    var apiKey = 'APIKEYHERE'; // Replace with your TMDB API key

    // Clear previous results
    document.getElementById("results").innerHTML = "";

    if (searchCategory === "genre") {
        // Adjust the endpoint for TV genres list
        var genreListUrl = searchType === "tv"
            ? `https://api.themoviedb.org/3/genre/tv/list?api_key=${apiKey}&language=en-US`
            : `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`;

        fetch(genreListUrl)
            .then(response => response.json())
            .then(data => {
                const genre = data.genres.find(genre => genre.name.toLowerCase() === searchTerm.toLowerCase());
                if (genre) {
                    var discoverUrl = `https://api.themoviedb.org/3/discover/${searchType}?api_key=${apiKey}&sort_by=popularity.desc&with_genres=${genre.id}`;
                    fetch(discoverUrl)
                        .then(response => response.json())
                        .then(data => displayResults(data.results, searchType))
                        .catch(error => console.error('Error:', error));
                } else {
                    document.getElementById("results").innerHTML = `<div>No results found for genre ${searchTerm}.</div>`;
                }
            })
            .catch(error => console.error('Error:', error));
    } else if (searchCategory === "actor") {
        var personSearchUrl = `https://api.themoviedb.org/3/search/person?api_key=${apiKey}&query=${encodeURIComponent(searchTerm)}`;

        fetch(personSearchUrl)
            .then(response => response.json())
            .then(data => {
                if (data.results.length > 0) {
                    console.log(data.results);
                    const actorId = data.results[0].id;
                    var creditsUrl = searchType === "tv"
                        ? `https://api.themoviedb.org/3/person/${actorId}/tv_credits?api_key=${apiKey}`
                        : `https://api.themoviedb.org/3/person/${actorId}/movie_credits?api_key=${apiKey}`;

                    fetch(creditsUrl)
                        .then(response => response.json())
                        .then(data => {
                            // Filter to only include results with poster paths and limit to 8
                            const filteredResults = data.cast.filter(item => item.poster_path).slice(0, 8);
                            displayResults(filteredResults, searchType);
                        })
                        .catch(error => console.error('Error:', error));
                } else {
                    document.getElementById("results").innerHTML = `<div>No results found for actor ${searchTerm}.</div>`;
                }
            })
            .catch(error => console.error('Error:', error));
    } else if (searchCategory === "keyword") { // Handle keyword search
        var keywords = searchTerm.split(',').map(keyword => keyword.trim());
        var keywordIds = [];
    
        // Fetch keyword IDs for each keyword
        Promise.all(keywords.map(keyword => {
            var keywordSearchUrl = `https://api.themoviedb.org/3/search/keyword?api_key=${apiKey}&query=${encodeURIComponent(keyword)}`;
            return fetch(keywordSearchUrl)
                .then(response => response.json())
                .then(data => {
                    if (data.results.length > 0) {
                        keywordIds.push(data.results[0].id);
                    }
                });
        }))
        .then(() => {
            // Construct discover URL with multiple keyword IDs
            var discoverUrl = searchType === "tv" 
                ? `https://api.themoviedb.org/3/discover/tv?api_key=${apiKey}&sort_by=popularity.desc&with_keywords=${keywordIds.join(',')}`
                : `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=popularity.desc&with_keywords=${keywordIds.join(',')}`;
            
            fetch(discoverUrl)
                .then(response => response.json())
                .then(data => {
                    console.log(data); // Log the response
                    // Filter to only include results with poster paths and limit to 8
                    const filteredResults = data.results.filter(item => item.poster_path).slice(0, 8);
                    displayResults(filteredResults, searchType);
                })
                .catch(error => console.error('Error:', error));
        })
        .catch(error => console.error('Error:', error));
    }
    else {
        // Search by title for both movies and series
        var url = `https://api.themoviedb.org/3/search/${searchType}?api_key=${apiKey}&query=${encodeURIComponent(searchTerm)}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                // Filter to only include results with poster paths and limit to 8
                const filteredResults = data.results.filter(item => item.poster_path).slice(0, 8);
                displayResults(filteredResults, searchType);
            })
            .catch(error => console.error('Error:', error));
    }
}

function displayResults(results, searchType) {
    var container = document.getElementById("results");
    container.innerHTML = ""; // Clear previous results

    // Create row containers
    var row1 = document.createElement("div");
    row1.classList.add("row");
    var row2 = document.createElement("div");
    row2.classList.add("row");

    results.forEach((item, index) => {
        var title = searchType === "tv" ? item.name : item.title;
        var poster = `https://image.tmdb.org/t/p/w500/${item.poster_path}`;

        var card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
            <div class="card-image">
                <img src="${poster}" alt="${title}">
            </div>
            <div class="card-title">
                <p>${title}</p>
            </div>
        `;

        // Append the card to the first or second row based on index
        if (index < 4) {
            row1.appendChild(card);
        } else {
            row2.appendChild(card);
        }
    });

    // Append the rows to the container if they contain cards
    if (row1.hasChildNodes()) {
        container.appendChild(row1);
    }
    if (row2.hasChildNodes()) {
        container.appendChild(row2);
    }
}





