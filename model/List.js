'use strict'

function List(name, username,movies, publicFlag, invitedUsers){
    this.name = name
    this.username = username
    this.movies = movies
    this.publicFlag = publicFlag
    this.invitedUsers = invitedUsers
}

module.exports = List
