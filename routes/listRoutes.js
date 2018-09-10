const express = require('express')
const router = express.Router()
const listService = require('../services/listService')()
const userService = require('../services/userService')()
const commentService = require('../services/commentService')()
const List = require('../model/List')
const Movie = require('../model/Movie')

router.get('/:user/lists', function (req, res, next) {
    const ctx = {}
    const msg = req.flash('createListError')
    if (msg) ctx.createListError = {message: msg}
    if (req.isAuthenticated() && req.user.username === req.params.user) {
        listService.getPaginateListsFromUser(req.user, req.query.page, (err, lists, listsPaginate) => {
            if (err) return next(err)
            commentService.getCommentsFromUser(req.params.user, (err, comments) => {
                    if (err) return next(err)
                    commentService.getRepliesFromUser(req.params.user, (err, replies) => {
                        if (err) return next(err)
                        listService.getPublicLists((err, publicLists) => {
                            res.render('mylists', {
                                lists: lists, comments: comments,
                                replies: replies, listsPaginate: listsPaginate, publicLists: publicLists
                            })
                        })

                    })
                }
            )
        })
    }
    else res.redirect('/home')
})

router.post('/:user/lists', (req, res, next) => {
    if (!req.user) res.redirect('/login')
    if (!req.body.name) {
        req.flash('createListError', 'You need to fill all the data!')
        res.redirect('/lists')
        return
    }
    let listToCreate = new List(req.body.name, req.user.username, [], 'false', [])
    listService.createList(listToCreate, req.user, (err, list) => {
        if (err) return next(err)
        res.statusCode = 200
        res.send(list)
    })
})

router.get('/:user/listDetails/:listId', function (req, res, next) {
    if (req.isAuthenticated() && req.user.username === req.params.user) {
        listService.getMoviesFromList(req.params.listId, req.user, (err, list) => {
            if (err) return next(err)
            const movies = list.movies
            list.listId = req.params.listId
            userService.getAllUsers(req.user, list, (err, users) => {
                if (err) return next(err)
                res.render('listDetails', {movies: movies, list: list, users: users})
            })
        })
    }
    else res.redirect('/home')
})

router.get('/publicListDetails/:listId', function (req, res, next) {
    if (req.isAuthenticated()) {
        listService.getMoviesFromList(req.params.listId, req.user, (err, list) => {
            if (err) return next(err)
            const movies = list.movies
            list.listId = req.params.listId
            userService.getAllUsers(req.user, list, (err, users) => {
                if (err) return next(err)
                listService.getPublicLists((err, lists) => {
                    if (err) return next(err)
                    if (lists.find(list => list._id === req.params.listId)) {
                        res.render('listDetails', {movies: movies, list: list, users: users})
                    }
                    else {
                        res.render('error', {message:'List Non Public!'})
                    }
                })
            })
        })
    }
    else res.redirect('/home')
})

router.post('/:user/listDetails/:listId', (req, res, next) => {
    if (req.isAuthenticated() && req.user.username === req.params.user) {
        const movie = new Movie(req.body.movieId, req.body.movieName, req.body.movieImage, req.body.listName)
        listService.addMovieToList(req.params.listId, req.user, movie, (err, list) => {
            if (err) return next(err)
            const movies = list.movies
            const listName = list.name
            res.statusCode = 200
            res.render('listDetails', {movies: movies, listName: listName, list: list})
        })
    }
    else res.redirect('/home')
})

router.delete('/:user/lists', (req, res, next) => {
    if (req.isAuthenticated() && req.user.username === req.body.username) {
        listService.deleteList(req.body.listId, req.user, (err, list) => {
            if (err) return next(err)
            res.statusCode = 200
            res.send(list)
        })
    }
    else res.redirect('/login')
})

router.delete('/:user/listDetails/:listId', (req, res, next) => {
    if (req.isAuthenticated() && req.user.username === req.params.user) {
        listService.deleteMovieFromList(req.body.listId, req.body.movieId, (err, list) => {
            if (err) return next(err)
            res.sendStatus(200)
        })
    }
    else res.redirect('/login')
})

router.put('/:user/listDetails/:listId', (req, res, next) => {
    if (req.isAuthenticated() && req.user.username === req.body.username) {
        listService.updateListName(req.body.newListName, req.body.listId, (err, list) => {
            if (err) return next(err)
            res.statusCode = 200
            res.send(list)
        })
    }
    else res.redirect('/login')
})

router.put('/:user/listDetails/:listId/type', (req, res, next) => {
    if (req.isAuthenticated() && req.user.username === req.params.user) {
        listService.changeListVisibility(req.params.user, req.params.listId, req.body.listType, (err, list) => {
            if (err) return next(err)
            res.statusCode = 200
            res.send(list)
        })
    }
})

router.put('/:user/list/:listId', (req, res, next) => {
    if (req.isAuthenticated()) {
        listService.addUserPermission(req.user, req.params.user, req.params.listId, req.body.listPermission, (err, user) => {
            if (err) return next(err)
            res.statusCode = 200
            res.send(user)
        })
    }
    else res.redirect('/login')
})

router.use((req, res, next) => {
    next()
})

module.exports = router