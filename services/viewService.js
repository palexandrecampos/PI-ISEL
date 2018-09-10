'use strict'

const path = require('path')

module.exports = configureHandlebars

function configureHandlebars(hbs) {

    hbs.registerPartials(path.join(__dirname, '../views/partials'))

    hbs.registerHelper('getPrevious', function (page, name) {
        if (parseInt(page) - 1 >= 1) {
            page = parseInt(page) - 1
            return new hbs.SafeString('<li class="page-item"><a class="page-link" href="/search?name=' + name + '&page=' + page + '">Previous</a></li>')
        }
    })

    hbs.registerHelper('getNext', function (page, name, totalPages) {
        if (parseInt(page) + 1 <= totalPages) {
            page = parseInt(page) + 1
            return new hbs.SafeString('<li class="page-item"><a class="page-link" href="/search?name=' + name + '&page=' + page + '">Next</a></li>')
        }
    })

    hbs.registerHelper('getFirstPage', function (name) {
        return new hbs.SafeString('<li class="page-item"><a class="page-link" href="/search?name=' + name + '&page=1">First</a>\'</li>')
    })

    hbs.registerHelper('getLastPage', function (name, totalPages) {
        return new hbs.SafeString('<li class="page-item"><a class="page-link" href="/search?name=' + name + '&page=' + totalPages + '">Last</a></li>')
    })

    hbs.registerHelper('getPreviousListPage', function (actualPage, listUser) {
        if (parseInt(actualPage) - 1 >= 1) {
            actualPage = parseInt(actualPage) - 1
            return new hbs.SafeString('<li class="page-item"><a class="page-link" href="/' + listUser + '/lists?page=' + actualPage + '">Previous</a></li>')
        }
    })

    hbs.registerHelper('getNextListPage', function (actualPage, listUser, totalPages) {
        if (parseInt(actualPage) + 1 <= totalPages) {
            actualPage = parseInt(actualPage) + 1
            return new hbs.SafeString('<li class="page-item"><a class="page-link" href="/' + listUser + '/lists?page=' + actualPage + '">Next</a></li>')
        }
    })

    hbs.registerHelper('getFirstListPage', function (listUser) {
        return new hbs.SafeString('<li class="page-item"><a class="page-link" href="/' + listUser + '/lists?page=1">First</a>\'</li>')
    })

    hbs.registerHelper('getLastListPage', function (listUser, totalPages) {
        return new hbs.SafeString('<li class="page-item"><a class="page-link" href="/' + listUser + '/lists?page=' + totalPages + '">Last</a></li>')
    })

    hbs.registerHelper('showButtonToMakePublicOrPrivate', function (publicFlag, listId, ownerUser, currentUser) {
        if (ownerUser === currentUser) {
            let flag = publicFlag === 'true' ? 'false' : 'true'
            let visibility = publicFlag === 'true' ? 'Make List Private!' : 'Make List Public!'
            return new hbs.SafeString(`<button onclick="changePageVisibility('${flag}', '${listId}', '${ownerUser}')"
                            class="btn btn-dark btn-block mt-2"> ${visibility}
                    </button>`)
        }
    })

    hbs.registerHelper('showButtonToRemoveList', function (ownerUser, listId, currentUser) {
        if (ownerUser === currentUser)
            return new hbs.SafeString(`<button onclick="removeList('${ownerUser}', '${listId}')">
                                        <span class="fa fa-trash-o fa-2x"></span>
                                        </button>
                                        <input name="newListName" id="newListName${listId}" class="form-control mt-2"
                                            placeholder="New List Name:">
                                        <button onclick="changeListName('${listId}', '${ownerUser}')"
                                            class="btn btn-secondary btn-block mt-2">Edit Name
                                        </button>`
            )
    })

    hbs.registerHelper('showBtnToAddMovieIfHadPermission',
        function (currentUser, movieName, movieImage, movieId, listId, invitedUsers, listOwner, listName) {
            if (currentUser === listOwner || invitedUsers.find(
                    invitedUser => invitedUser.user === currentUser && invitedUser.permission === 'edit')) {
                return new hbs.SafeString(`<button onclick="addMovie('${movieName}', 'http://image.tmdb.org/t/p/w185//${movieImage}', 
                                        '${movieId}', '${listId}', '${currentUser}', '${listName}')"
                                    class="btn btn-info ml-2 mr-1">${listName}</button>`)
            }
        })

    hbs.registerHelper('showButtonToRemoveMovie', function (movieId, listId, listOwner, currentUser, invitedUsers) {
        if (listOwner === currentUser.username || invitedUsers.find(element => element.user === currentUser.username && element.permission === 'edit')) {
            return new hbs.SafeString(`<button onclick="removeMovie('${movieId}', '${listId}', '${currentUser.username}')">
                                    <span class="fa fa-trash-o fa-2x"></span>
                                    </button>`)
        }
    })

    hbs.registerHelper('showButtonToInviteUser', function (listOwner, username, listId, currentUser, publicFlag) {
        if (currentUser.username === listOwner && publicFlag === "false") {
            return new hbs.SafeString(`<tr>
                                        <td>
                                            <div class="dropdown">
                                                <button onclick="dropdownButton('${username}')" class="dropbtn">${username}</button>
                                                <div id="myDropdown${username}" class="dropdown-content">
                                                    <a onclick="addPermission('${username}', '${listId}', 'readonly')">
                                                        Invite To See List
                                                    </a>
                                                    <a onclick="addPermission('${username}', '${listId}', 'edit')">
                                                        Invite To Edit List
                                                    </a>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>`)
        }
    })
}

