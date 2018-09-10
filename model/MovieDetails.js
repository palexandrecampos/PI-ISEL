'use strict'

function MovieDetails(movieDetails, movieCredits){
    this.tagline = movieDetails.tagline
    this.id = movieDetails.id
    this.title = movieDetails.title
    this.overview = movieDetails.overview
    this.image = movieDetails.poster_path
    this.cast = movieCredits.cast
    if(movieCredits.crew)
        this.directors = movieCredits.crew.filter(p => p.job === 'Director')
}

module.exports = MovieDetails