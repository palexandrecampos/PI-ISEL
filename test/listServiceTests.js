'use strict'

const fs = require('fs')

const endpoints = {
    POST: {
        'http://127.0.0.1:5984/list_database': fs.readFileSync('./test/files/lists/createList.json').toString(),
        'http://127.0.0.1:5984/list_database/_all_docs?include_docs=true': fs.readFileSync('./test/files/lists/getLists.json').toString()
    },
    PUT: {
        'http://127.0.0.1:5984/user_database/ze': fs.readFileSync('./test/files/users/getUser.json').toString(),
        'http://127.0.0.1:5984/list_database/06bb62904f4a2d6d4b5d74881f006372': fs.readFileSync('./test/files/lists/addMovieToList.json').toString(),
        'http://127.0.0.1:5984/user_database/pa': fs.readFileSync('./test/files/users/createUser.json').toString()
    },
    GET: {
        'http://127.0.0.1:5984/list_database/06bb62904f4a2d6d4b5d74881f006372':
            fs.readFileSync('./test/files/lists/getListInfo.json').toString()
    },
    DELETE: {
        'http://127.0.0.1:5984/list_database/06bb62904f4a2d6d4b5d74881f006372?rev=1-c09eb9df9ba8bc6ebed7ab703c3a1284':
            fs.readFileSync('./test/files/lists/deleteList.json').toString()
    }
}

module.exports = {
    testCreateList,
    testGetList,
    testAddMovieToList,
    testGetMoviesFromList,
    testDeleteMovieFromList
}

const listService = require('./../services/listService')(reqToFile)

function reqToFile(path, options, cb) {
    let data = endpoints[options.method][path]
    if (!data) return cb(new Error(`No mock file for ${options.method} path`))
    cb(null, {statusCode: 200}, data)
}

function testCreateList(test) {
    const list = {
        name: 'Watch',
        movies: [],
    }
    const user = {
        username: 'ze',
        password: '123',
        lists: []
    }
    listService.createList(list, user, (err, list) => {
        if (err)
            test.ifError(err)
        else {
            test.equal(list.id, '06bb62904f4a2d6d4b5d74881f00699b')
        }
        test.done()
    })
}

function testGetList(test) {

    const user = {
        username: 'ze',
        password: '123',
    }

    listService.getAllListsFromUser(user, (err, lists) => {
        if (err)
            test.ifError(err)
        else {
            test.equal(lists[0].name, 'Seen')
            test.equal(lists[0]._id, '06bb62904f4a2d6d4b5d74881f006372')
            test.equal(lists[0]._rev, '1-c09eb9df9ba8bc6ebed7ab703c3a1284')
        }
        test.done()
    })
}

function testAddMovieToList(test) {

    const user = {
        username: 'ze',
        password: '123',
    }

    const list = {
        id: '06bb62904f4a2d6d4b5d74881f006372'
    }

    const movie = {
        id: '168259',
        image: 'http://image.tmdb.org/t/p/w185///dCgm7efXDmiABSdWDHBDBx2jwmn.jpg',
        listName: 'Seen',
        name: 'Furious 7'
    }

    listService.addMovieToList(list.id, user, movie, (err, list) => {
        if (err)
            test.ifError(err)
        else {
            test.equal(list.movies[0].name, 'Furious 7')
            test.equal(list.movies[0].image, 'http://image.tmdb.org/t/p/w185///dCgm7efXDmiABSdWDHBDBx2jwmn.jpg')
            test.equal(list.movies[0].listName, 'Seen')
            test.equal(list.movies[0].id, '168259')
        }
        test.done()
    })
}

function testGetMoviesFromList(test) {

    const user = {
        username: 'ze',
        password: '123',
    }

    const list = {
        id: '06bb62904f4a2d6d4b5d74881f006372'
    }

    listService.getMoviesFromList(list.id, user, (err, list) => {
        if (err)
            test.ifError(err)
        else {
            test.equal(list.movies.length, 1)
            test.equal(list.name, 'Seen')
            test.equal(list.movies[0].name, 'Furious 7')
            test.equal(list.movies[0].image, 'http://image.tmdb.org/t/p/w185///dCgm7efXDmiABSdWDHBDBx2jwmn.jpg')
            test.equal(list.movies[0].listName, 'Seen')
            test.equal(list.movies[0].id, '168259')
        }
        test.done()
    })
}


function testDeleteMovieFromList(test) {

    const list = {
        id: '06bb62904f4a2d6d4b5d74881f006372',
        movies: [
            {
                'id': '168259',
                'name': 'Furious 7',
                'image': 'http://image.tmdb.org/t/p/w185///dCgm7efXDmiABSdWDHBDBx2jwmn.jpg',
                'listName': 'Seen'
            }
        ]
    }

    const movie = {
        id: '168259',
        image: 'http://image.tmdb.org/t/p/w185///dCgm7efXDmiABSdWDHBDBx2jwmn.jpg',
        listName: 'Seen',
        name: 'Furious 7'
    }

    listService.deleteMovieFromList(list.id, movie.id, (err, list) => {
        if (err)
            test.ifError(err)
        else {
            test.equal(list.movies.length, 0)
        }
        test.done()
    })
}
