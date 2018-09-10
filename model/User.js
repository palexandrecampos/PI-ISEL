'use strict'

function User(username, password, name, mail){
    this.username = username
    this.password = password
    this.name = name
    this.mail = mail
    this.lists = []
    this.comments = []
    this.replys = []
}

module.exports = User
