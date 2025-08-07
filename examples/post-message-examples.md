# POST Request Examples for SellSpark Chat

## Main Application URL
- **Chat Interface**: `http://localhost:5000`

## API Endpoints

### 1. Simple Chat Send (Recommended)
```bash
curl -X POST http://localhost:5000/api/chat/send \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello from external system!",
    "isUser": false
  }'
```

### 2. Create a User Message
```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello from external system!",
    "isUser": true
  }'
```

### 3. Create a Bot Message
```bash
curl -X POST http://localhost:5000/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is a bot response from external system",
    "isUser": false
  }'
```

## 3. JavaScript/Fetch Example

```javascript
// Send a message via JavaScript
const response = await fetch('/api/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    content: 'Message from JavaScript',
    isUser: false
  })
});

const message = await response.json();
console.log('Created message:', message);
```

## 4. Python Example

```python
import requests

url = "http://localhost:5000/api/messages"
data = {
    "content": "Message from Python script",
    "isUser": False
}

response = requests.post(url, json=data)
print(response.json())
```

## 5. Message Schema

Required fields:
- `content` (string) - The message text
- `isUser` (boolean) - true for user messages, false for bot messages

Auto-generated fields:
- `id` - Auto-generated unique identifier
- `timestamp` - Auto-generated timestamp

## 6. Response Format

Success response (201 Created):
```json
{
  "id": 1,
  "content": "Your message here",
  "isUser": false,
  "timestamp": "2025-01-17T12:00:00.000Z"
}
```

Error response (400 Bad Request):
```json
{
  "error": "Invalid message data",
  "details": [
    {
      "path": ["content"],
      "message": "Required"
    }
  ]
}
```