const express = require('express')
const router = express.Router()
const mov = require('../services/movieService')()
const listService = require('../services/listService')()

module.exports = router

router.get('/movies/:movieId', (req, resp, next) => {
    mov.getMovie(req.params.movieId, (err, data) => {
        if (err) return next(err)
        if (req.isAuthenticated()) {
            listService.getAllListsFromUser(req.user, (err, lists) => {
                    if (err) return next(err)
                    data.lists = lists
                    resp.render('movieView', data)
                }
            )
        }
        else resp.render('movieView', data)
    })
})

router.get('/actors/:actorId', (req, resp, next) => {
    mov.getActor(req.params.actorId, (err, data) => {
        if (err) return next(err)
        resp.render('actorView', data)
    })
})

router.get('/search', (req, resp, next) => {
    mov.getMovieByName(req.query.name, req.query.page, (err, data) => {
        if (err) return next(err)
        resp.render('moviesByNameView', data)
    })
})

router.get('/home', (req, resp, next) => {
    resp.render('homepageView')
})

router.get('/', (req, resp, next) => {
    resp.redirect('/home')
})