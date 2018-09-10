'use strict'

const User = require('../model/User')
const dbUsers = 'http://127.0.0.1:5984/user_database'

module.exports = init

function init(dataSource) {
    const request = dataSource
        ? dataSource
        : require('request')

    const services = {
        'find': find,
        'getUser': getUser,
        'createUser': createUser,
        'getAllUsers': getAllUsers
    }

    return services

    function find(username, cb) {
        const path = dbUsers + '/' + username
        request(path, (err, res, body) => {
            if (err) return cb(err)
            cb(null, JSON.parse(body))
        })
    }


    function getUser(username, password, cb) {
        const path = dbUsers + '/' + username
        const options = {
            method: 'GET',
        }
        request(path, options, (err, res, body) => {
            if (err) return cb(err)
            if (res.statusCode !== 200) return cb(null, null, `User ${username} does not exists`)
            const user = JSON.parse(body)
            if (password !== user.password) return cb(null, null, 'Invalid password')
            cb(null, user)
        })
    }

    function createUser(username, password, name, mail, cb) {
        let user = new User(username, password, name, mail)
        const path = dbUsers + '/' + user.username
        const options = {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(user)
        }
        request(path, options, (err, res, body) => {
            if (err) return cb(err)
            if (res.statusCode === 409) {
                return cb(null, null, 'That username is already registered!')
            }
            cb(null, user, null)
        })
    }

    function getAllUsers(currentUser, currentList, cb) {
        let path = dbUsers + `/_all_docs?include_docs=true`
        let options = {
            method: 'GET'
        }
        request(path, options, (err, res, body) => {
            if (err) return cb(err)
            const obj = JSON.parse(body)
            const usersWithoutCurrentUser = []
            if (obj.rows) {
                const aux = obj.rows.filter(user => user.doc.username !== currentUser.username &&
                    user.doc.username !== currentList.username)
                aux.forEach(element => usersWithoutCurrentUser.push(element.doc))
                cb(null, usersWithoutCurrentUser)
            }
            else cb(null, [])

        })
    }
}