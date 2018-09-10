'use strict'

const fs = require('fs')

const endpoints = {
    PUT: {
        'http://127.0.0.1:5984/user_database/pa' : fs.readFileSync('./test/files/users/createUser.json').toString()
    },
    GET: {
        'http://127.0.0.1:5984/user_database/ze' : fs.readFileSync('./test/files/users/getUser.json').toString()
    }
}

module.exports = {
    testCreateUser,
    testGetUser
}

const userService = require('./../services/userService')(reqToFile)

function reqToFile(path, options, cb) {
    let data = endpoints[options.method][path]
    if (!data) return cb(new Error(`No mock file for ${options.method} path`))
    cb(null, {statusCode: 200}, data)
}

function testCreateUser(test) {
    const user = {
        username: 'pa',
        password: '',
        name: '',
        mail: ''
    }
    userService.createUser(user.username, user.password, user.name, user.mail, (err, user, info) => {
        if (err)
            test.ifError(err)
        else {
            test.equal(user.username, 'pa')
        }
        test.done()
    })
}

function testGetUser(test) {
    const user = {
        username: 'ze',
        password: '123',
    }
    userService.getUser(user.username, user.password, (err, user) => {
        if (err)
            test.ifError(err)
        else {
            test.equal(user._rev, '1-a509068e6dc0131f3a4f60f929c4f665')
        }
        test.done()
    })
}