function removeMovieListCard(movieId) {
    const listCards = document.getElementById('moviesListCards')
    const listCardToRemove = document.getElementById(`movieCard${movieId}`)
    listCards.removeChild(listCardToRemove)
    alert('Movie Removed!')
}

function removeMovie(movieId, listId, user) {
    const data = `listId=${listId}&movieId=${movieId}`
    const path = `/${user}/listDetails/${listId}`
    httpRequest('DELETE', path, data, (err) => {
        if (err) return alert(err)
        removeMovieListCard(movieId)
    })
}

function addMovie(movieName, movieImage, movieId, listId, username, listName) {
    const data = `movieId=${movieId}&movieName=${movieName}&movieImage=${movieImage}&listName=${listName}`
    const path = `/${username}/listDetails/${listId}`
    httpRequest('POST', path, data, (err) => {
        if (err) return alert(err)
        alert('Movie Added To List!')
    })
}

function showHideActors() {
    const e = document.getElementById('actorsLists')
    e.style.display = (e.style.display === 'block') ? 'none' : 'block'
}


function httpRequest(method, path, data, cb) {
    const xhr = new XMLHttpRequest()
    xhr.open(method, path, true)

    //Send the proper header information along with the request
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')

    xhr.onreadystatechange = function () {//Call a function when the state changes.
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200)
                cb()
            else
                cb(new Error(xhr.status + ': ' + xhr.responseText))
        }
    }
    xhr.send(data)
}