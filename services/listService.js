'use strict'


const dbUsers = 'http://127.0.0.1:5984/user_database'
const dbLists = 'http://127.0.0.1:5984/list_database'
const List = require('../model/List')


module.exports = init

function init(dataSource) {
    const request = dataSource
        ? dataSource
        : require('request')


    const services = {
        'createList': createList,
        'getPaginateListsFromUser': getPaginateListsFromUser,
        'getAllListsFromUser': getAllListsFromUser,
        'getMoviesFromList': getMoviesFromList,
        'addMovieToList': addMovieToList,
        'deleteList': deleteList,
        'deleteMovieFromList': deleteMovieFromList,
        'updateListName': updateListName,
        'changeListVisibility': changeListVisibility,
        'getPublicLists': getPublicLists,
        'addUserPermission': addUserPermission
    }

    return services


    function createList(list, user, cb) {
        let path = dbLists
        let options = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(list)
        }
        request(path, options, (err, res, body) => {
            if (err) return cb(err)
            const obj = JSON.parse(body)
            if (res.statusCode === 409) {
                return cb(null, null, 'That list already exists!')
            }
            user.lists.push(obj.id)
            path = dbUsers + '/' + user.username
            options = {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(user)
            }
            request(path, options, (err, res, body) => {
                if (err) return cb(err)
                cb(null, obj)
            })
        })
    }

    function getPaginateListsFromUser(user, page, cb) {
        const lists_per_page = 4
        const skip = (page - 1) * lists_per_page
        let path = dbLists + `/_all_docs?include_docs=true&limit=${lists_per_page}&skip=${skip}`
        const listsPaginate = {totalPages: '', listUser: user.username, actualPage: page}
        let options = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({keys: user.lists})
        }
        request(path, options, (err, res, body) => {
            if (err) return cb(err)
            const obj = JSON.parse(body)
            const lists = []
            if (obj.rows) {
                obj.rows.forEach(list => {
                    lists.push(list.doc)
                })
                listsPaginate.totalPages = Math.floor(obj.rows.length / lists_per_page) + 1
            }
            cb(null, lists, listsPaginate)
        })
    }

    function getAllListsFromUser(user, cb) {
        let path = dbLists + '/_all_docs?include_docs=true'
        let options = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({keys: user.lists})
        }
        request(path, options, (err, res, body) => {
            if (err) return cb(err)
            const obj = JSON.parse(body)
            const lists = []
            if (obj.rows) {
                obj.rows.forEach(list => {
                    lists.push(list.doc)
                })
            }
            cb(null, lists)
        })
    }

    function getMoviesFromList(listId, user, cb) {
        let path = dbLists + '/' + listId
        let options = {
            method: 'GET',
        }
        request(path, options, (err, res, body) => {
            if (err) return cb(err)
            const obj = JSON.parse(body)
            if (user.username === obj.username || obj.invitedUsers.find(element => element.user === user.username) || obj.publicFlag === "true") {
                return cb(null, obj)
            }
            const error = {
                status: '404',
                message: `Invalid List for user ${user.username}`
            }
            cb(error, null)
        })
    }

    function addMovieToList(listId, user, movie, cb) {
        let path = dbLists + '/' + listId
        let options = {
            method: 'GET',
        }
        request(path, options, (err, res, body) => {
            if (err) return cb(err)
            const obj = JSON.parse(body)
            obj.movies.push(movie)
            path = dbLists + '/' + listId
            options = {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(obj)
            }
            request(path, options, (err, res, body) => {
                if (err) return cb(err)
                cb(null, obj)
            })
        })
    }

    function deleteList(listToRemoveId, user, cb) {
        let path = dbLists + '/' + listToRemoveId
        let options = {
            method: 'GET',
        }
        request(path, options, (err, res, body) => {
                if (err) return cb(err)
                const list = JSON.parse(body)
                path = dbLists + '/' + listToRemoveId + '?rev=' + list._rev
                options = {
                    method: 'DELETE',
                }
                request(path, options, (err, res, body) => {
                    if (err) return cb(err)
                    let index = user.lists.findIndex(list => list === listToRemoveId)
                    user.lists.splice(index, 1)
                    path = dbUsers + '/' + user.username
                    options = {
                        method: 'PUT',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(user)
                    }
                    request(path, options, (err, res, body) => {
                        if (err) return cb(err)
                        makeHttpParallelToDeleteListFromAllUsers(list, listToRemoveId, (err, obj) => {
                            if (err) return cb(err)
                            cb(null, obj)
                        })
                    })
                })
            }
        )
    }

    function makeHttpParallelToDeleteListFromAllUsers(list, listToRemoveId, cb) {
        let paths = []
        let usersWithListToRemove
        if (list.invitedUsers.length !== 0) {
            usersWithListToRemove = list.invitedUsers.filter(user => user.user)
            usersWithListToRemove.forEach(userInfo => {
                paths.push(dbUsers + '/' + userInfo.user)
            })
            httpGetParallelRequest(paths, (err, users) => {
                if (err) return cb(err)
                let countUsers = 0
                if (users.length !== 0) {
                    paths = []
                    users.forEach(element => {
                        let index = element.lists.findIndex(listToToRemove => listToToRemove === listToRemoveId)
                        countUsers++
                        if (index !== -1) {
                            element.lists.splice(index, 1)
                        }
                    })
                    let path = dbUsers + '/_bulk_docs'
                    let options = {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({docs: users})
                    }
                    request(path, options, (err, res, body) => {
                        if (err) return cb(err)
                        if (countUsers === users.length) {
                            cb(null, users)
                        }
                    })
                } else cb(null, users)
            })
        } else cb(null, list)
    }


    function deleteMovieFromList(listId, movieToRemoveId, cb) {
        let path = dbLists + '/' + listId
        let options = {
            method: 'GET',
        }
        request(path, options, (err, res, body) => {
            if (err) return cb(err)
            const list = JSON.parse(body)
            list.movies.forEach((movie, i) => {
                if (movie.id === movieToRemoveId)
                    list.movies.splice(i, 1)
            })
            path = dbLists + '/' + list._id
            options = {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(list)
            }
            request(path, options, (err, res, body) => {
                if (err) return cb(err)
                cb(null, list)
            })
        })
    }

    function updateListName(newListName, listId, cb) {
        let path = dbLists + '/' + listId
        let options = {
            method: 'GET',
        }
        request(path, options, (err, res, body) => {
            if (err) return cb(err)
            const list = JSON.parse(body)
            list.name = newListName
            options = {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(list)
            }
            request(path, options, (err, res, body) => {
                if (err) return cb(err)
                cb(null, list)
            })
        })
    }

    function changeListVisibility(username, listId, type, cb) {
        let path = dbLists + '/' + listId
        let options = {
            method: 'GET'
        }
        request(path, options, (err, resp, body) => {
            let list = JSON.parse(body)
            makeHttpParallelToDeleteListFromAllUsers(list, listId, (err, obj) => {
                if (err) return cb(err)
                list.publicFlag = type
                list.invitedUsers = []
                options = {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(list)
                }
                request(path, options, (err, res, body) => {
                    if (err) return cb(err)
                    cb(null, list)
                })
            })

        })
    }

    function getPublicLists(cb) {
        let path = dbLists + `/_all_docs?include_docs=true`
        let options = {
            method: 'GET'
        }
        request(path, options, (err, res, body) => {
            if (err) return cb(err)
            const lists = JSON.parse(body)
            let publicLists = []
            if (lists.rows) {
                lists.rows.forEach(element => {
                    if (element.doc.publicFlag === 'true') {
                        publicLists.push(element.doc)
                    }
                })
                cb(null, publicLists)
            }
            else cb(null, publicLists)
        })
    }

    function addUserPermission(currentUser, userToInvite, listId, permission, cb) {
        let path = dbLists + '/' + listId
        let options = {
            method: 'GET'
        }
        request(path, options, (err, res, body) => {
            if (err) return cb(err)
            const list = JSON.parse(body)
            let index = list.invitedUsers.findIndex(element => element.user === userToInvite)
            if (index !== -1)
                list.invitedUsers[index].permission = permission
            else list.invitedUsers.push({user: userToInvite, permission: permission})
            path = dbLists + '/' + listId
            options = {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(list)
            }
            request(path, options, (err, res, body) => {
                if (err) return cb(err)
                path = dbUsers + '/' + userToInvite
                options = {
                    method: 'GET'
                }
                request(path, options, (err, res, body) => {
                    if (err) return cb(err)
                    const invitedUser = JSON.parse(body)
                    let existListInUser = invitedUser.lists.findIndex(listToAdd => listToAdd === listId)
                    if (list.invitedUsers.find(element => element.user === invitedUser.username) && existListInUser === -1) {
                        invitedUser.lists.push(listId)
                        path = dbUsers + '/' + userToInvite
                        options = {
                            method: 'PUT',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify(invitedUser)
                        }
                        request(path, options, (err, res, body) => {
                            if (err) return cb(err)
                            cb(null, invitedUser)
                        })
                    }
                    else cb(null, invitedUser)
                })
            })
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