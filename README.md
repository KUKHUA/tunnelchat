# TunnelChat
TunnelChat is a chat website that operates without using WebSockets. Instead, it uses Server-Sent Events (SSE) to send real-time updates from the server to the clients and simple post requests to send messages to the server. The backend is written in Go and the backend is is available [here](https://github.com/KUKHUA/txttunnel).

## Features
- **Server-Sent Events (SSE)**: Utilizes SSE for real-time updates from the server to the clients.
- **Markdown Support**: Supports markdown rendering for messages.
- **File Uploads**: Allows users to share files with other users.
- **Chat Rooms**: Users can create and join chat rooms.

## Libraries
- Marked.js for markdown rendering [Marked.js](https://marked.js.org)
- DomPurify for sanitizing HTML [DomPurify](https://cure53.de/purify)

## License
This project is licensed under Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0) license. For more information, see the [LICENSE](LICENSE) file.