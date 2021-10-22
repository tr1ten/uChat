var socket = io();
var rid;
var askUmodal = new bootstrap.Modal(document.querySelector('.modal'))
countSpan = document.querySelector('.countuser')
if (askUname) {
    askUmodal.show();

}
sendBtn = document.querySelector('.send')
msgInput = document.querySelector('.msg')
msgInput.addEventListener('keyup', function (e) {
    if (e.keyCode === 13) {
        e.preventDefault();
        sendBtn.click();
    }
})
socket.on(`left-user-${document.cookie.split('=')[1]}`, (uname) => {

    countSpan.textContent = (parseInt(countSpan.textContent) - 1).toString();
    console.log('user left',rid)
    const liElement = document.createElement('li')
    const p = document.createElement('p')
    p.textContent = uname + " soynara~";
    p.style.color = 'red';
    liElement.appendChild(p);
    liElement.classList.add('notify');
    liElement.classList.add('list-group-item')
    const parentul = document.querySelector('.chat-box ul');
    parentul.appendChild(liElement);
    parentul.scrollTop = parentul.scrollHeight;

})

socket.on(`join-user-${document.cookie.split('=')[1]}`, (uname) => {
    countSpan.textContent = (parseInt(countSpan.textContent) + 1).toString();

    console.log('user join',rid);
    const liElement = document.createElement('li')
    const p = document.createElement('p')
    p.textContent = uname + " konichiwaaa!!";
    p.style.color = 'green';
    liElement.appendChild(p);
    liElement.classList.add('notify');
    liElement.classList.add('list-group-item')
    const parentul = document.querySelector('.chat-box ul');
    
    parentul.appendChild(liElement);
    parentul.scrollTop = parentul.scrollHeight;

})
socket.on(roomid, (msg) => {

    const liElement = document.createElement('li');
    const p = document.createElement('p')
    p.textContent = msg;
    liElement.appendChild(p);
    liElement.classList.add(msg.split(':')[0].trim()==uname? 'outmsg' : 'inmsg');
    liElement.classList.add('list-group-item')
    const parentul = document.querySelector('.chat-box ul');
    
    parentul.appendChild(liElement);
    parentul.scrollTop = parentul.scrollHeight;


})
sendBtn.addEventListener('click', () => {
    message = msgInput.value;
    if (message) {
        socket.emit(roomid, message);
    }
    msgInput.value = '';

})
