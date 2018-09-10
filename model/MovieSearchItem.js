'use strict'

function MovieSearchItem(title, id, releaseDate, voteAverage, movieImage){
    this.title = title
    this.id = id
    this.releaseDate = releaseDate
    this.voteAverage = voteAverage
    this.movieImage = movieImage
}

module.exports = MovieSearchItem