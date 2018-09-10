let actualPage = 0
let numberOfComments

window.onload = function () {
    getNumberOfComments()
}

window.onscroll = function () {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        if (Math.floor(numberOfComments / 2) >= actualPage) {
            getNextComments(window.location.pathname.split('/')[2], actualPage++)
        }
    }
}

function getNumberOfComments() {
    const movieId = window.location.pathname.split('/')[2]
    const path = `/${movieId}/comments/all`
    httpAjaxRequest('GET', path, null, (err, response) => {
        if (err) return alert(err)
        numberOfComments = response.length
    })
}

function submitComment(movieId) {
    const comment = document.querySelector('.textarea')
    const data = `movieId=${movieId}&comment=${comment.value}`
    const path = `/${movieId}/comments`
    httpAjaxRequest('POST', path, data, (err, response) => {
        if (err) return alert(err)
        const firstComment = response._id
        addCommentInView(response.username, response._id, comment.value, movieId, firstComment)
        alert('Comment Added!')
    })
}

function submitReply(movieId, commentFatherId, username, firstComment, replyId) {
    let fatherId
    if (replyId === 'undefined' || !replyId) {
        fatherId = commentFatherId
    }
    else {
        fatherId = replyId
    }
    const reply = document.getElementById(`commentId${firstComment}`).getElementsByClassName('textarea')[0]
    const data = `movieId=${movieId}&comment=${reply.value}&commentFather=${fatherId}`
    const path = `/${movieId}/${fatherId}/replies`
    httpAjaxRequest('POST', path, data, (err, response) => {
        if (err) return alert(err)
        addReplyInView(reply.value, fatherId, username, movieId, response.id, firstComment)
    })
}

function getReplies(movieId, commentFather) {
    const path = `/${movieId}/${commentFather}/replies`
    httpAjaxRequest('GET', path, null, (err, response) => {
        if (err) return alert(err)
        addRepliesInView(response)
    })
}

function getNextComments(movieId, page) {
    const path = `/${movieId}/comments?page=${page}`
    httpAjaxRequest('GET', path, null, (err, response) => {
        if (err) return alert(err)
        addCommentsInView(response)
    })
}

function addCommentsInView(comments) {
    const divComment = document.getElementById('commentsList')
    comments.forEach(comment => {
        const element = document.createElement('div')
        element.setAttribute('id', `commentId${comment._id}`)
        element.setAttribute('class', 'row')
        element.innerHTML = `<div class="media">
                        <a href="/${comment.username}/lists">
                            <img class="mr-3" src="/images/user_icon_placeholder.png">
                        </a>
                        <div class="media-body">
                            <h5 class="mt-0">${comment.username}
                                <button id="commentBoxToRemove"
                                    onclick="addCommentBox('${comment.movieId}', '${comment._id}', '${comment.username}', '${comment._id}')"
                                    type="button">
                                    Reply
                                    <span class="fa fa-reply"></span>
                                </button>
                                <button id="buttonToCheckCommentsForCommentId{{_id}}"
                                    onclick="getReplies('${comment.movieId}', '${comment._id}')" type="button">
                                    See Comments
                                    <span class="fa fa-comments"></span>
                                </button>
                            </h5>${comment.text}
                        <div id="toAddReply${comment._id}"></div>
                    </div>
                </div>
            </div>`
        divComment.appendChild(element)
    })
}

function addRepliesInView(replies) {
    replies.forEach(reply => {
        const commentsList = document.getElementById(`toAddReply${reply.commentFather}`)
        const divMedia = document.createElement('div')
        divMedia.setAttribute('class', 'media mt-2 pl-5')
        divMedia.innerHTML = `<div class="media mt-2 pl-5">
                    <a class="mr-3" href="/${reply.username}/lists">
                        <img src="/images/user_icon_placeholder.png">
                    </a>
                    <div class="media-body">
                        <h5 class="media-heading">${reply.username}
                            <button id="commentBoxToRemove"
                                    onclick="addReplyBox('${reply.movieId}', '${reply.commentFather}', '${reply.username}', '${reply._id}')"
                                    type="button">
                                Reply
                                <span class="fa fa-reply"></span>
                            </button>
                            <button id="buttonToCheckCommentsForCommentId${reply._id}"
                                    onclick="getReplies('${reply.movieId}', '${reply._id}')" type="button">
                                See Comments
                                <span class="fa fa-comments"></span>
                            </button>
                        </h5>${reply.replyText}
                        <div id="toAddReply${reply._id}" class="row mt-1"></div>
                    </div>
                </div>`
        commentsList.appendChild(divMedia)
    })
}

