'use strict'

function Comment(movieId, username, text){
    this.movieId = movieId
    this.username = username
    this.text = text
    this.replys = []
}

module.exports = Comment