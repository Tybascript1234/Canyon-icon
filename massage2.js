        // إرسال الرسالة
        function sendMessage() {
            const messageInput = document.getElementById('messageInput');
            const message = messageInput.value.trim();

            if (message) {
                const messageObj = { text: message, type: 'received', contentType: 'text', timestamp: Date.now() };
                addMessageToStorage(messageObj);
                displayMessage(messageObj);
                messageInput.value = '';
            }
        }

        // إضافة الرسالة إلى التخزين المحلي
        function addMessageToStorage(messageObj) {
            let messages = JSON.parse(localStorage.getItem('messages')) || [];
            messages.push(messageObj);
            localStorage.setItem('messages', JSON.stringify(messages));
        }

        // عرض الرسالة على الصفحة
        function displayMessage(messageObj) {
            const messageDiv = createMessageDiv(messageObj);
            document.getElementById('messages').appendChild(messageDiv);
            
            // حذف الرسالة بعد مرور ساعة
            setTimeout(function() {
                deleteMessageDiv(messageDiv);
            }, 3600000); // 3600000 مللي ثانية = ساعة واحدة
        }

        // إنشاء عنصر div لعرض الرسالة
        function createMessageDiv(messageObj) {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message-container');
            messageDiv.innerHTML = `
                <div class="mass">
                    <div class="message-text">${messageObj.text}</div>
                </div>
            `;
            return messageDiv;
        }

        // حذف عنصر div لعرض الرسالة
        function deleteMessageDiv(messageDiv) {
            messageDiv.remove();

            // حذف الرسالة من LocalStorage
            let messages = JSON.parse(localStorage.getItem('messages')) || [];
            messages = messages.filter(message => message.text !== messageDiv.querySelector('.message-text > div').textContent);
            localStorage.setItem('messages', JSON.stringify(messages));
        }

        // تحميل الرسائل من LocalStorage عند تحميل الصفحة
        window.onload = function() {
            const messages = JSON.parse(localStorage.getItem('messages')) || [];
            messages.forEach(function(message) {
                displayMessage(message);
            });
        }