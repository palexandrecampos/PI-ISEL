'use strict'

const MovieDetails = require('../model/MovieDetails')
const ActorDetails = require('../model/ActorDetails')
const MovieSearch = require('../model/MovieSearch')
const MovieSearchItem = require('../model/MovieSearchItem')
const fs = require('fs')
const key = fs.readFileSync('apikey.txt').toString()
const cache = require('./cacheService.js')

module.exports = init

function init(dataSource) {
    const req = dataSource
        ? dataSource
        : require('request')

    const services = {
        getMovie: cache.memoize(getMovie),
        getActor: cache.memoize(getActor),
        getMovieByName
    }
    return services

    function reqAsJson(path, cb) {
        req(path, (err, res, data) => {
            if (err || res.statusCode !== 200) return cb(
                {
                    status : res.statusCode,
                    message: 'Application Stopped'
                })
            if (res.statusCode === 200) {
                const obj = JSON.parse(data.toString())
                return cb(null, obj)
            }
        })
    }


    function getMovie(movieId, cb) {
        const pathMovieDetails = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${key}`
        const pathMovieCredits = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${key}`
        const uris = []
        uris.push(pathMovieDetails, pathMovieCredits)
        httpGetParallelRequest(uris, (err, data) => {
            if (err) return cb(err)
            const obj = new MovieDetails(data[0], data[1])
            cb(null, obj)
        })
    }


    function getActor(actorId, cb) {
        const pathActorDetails = `https://api.themoviedb.org/3/person/${actorId}?api_key=${key}`
        const pathActorMovieCredits = `https://api.themoviedb.org/3/person/${actorId}/movie_credits?api_key=${key}`
        const uris = []
        uris.push(pathActorDetails, pathActorMovieCredits)
        httpGetParallelRequest(uris, (err, data) => {
            if (err) return cb(err)
            const obj = new ActorDetails(data[0], data[1])
            cb(null, obj)
        })
    }

    function getMovieByName(name, page, cb) {
        const pathMovieByName = `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${name}&page=${page}`
        reqAsJson(pathMovieByName, (err, movies) => {
            if (err) return cb(err)
            let array = []
            movies.results.forEach(function (element) {
                array.push(new MovieSearchItem(element.title, element.id, element.release_date, element.vote_average, element.poster_path))
            })
            cb(null, new MovieSearch(array, name, page, movies.total_pages, movies.total_results))
        })
    }

    function httpGetParallelRequest(uris, cb) {
        let count = 0, arr = []
        let errorReturned = false
        uris.forEach((uri, i) => {
            reqAsJson(uri, (err, data) => {
                if (err && !errorReturned) {
                    errorReturned = true
                    return cb(err)
                }
                arr[i] = data
                if (++count === uris.length) {
                    cb(null, arr)
                }
            })
        })
    }
}