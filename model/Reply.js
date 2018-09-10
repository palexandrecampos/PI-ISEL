'use strict'

function Reply(movieId, username, replyText, commentFather){
    this.movieId = movieId
    this.username = username
    this.replyText = replyText
    this.commentFather = commentFather
    this.replys = []
}

module.exports = Reply