// chat-widget.js v1.0.1 (с кастомными стилями)
(() => {
    'use strict';

    if (window.ChatWidget) {
        console.warn('Chat Widget уже загружен');
        return;
    }

    const scriptTag = document.currentScript;
    
    if (!scriptTag) {
        console.error('Chat Widget: Не удалось найти тег скрипта');
        return;
    }

    const N8N_WEBHOOK_URL = scriptTag.dataset.n8nWebhookUrl;
    const TELEGRAM_BOT_URL = scriptTag.dataset.telegramUrl;
    const CSS_URL = scriptTag.dataset.cssUrl || scriptTag.src.replace(/[^/]*\.js$/, 'chat-widget.css');

    if (!N8N_WEBHOOK_URL || !TELEGRAM_BOT_URL) {
        console.error("Chat Widget: 'data-n8n-webhook-url' и 'data-telegram-url' атрибуты обязательны для тега скрипта.");
        return;
    }

    const existingCSS = document.querySelector(`link[href="${CSS_URL}"]`);
    if (!existingCSS) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = CSS_URL;
        link.onerror = () => console.warn('Chat Widget: Не удалось загрузить CSS файл');
        document.head.appendChild(link);
    }

    const widgetHTML = `
        <div id="chat-widget-container">
            <button id="chat-toggle" aria-label="Открыть чат">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                </svg>
            </button>
            <div id="chat-widget" class="hidden" role="dialog" aria-labelledby="chat-header">
                <div id="chat-header" class="chat-header">Чат с ассистентом</div>
                <div id="chat-messages" role="log" aria-live="polite" aria-label="Сообщения чата"></div>
                <div id="initial-state">
                    <p>Здравствуйте! Чем могу помочь?</p>
                    <button id="start-chat-button" class="initial-button primary">Начать чат</button>
                    <button id="telegram-button" class="initial-button secondary">Перейти в Телеграм</button>
                </div>
                <form id="chat-form" class="hidden">
                    <input type="text" id="chat-input" placeholder="Введите ваше сообщение..." autocomplete="off" maxlength="1000">
                    <button type="submit" id="chat-submit" aria-label="Отправить сообщение">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    `;
    
    if (document.getElementById('chat-widget-container')) {
        console.warn('Chat Widget уже существует на странице');
        return;
    }

    const insertWidget = () => {
        document.body.insertAdjacentHTML('beforeend', widgetHTML);
        initializeWidget();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', insertWidget);
    } else {
        insertWidget();
    }

    function initializeWidget() {
        const chatToggle = document.getElementById('chat-toggle');
        const chatWidget = document.getElementById('chat-widget');
        const chatMessages = document.getElementById('chat-messages');
        const chatForm = document.getElementById('chat-form');
        const chatInput = document.getElementById('chat-input');
        const initialState = document.getElementById('initial-state');
        const startChatButton = document.getElementById('start-chat-button');
        const telegramButton = document.getElementById('telegram-button');
        
        // НОВЫЙ КОД: Получаем главный контейнер виджета
        const widgetContainer = document.getElementById('chat-widget-container');

        if (!chatToggle || !chatWidget || !chatMessages || !chatForm || !chatInput || !initialState || !startChatButton || !telegramButton || !widgetContainer) {
            console.error('Chat Widget: Не удалось найти необходимые элементы');
            return;
        }

        // НОВЫЙ КОД: Применяем кастомные стили из data-атрибута
        const customStylesJSON = scriptTag.dataset.customStyles;
        if (customStylesJSON) {
            try {
                const customStyles = JSON.parse(customStylesJSON);
                for (const [property, value] of Object.entries(customStyles)) {
                    // Убедимся, что устанавливаем только CSS переменные, чтобы избежать проблем с безопасностью
                    if (property.startsWith('--')) {
                        widgetContainer.style.setProperty(property, value);
                    } else {
                        console.warn(`Chat Widget: Пропущено некорректное свойство в data-custom-styles: ${property}. Поддерживаются только CSS переменные (начинаются с '--').`);
                    }
                }
            } catch (error) {
                console.error('Chat Widget: Ошибка парсинга JSON из data-custom-styles. Убедитесь, что это валидный JSON в одинарных кавычках с двойными кавычками внутри.', error);
            }
        }
        // КОНЕЦ НОВОГО КОДА

        let isTyping = false;
        let requestController = null;

        const scrollToBottom = () => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        };

        const addMessage = (text, sender, isHTML = false) => {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', sender);
            
            if (isHTML) {
                messageElement.innerHTML = text;
            } else {
                messageElement.textContent = text;
            }
            
            chatMessages.appendChild(messageElement);
            scrollToBottom();
        };

        const toggleTypingIndicator = (show) => {
            let indicator = document.getElementById('typing-indicator');
            if (show && !isTyping) {
                isTyping = true;
                indicator = document.createElement('div');
                indicator.id = 'typing-indicator';
                indicator.classList.add('message', 'bot');
                indicator.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
                chatMessages.appendChild(indicator);
                scrollToBottom();
            } else if (!show && indicator && isTyping) {
                isTyping = false;
                indicator.remove();
            }
        };

        const sendMessageToBot = async (message) => {
            if (requestController) {
                requestController.abort();
            }

            requestController = new AbortController();
            toggleTypingIndicator(true);

            try {
                const response = await fetch(N8N_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ message }),
                    signal: requestController.signal
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                toggleTypingIndicator(false);
                
                if (data.reply) {
                    addMessage(data.reply, 'bot');
                } else {
                    throw new Error('Пустой ответ от сервера');
                }
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.log('Запрос был отменен');
                    return;
                }
                
                console.error('Error sending message to bot:', error);
                toggleTypingIndicator(false);
                addMessage('Извините, произошла ошибка. Пожалуйста, попробуйте позже.', 'bot');
            } finally {
                requestController = null;
            }
        };

        chatToggle.addEventListener('click', () => {
            chatWidget.classList.toggle('hidden');
            if (!chatWidget.classList.contains('hidden')) {
                chatInput.focus();
            }
        });
        
        telegramButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.open(TELEGRAM_BOT_URL, '_blank', 'noopener,noreferrer');
        });
        
        startChatButton.addEventListener('click', () => {
            initialState.classList.add('hidden');
            chatForm.classList.remove('hidden');
            chatInput.focus();
            addMessage('Отлично! Спрашивайте, я готов помочь.', 'bot');
        });

        chatForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const userMessage = chatInput.value.trim();
            if (userMessage && !isTyping) {
                addMessage(userMessage, 'user');
                sendMessageToBot(userMessage);
                chatInput.value = '';
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !chatWidget.classList.contains('hidden')) {
                chatWidget.classList.add('hidden');
            }
        });

        window.ChatWidget = {
            version: '1.0.1',
            show: () => chatWidget.classList.remove('hidden'),
            hide: () => chatWidget.classList.add('hidden'),
            toggle: () => chatWidget.classList.toggle('hidden'),
            addMessage: addMessage,
            isOpen: () => !chatWidget.classList.contains('hidden')
        };

        console.log('Chat Widget успешно инициализирован');
    }
})();