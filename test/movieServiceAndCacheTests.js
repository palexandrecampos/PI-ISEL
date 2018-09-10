'use strict'

const fs = require('fs')

const endpoints = {
    'https://api.themoviedb.org/3/movie/294?api_key=4b6a555b752a208b4829150d5ee35767':
        fs.readFileSync('./test/movie294.json').toString(),
    'https://api.themoviedb.org/3/movie/294/credits?api_key=4b6a555b752a208b4829150d5ee35767':
        fs.readFileSync('./test/movie294Credits.json').toString(),
    'https://api.themoviedb.org/3/search/movie?api_key=4b6a555b752a208b4829150d5ee35767&query=furious&page=1':
        fs.readFileSync('./test/movieNameFurious.json').toString(),
    'https://api.themoviedb.org/3/person/12835?api_key=4b6a555b752a208b4829150d5ee35767':
        fs.readFileSync('./test/actor12835.json').toString(),
    'https://api.themoviedb.org/3/person/12835/movie_credits?api_key=4b6a555b752a208b4829150d5ee35767':
        fs.readFileSync('./test/actor12835Credits.json').toString(),
}

const mov = require('./../services/movieService')(reqToFile)
let countRequest = 0

function reqToFile(path, cb) {
    countRequest++
    const data = endpoints[path]
    if (!data) return cb(new Error('No mock file for path ' + path))
    cb(null, {statusCode: 200}, data)
}

module.exports = {
    testGetMovie,
    testGetMovieByName,
    testGetActor,
    testMovieCache,
    testActorCache
}

function testGetMovieByName(test) {
    mov.getMovieByName('furious', 1, (err, movies) => {
        if (err)
            test.ifError(err)
        else {
            test.equal(movies.results[0].title, 'Furious 7')
        }
        test.done()
    })
}

function testGetMovie(test) {
    mov.getMovie(294, (err, movie) => {
        if (err)
            test.ifError(err)
        else {
            test.equal(movie.title, 'Desert Hearts')
            test.equal(movie.cast[0].character, 'Vivian Bell')
        }
        test.done()
    })
}

function testGetActor(test) {
    mov.getActor(12835, (err, actor) => {
        if (err)
            test.ifError(err)
        else {
            test.equal(actor.name, 'Vin Diesel')
            test.equal(actor.cast[0].character, 'Shane Wolf')
        }
        test.done()
    })
}

function testMovieCache(test) {
    mov.getMovie(294, (err, movie) => {
        if (err)
            test.ifError(err)
        else {
            test.equal(countRequest, 5)
        }
        test.done()
    })
}

function testActorCache(test) {
    mov.getActor(12835, (err, actor) => {
        if (err)
            test.ifError(err)
        else {
            test.equal(countRequest, 5)
        }
        test.done()
    })
}

