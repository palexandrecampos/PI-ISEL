'use strict'


const dbUsers = 'http://127.0.0.1:5984/user_database'
const dbComments = 'http://127.0.0.1:5984/comment_database'

module.exports = init

function init(dataSource) {
    const request = dataSource
        ? dataSource
        : require('request')


    const services = {
        'createComment': createComment,
        'getPaginateCommentsFromMovie': getPaginateCommentsFromMovie,
        'getAllCommentsFromMovie': getAllCommentsFromMovie,
        'getCommentsFromUser': getCommentsFromUser,
        'createReply': createReply,
        'getRepliesFromComment': getRepliesFromComment,
        'getRepliesFromUser': getRepliesFromUser

    }

    return services

    function createComment(comment, user, cb) {
        let path = dbComments
        let options = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(comment)
        }
        request(path, options, (err, res, body) => {
            if (err) return cb(err)
            const obj = JSON.parse(body)
            if (res.statusCode === 409) {
                return cb(null, null, 'That comment already exists!')
            }
            user.comments.push(obj.id)
            path = dbUsers + '/' + user.username
            options = {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(user)
            }
            request(path, options, (err, res, body) => {
                if (err) return cb(err)
                path = dbComments + '/' + obj.id
                options = {
                    method: 'GET',
                }
                request(path, options, (err, res, body) => {
                    if (err) return cb(err)
                    cb(null, JSON.parse(body))
                })
            })
        })
    }

    function getPaginateCommentsFromMovie(movieId, page, cb) {
        const comments_per_page = 2
        const skip = (page) * comments_per_page
        let path = dbComments + `/_all_docs?include_docs=true&limit=${comments_per_page}&skip=${skip}`
        let options = {
            method: 'GET',
        }
        request(path, options, (err, res, body) => {
            if (err) return cb(err)
            const obj = JSON.parse(body)
            const commentsFromMovie = []
            if (obj.rows) {
                obj.rows.forEach(comment => {
                    if (comment.doc.movieId === movieId && !comment.doc.commentFather) {
                        commentsFromMovie.push(comment.doc)
                    }
                })
                cb(null, commentsFromMovie)
            }
            else cb(null, [])
        })
    }


    function getAllCommentsFromMovie(movieId, cb) {
        let path = dbComments + '/_all_docs?include_docs=true'
        let options = {
            method: 'GET',
        }
        request(path, options, (err, res, body) => {
            if (err) return cb(err)
            const obj = JSON.parse(body)
            const commentsFromMovie = []
            if (obj.rows) {
                obj.rows.forEach(comment => {
                    if (comment.doc.movieId === movieId && !comment.doc.commentFather) {
                        commentsFromMovie.push(comment.doc)
                    }
                })
                cb(null, commentsFromMovie)
            }
            else cb(null, [])
        })
    }

    function getCommentsFromUser(username, cb) {
        let path = dbUsers + '/' + username
        let options = {
            method: 'GET',
        }
        request(path, options, (err, res, body) => {
            if (err) return cb(err)
            const obj = JSON.parse(body)
            const paths = []
            if (obj.comments.length !== 0) {
                obj.comments.forEach(commentId => {
                    path = dbComments + '/' + commentId
                    paths.push(path)
                })
                httpGetParallelRequest(paths, (err, comments) => {
                    if (err) return cb(err)
                    cb(null, comments)
                })
            } else cb(null, [])
        })
    }

    function createReply(reply, cb) {
        let path = dbComments
        let options = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(reply)
        }
        request(path, options, (err, res, body) => {
            if (err) return cb(err)
            const rep = JSON.parse(body)
            if (res.statusCode === 409) {
                return cb(null, null, 'That reply already exists!')
            }
            path = dbComments + '/' + reply.commentFather
            options = {
                method: 'GET',
            }
            request(path, options, (err, res, body) => {
                if (err) return cb(err)
                const obj = JSON.parse(body)
                if (obj.replys) {
                    obj.replys.push(rep.id)
                }
                path = dbComments + '/' + reply.commentFather
                options = {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(obj)
                }
                request(path, options, (err, res, body) => {
                    if (err) return cb(err)
                    path = dbUsers + '/' + reply.username
                    options = {
                        method: 'GET',
                    }
                    request(path, options, (err, res, body) => {
                        if (err) return cb(err)
                        const user = JSON.parse(body)
                        user.replys.push(rep.id)
                        path = dbUsers + '/' + reply.username
                        options = {
                            method: 'PUT',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify(user)
                        }
                        request(path, options, (err, res, body) => {
                            if (err) return cb(err)
                            cb(null, rep)
                        })
                    })
                })
            })
        })
    }

    function getRepliesFromComment(commentFather, movieId, cb) {
        let path = dbComments + '/' + commentFather
        let options = {
            method: 'GET',
        }
        request(path, options, (err, res, body) => {
            if (err) return cb(err)
            const obj = JSON.parse(body)
            const paths = []
            if (obj.replys.length !== 0) {
                obj.replys.forEach(reply => {
                    path = dbComments + '/' + reply
                    paths.push(path)
                })
                httpGetParallelRequest(paths, (err, replies) => {
                    if (err) return cb(err)
                    cb(null, replies)
                })
            }
            else cb(null, [])
        })
    }

    function getRepliesFromUser(username, cb) {
        let path = dbUsers + '/' + username
        let options = {
            method: 'GET',
        }
        request(path, options, (err, res, body) => {
            if (err) return cb(err)
            const obj = JSON.parse(body)
            const paths = []
            if (obj.replys.length !== 0) {
                obj.replys.forEach(replyId => {
                    path = dbComments + '/' + replyId
                    paths.push(path)
                })
                httpGetParallelRequest(paths, (err, replies) => {
                    if (err) return cb(err)
                    cb(null, replies)
                })
            } else cb(null, [])
        })
    }

    function httpGetParallelRequest(paths, cb) {
        let count = 0, arr = []
        let errorReturned = false
        const options = {
            method: 'GET',
        }
        paths.forEach((path, i) => {
            request(path, options, (err, res, body) => {
                if (err && !errorReturned) {
                    errorReturned = true
                    return cb(err)
                }
                arr[i] = JSON.parse(body)
                if (++count === paths.length) {
                    cb(null, arr)
                }
            })
        })
    }
}