function removeCommentBox(commentFatherId) {
    const commentFather = document.getElementById(`commentId${commentFatherId}`)
    const divCommentBox = commentFather.getElementsByClassName('row mt-2')[0]
    commentFather.removeChild(divCommentBox)
}

function addCommentBox(movieId, commentFatherId, username, firstComment, replyId) {
    let commentFather = document.getElementById(`commentId${firstComment}`)
    const divCommentBox = document.createElement('div')
    divCommentBox.setAttribute('class', 'row mt-2')
    divCommentBox.innerHTML = `<div class="media">
            <div class="media-content">
                <div class="field">
                    <p class="control">
                        <textarea id="commentBoxWidth" class="textarea" placeholder="Add a Comment..."></textarea>
                    </p>
                </div>
                <div class="field">
                    <p class="control">
                        <button onclick="submitReply('${movieId}', '${commentFatherId}', '${username}', '${firstComment}')" class="button">Post Comment
                        </button>
                    </p>
                </div>
            </div>
        </div>
        <div id="toAddReply${commentFatherId}" class="row mt-1"></div>`
    commentFather.appendChild(divCommentBox)
}

function addReplyBox(movieId, commentFatherId, username, firstComment, replyId) {
    let commentFather = document.getElementById(`commentId${firstComment}`)
    const divCommentBox = document.createElement('div')
    divCommentBox.setAttribute('class', 'row mt-2')
    divCommentBox.innerHTML = `<div class="media">
            <div class="media-content">
                <div class="field">
                    <p class="control">
                        <textarea id="commentBoxWidth" class="textarea" placeholder="Add a reply..."></textarea>
                    </p>
                </div>
                <div class="field">
                    <p class="control">
                        <button onclick="submitReply('${movieId}', '${commentFatherId}', '${username}', '${firstComment}', '${replyId}')" class="button">Post reply
                        </button>
                    </p>
                </div>
            </div>
        </div>
        <div id="toAddReply${replyId}" class="row mt-1"></div>`
    commentFather.appendChild(divCommentBox)
}

function addCommentInView(username, commentId, comment, movieId, firstComment) {
    const commentsList = document.getElementById('commentsList')
    const divRow = document.createElement('div')
    divRow.setAttribute('id', `commentId${commentId}`)
    const divCommentBox = document.createElement('div')
    divCommentBox.setAttribute('class', 'media')
    divCommentBox.innerHTML = `<a href="/${username}/lists">
                    <img class="mr-3" src="/images/user_icon_placeholder.png">
                </a>
                <div class="media-body">
                    <h5 class="mt-0">${username}
                        <button id="commentBoxToRemove"
                                onclick="addReplyBox('${movieId}','${commentId}', '${username}','${firstComment}')" type="button">
                            Reply
                            <span class="fa fa-reply"></span>
                        </button>
                    </h5>${comment}
                <div id="toAddReply${commentId}"></div>
                </div>`
    divRow.appendChild(divCommentBox)
    commentsList.appendChild(divRow)
}

function addReplyInView(reply, commentFatherId, username, movieId, replyId, firstComment) {
    const commentsList = document.getElementById(`toAddReply${commentFatherId}`)
    const divMedia = document.createElement('div')
    divMedia.setAttribute('class', 'media mt-2 pl-5')
    divMedia.innerHTML = `<a class="mr-3" href="/${username}/lists">
                        <img src="/images/user_icon_placeholder.png">
                    </a>
                    <div class="media-body">
                        <h5 class="mt-0">${username}
                            <button id="commentBoxToRemove"
                                    onclick="addReplyBox('${movieId}','${commentFatherId}', '${username}', '${firstComment}', '${replyId}')"
                                    type="button">
                                Reply
                                <span class="fa fa-reply"></span>
                            </button>
                        </h5>${reply}
                        <div id="toAddReply${replyId}"></div>
                    </div>
                </div>`
    commentsList.appendChild(divMedia)
    removeCommentBox(firstComment)
    alert('Reply Added!')
}

function httpAjaxRequest(method, path, data, cb) {
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
            else if (xhr.status === 401) {
                window.location.replace('/login')
            }

            else
                cb(new Error(xhr.status + ': ' + xhr.responseText), null)
        }
    }
    xhr.send(data)
}