# Чат-виджет - Подключение через CDN

## Быстрое подключение

Добавьте этот код перед закрывающим тегом `</body>` на вашем сайте:

```html
<script 
    src="https://your-cdn.com/chat-widget.js"
    data-n8n-webhook-url="https://your-n8n-webhook.com/webhook/chat"
    data-telegram-url="https://t.me/your_bot"
    data-css-url="https://your-cdn.com/chat-widget.css"
></script>
```

## Параметры подключения

### Обязательные параметры:

- `data-n8n-webhook-url` - URL вашего N8N webhook для обработки сообщений
- `data-telegram-url` - Ссылка на ваш Telegram бот

### Необязательные параметры:

- `data-css-url` - Кастомный URL для CSS файла (по умолчанию ищется рядом с JS файлом)

## Примеры подключения

### 1. Базовое подключение
```html
<script 
    src="https://cdn.jsdelivr.net/gh/yourusername/chat-widget@main/chat-widget.js"
    data-n8n-webhook-url="https://your-webhook.n8n.cloud/webhook/chat"
    data-telegram-url="https://t.me/your_support_bot"
></script>
```

### 2. С кастомными стилями
```html
<script 
    src="https://cdn.jsdelivr.net/gh/yourusername/chat-widget@main/chat-widget.js"
    data-n8n-webhook-url="https://your-webhook.n8n.cloud/webhook/chat"
    data-telegram-url="https://t.me/your_support_bot"
    data-css-url="https://your-domain.com/custom-chat-styles.css"
></script>
```

### 3. Для GitHub Pages
```html
<script 
    src="https://yourusername.github.io/chat-widget/chat-widget.js"
    data-n8n-webhook-url="https://your-webhook.n8n.cloud/webhook/chat"
    data-telegram-url="https://t.me/your_support_bot"
></script>
```

## Настройка CDN

### Вариант 1: GitHub + jsDelivr (Рекомендуется)

1. Создайте репозиторий на GitHub
2. Загрузите файлы `chat-widget.js` и `chat-widget.css`
3. Используйте jsDelivr для CDN:
   ```
   https://cdn.jsdelivr.net/gh/USERNAME/REPO@main/chat-widget.js
   https://cdn.jsdelivr.net/gh/USERNAME/REPO@main/chat-widget.css
   ```

### Вариант 2: Собственный сервер

1. Загрузите файлы на ваш сервер
2. Настройте CORS заголовки для кросс-доменных запросов:
   ```
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Methods: GET
   ```

### Вариант 3: Другие CDN провайдеры

- **unpkg**: `https://unpkg.com/your-package@version/chat-widget.js`
- **Cloudflare**: `https://cdnjs.cloudflare.com/ajax/libs/your-lib/version/chat-widget.js`
- **Amazon CloudFront**: настройте собственный CloudFront distribution

## JavaScript API

После загрузки виджета доступен глобальный объект `window.ChatWidget`:

```javascript
// Показать виджет
ChatWidget.show();

// Скрыть виджет
ChatWidget.hide();

// Переключить видимость
ChatWidget.toggle();

// Добавить сообщение программно
ChatWidget.addMessage('Привет!', 'bot');

// Проверить, открыт ли виджет
if (ChatWidget.isOpen()) {
    console.log('Виджет открыт');
}
```

## Кастомизация стилей

### CSS переменные для быстрой настройки:

```css
:root {
    --chat-primary-color: #007bff;        /* Основной цвет */
    --chat-secondary-color: #f0f4f8;      /* Вторичный цвет */
    --chat-background-color: #ffffff;     /* Фон виджета */
    --chat-text-color: #333333;           /* Цвет текста */
    --chat-bubble-bot-bg: #e9e9eb;        /* Фон сообщений бота */
    --chat-bubble-user-bg: #007bff;       /* Фон сообщений пользователя */
    --chat-bubble-user-text: #ffffff;     /* Цвет текста пользователя */
}
```

### Пример кастомизации:

```html
<style>
:root {
    --chat-primary-color: #28a745;
    --chat-bubble-user-bg: #28a745;
}
</style>
<script 
    src="https://your-cdn.com/chat-widget.js"
    data-n8n-webhook-url="https://your-webhook.com"
    data-telegram-url="https://t.me/your_bot"
></script>
```

## Безопасность

1. **HTTPS Only**: Используйте только HTTPS для всех URL
2. **CSP**: Добавьте в Content Security Policy:
   ```
   script-src 'self' https://your-cdn.com;
   style-src 'self' https://your-cdn.com 'unsafe-inline';
   ```
3. **Валидация данных**: Всегда валидируйте данные на стороне сервера (N8N webhook)

## Отладка

1. Откройте Developer Tools (F12)
2. Проверьте Console на наличие ошибок
3. Убедитесь, что все ресурсы загружаются корректно в Network tab
4. Виджет логирует "Chat Widget успешно инициализирован" при успешной загрузке

## Поддержка браузеров

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile Safari 12+
- Chrome Mobile 60+

## Лицензия

MIT License - свободно используйте в коммерческих и некоммерческих проектах.

## Версионирование

Текущая версия: 1.0.0

Для получения конкретной версии используйте:
```html
<script src="https://cdn.jsdelivr.net/gh/username/repo@v1.0.0/chat-widget.js"></script>
```