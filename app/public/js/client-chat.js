const socketClient = io();
const queryString = location.search;
const params = Qs.parse(queryString, { ignoreQueryPrefix: true });
const { room, username } = params;

document.getElementById("app__title").innerHTML = room;

socketClient.emit("Client-joined-room", { room, username });

socketClient.on("Server-updated-user-list", (userList) => {
    let contentHtml = '';
    userList.map((user) => {
        contentHtml += `<li class="app__item-user">${user.username}</li>`;
    });
    document.getElementById("app__list-user--content").innerHTML = contentHtml;
})

document.getElementById("form-messages").addEventListener("submit", (e) => {
    e.preventDefault();
    const messageText = document.getElementById("input-messages").value;
    // https://socket.io/docs/v3/emitting-events/#acknowledgements
    const acknowledgements = (errors) => {
        if (errors) return alert('tin nhắn không hợp lệ');
        console.log('bạn đã gửi tin nhắn thành công');
    }
    socketClient.emit("Client-sent-message", messageText, acknowledgements);
})

socketClient.on("Server-sent-message", (message) => {
    const { createAt, messageText, username } = message;
    let htmlContent = document.getElementById("app_messages").innerHTML;
    htmlContent += `
        <div class="message-item">
            <div class="message__row1">
                <p class="message__name">${username}</p>
                <p class="message__date">${createAt}</p>
            </div>
        <div class="message__row2">
            <p class="message__content">${messageText}</p>
        </div>`;
    document.getElementById("app_messages").innerHTML = htmlContent;
    document.getElementById("input-messages").value = "";
});

document.getElementById("btn-share-location").addEventListener('click', () => {
    if (!navigator.geolocation) return alert("trình duyệt không hỗ trợ tìm vị trí")
    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        socketClient.emit("Client-shared-location", { latitude, longitude });
    })
});

socketClient.on("Server-shared-location", (data) => {
    const { createAt, messageText, username } = data;
    let htmlContent = document.getElementById("app_messages").innerHTML;
    htmlContent += `
        <div class="message-item">
            <div class="message__row1">
                <p class="message__name">${username}</p>
                <p class="message__date">${createAt}</p>
            </div>
            <div class="message__row2">
                <p class="message__content">
                    <a target="_blank" href="${messageText}">Vị trí của ${username}</a>
                </p>
            </div>
        </div>`;
    document.getElementById("app_messages").innerHTML = htmlContent;
});