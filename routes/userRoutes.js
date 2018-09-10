const express = require('express')
const router = express.Router()
const userService = require('../services/userService')()
const passport = require('passport')


router.get('/login', (req, res) => {
    const ctx = {}
    const msg = req.flash('loginError')
    if (msg) ctx.loginError = {message: msg}
    res.render('loginView', ctx)
})

router.post('/login', (req, res, next) => {
    userService.getUser(req.body.username, req.body.password, (err, user, info) => {
        if (err) return next(err)
        if (!req.body.username || !req.body.password) {
            req.flash('loginError', 'You need to fill all the data!')
            res.redirect('/login')
            return
        }
        if (info) {
            req.flash('loginError', info)
            return res.redirect('/login')
        }
        req.logIn(user, (err) => {
            if (err) return next(err)
            res.redirect('/home')
        })
    })
})

router.use((req, res, next) => {
    if(req.user) res.locals.user = req.user
    next()
})

router.get('/register', (req, res) => {
    const ctx = {}
    const msg = req.flash('registerError')
    if (msg) ctx.registerError = {message: msg}
    res.render('registerView', ctx)
})

router.post('/register', function (req, res, next) {
    if (!req.body.username || !req.body.password || !req.body.name || !req.body.mail) {
        req.flash('registerError', 'You need to fill all the data!')
        res.redirect('/register')
        return
    }
    // create a new user
    userService.createUser(req.body.username, req.body.password, req.body.name, req.body.mail, (err, user, info) => {
        if (err) return next(err)
        if (info) {
            req.flash('registerError', info)
            return res.redirect('/register')
        }
        // login the new user
        req.logIn(user, function (err) {
            if (err) return next(err)
            return res.redirect(`${user.username}/lists`)
        })
    })
})

router.get('/logout', function (req, res) {
    req.logout()
    res.redirect('/home')
})

passport.serializeUser(function (user, cb) {
    cb(null, user.username)
})

passport.deserializeUser(function (username, cb) {
    userService.find(username, cb)
})

module.exports = router