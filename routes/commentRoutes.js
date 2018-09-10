const express = require('express')
const router = express.Router()
const commentService = require('../services/commentService')()
const Comment = require('../model/Comment')
const Reply = require('../model/Reply')


router.post('/:movieId/comments', (req, res, next) => {
    if (!req.user) res.redirect('/login')
    if (!req.body.comment) {
        req.flash('createListError', 'You need to fill the comment box!')
        res.redirect(`/movies/${req.body.movieId}`)
        return
    }
    let comment = new Comment(req.params.movieId, req.user.username, req.body.comment, [])
    commentService.createComment(comment, req.user, (err, comment) => {
        if (err) return next(err)
        res.statusCode = 200
        res.send(comment)
    })
})

router.get('/:movieId/comments', (req, res, next) => {
    commentService.getPaginateCommentsFromMovie(req.params.movieId, req.query.page, (err, comments) => {
        if (err) return next(err)
        res.statusCode = 200
        res.send(comments)
    })
})

router.get('/:movieId/comments/all', (req, res, next) => {
    commentService.getAllCommentsFromMovie(req.params.movieId, (err, comments) => {
        if (err) return next(err)
        res.statusCode = 200
        res.send(comments)
    })
})

router.get('/:movieId/:commentFather/replies', (req, res, next) => {
    commentService.getRepliesFromComment(req.params.commentFather, req.params.movieId, (err, replies) => {
            if (err) return next(err)
            res.statusCode = 200
            res.send(replies)
        }
    )
})

router.post('/:movieId/:commentFather/replies', (req, res, next) => {
    if (!req.user) {
        res.sendStatus(401)
    }
    if (!req.body.comment) {
        req.flash('createListError', 'You need to fill the comment box!')
        res.redirect(`/movies/${req.body.movieId}`)
        return
    }
    let reply = new Reply(req.body.movieId, req.user.username, req.body.comment, req.body.commentFather, [])
    commentService.createReply(reply, (err, reply) => {
        if (err) return next(err)
        res.statusCode = 200
        res.send(reply)
    })
})


router.use((req, res, next) => {
    next()
})

module.exports = router