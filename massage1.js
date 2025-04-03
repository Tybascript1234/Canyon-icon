function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();

    let messages = JSON.parse(localStorage.getItem('messages')) || [];

    // إضافة الرسالة النصية إذا كانت موجودة
    if (message) {
        const type = document.title === 'إرسال واستقبال الرسائل والملفات' ? 'sent' : 'received';
        const messageObj = { text: message, type: type, contentType: 'text' };
        messages.push(messageObj);

        // إضافة الرسالة إلى الديف
        const messageDiv = createMessageDiv(messageObj);
        document.getElementById('messages').appendChild(messageDiv);

        messageInput.value = '';
    }

    localStorage.setItem('messages', JSON.stringify(messages));
}

// إنشاء عنصر div لعرض الرسالة
function createMessageDiv(messageObj) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message-container1');
    messageDiv.innerHTML = `
        <div class="message-text">${messageObj.text}</div>
        <div class="delete-btne" onclick="deleteMessage(this)"><ion-icon name="close-outline"></ion-icon></div>
    `;
    return messageDiv;
}

// حذف الرسالة
function deleteMessage(btn) {
    const messageDiv = btn.parentElement;
    messageDiv.remove();

    // حذف الرسالة من LocalStorage
    let messages = JSON.parse(localStorage.getItem('messages')) || [];
    messages = messages.filter(message => message.text !== messageDiv.querySelector('.message-text').textContent);
    localStorage.setItem('messages', JSON.stringify(messages));
}

// تحميل الرسائل من LocalStorage عند تحميل الصفحة
window.onload = function() {
    const messages = JSON.parse(localStorage.getItem('messages')) || [];
    messages.forEach(function(message) {
        const messageDiv = createMessageDiv(message);
        document.getElementById('messages').appendChild(messageDiv);
    });
}