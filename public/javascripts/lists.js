function removeList(username, listId) {
    const data = `username=${username}&listId=${listId}`
    const path = `/${username}/lists`
    ajaxHttpRequest('DELETE', path, data, (err, response) => {
        if (err) return alert(err)
        removeListCard(listId)
    })
}

function changePageVisibility(listType, listId, username) {
    const path = `/${username}/listDetails/${listId}/type`
    const data = `listType=${listType}`
    ajaxHttpRequest('PUT', path, data, (err, response) => {
        if (err) return alert(err)
        changeButtonToChangeListTypeAndAddOrRemoveList(listId, listType, username, response.name)
    })
}

function changeButtonToChangeListTypeAndAddOrRemoveList(listId, typeToChange, username, listName) {
    const div = document.getElementById(`buttonToChangePage${listId}`)
    let flag = typeToChange === 'true' ? 'false' : 'true'
    let visibility = typeToChange === 'true' ? 'Make List Private!' : 'Make List Public!'
    div.innerHTML = `<button onclick="changePageVisibility('${flag}', '${listId}', '${username}')"
                            class="btn btn-dark btn-block mt-2"> ${visibility}
                    </button>`
    if (flag === 'true') {
        const div = document.getElementById('divToAddRemovePublicList')
        const toRemove = document.getElementById(`publicListsCards${listId}`)
        div.removeChild(toRemove)
    }
    else {
        const div = document.getElementById('divToAddRemovePublicList')
        div.innerHTML = `<div id="publicListsCards${listId}" class="card mr-2 ml-2 mb-2 mt-2">
                <a href="/publicListDetails/${listId}">
                    <img id="sizeImage" class="card-img-top" src="/images/default_list.png">
                </a>
                <div class="card-block">
                    <h4 class="card-title">${listName}</h4>
                </div>
            </div>`
    }
}

function addList(username) {
    const div = document.querySelector('.divAddList')
    const listName = div.getElementsByClassName('form-control input-lg')[0]
    const data = `name=${listName.value}`
    const path = `/${username}/lists`
    ajaxHttpRequest('POST', path, data, (err, response) => {
        if (err) return alert(err)
        addListCard(listName.value, username, response.id)
    })
}

function changeListName(listId, username) {
    const newListName = document.getElementById(`newListName${listId}`)
    const data = `newListName=${newListName.value}&username=${username}&listId=${listId}`
    const path = `/${username}/listDetails/${listId}`
    ajaxHttpRequest('PUT', path, data, (err, response) => {
        if (err) return alert(err)
        changeListNameOnCard(newListName.value, listId)
    })
}


function addListCard(listName, username, id) {
    const div = document.createElement('div')
    div.setAttribute('id', `listsCards${id}`)
    div.setAttribute('class', 'card mr-2 ml-2 mb-2 mt-2')
    div.innerHTML = `<a href="/${username}/listDetails/${id}">
                    <img id="sizeImage" class="card-img-top" src="/images/default_list.png">
                    </a>
                    <div class="card-block">
                    <h4 class="card-title">${listName}</h4>
                    <button onclick="removeList('${username}', '${id}')">
                        <span class="fa fa-trash-o fa-2x"></span>
                    </button>
                    <input name="newListName" id="newListName${id}" class="form-control mt-2" placeholder="New List Name:">
                    <button onclick="changeListName('${id}', '${username}')" class="btn btn-secondary btn-block mt-2">Edit Name
                    </button>
                    <div id="buttonToChangePage${id}">
                    <button onclick="changePageVisibility('true', '${id}', '${username}')"
                            class="btn btn-dark btn-block mt-2"> Make List Public!
                    </button>
                    </div>
                    </div>`
    const divRemoveList = document.getElementById('divRemoveList')
    divRemoveList.appendChild(div)
}

function removeListCard(listId) {
    const divRemoveList = document.getElementById('divRemoveList')
    const divToRemove = document.getElementById(`listsCards${listId}`)
    divRemoveList.removeChild(divToRemove)
    const divPublicLists = document.getElementById('divToAddRemovePublicList')
    const divToRemovePublicList = document.getElementById(`publicListsCards${listId}`)
    if (divToRemovePublicList !== undefined)
        divPublicLists.removeChild(divToRemovePublicList)
}

function changeListNameOnCard(newListName, listId) {
    const listCard = document.getElementById(`listsCards${listId}`)
    const elementToChange = listCard.getElementsByClassName('card-title')[0]
    elementToChange.innerHTML = `<h4 class="card-title">${newListName}</h4>`
}

function addPermission(userToInvite, listId, permission) {
    const data = `listPermission=${permission}`
    const path = `/${userToInvite}/list/${listId}`
    ajaxHttpRequest('PUT', path, data, (err, response) => {
        if (err) return alert(err)
        alert(`Permission Given to ${userToInvite}!`)
    })
}

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function dropdownButton(username) {
    document.getElementById(`myDropdown${username}`).classList.toggle('show')
}

// Close the dropdown if the user clicks outside of it
window.onclick = function (event) {
    if (!event.target.matches('.dropbtn')) {

        let dropdowns = document.getElementsByClassName('dropdown-content')
        for (let i = 0; i < dropdowns.length; i++) {
            let openDropdown = dropdowns[i]
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show')
            }
        }
    }
}

function ajaxHttpRequest(method, path, data, cb) {
    const xhr = new XMLHttpRequest()
    xhr.open(method, path, true)

    //Send the proper header information along with the request
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')

    xhr.onreadystatechange = function () {//Call a function when the state changes.
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                let json = JSON.parse(xhr.responseText)
                cb(null, json)
            }

            else
                cb(new Error(xhr.status + ': ' + xhr.responseText), null)
        }
    }
    xhr.send(data)
}