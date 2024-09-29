# TunnelChat

TunnelChat is a chat website that operates without using WebSockets. Instead, it leverages TXTtunnel for communication between clients, which functions like a shared text file accessible by multiple clients. This project is a proof of concept and is not intended for production use.

## Features

- **No WebSockets**: Communication is handled without WebSockets, offering a unique approach to real-time messaging.
- **In-Memory Database**: The backend database is stored in memory. Once the backend application is stopped, all messages are lost, ensuring no long-term data retention.
- **Low Persistence**: Only the latest message is stored on the server. Expired messages (when the tunnel has not been used in 5 minutes) are removed within at most 10 minutes, ensuring minimal data storage.

## How It Works

TunnelChat utilizes a Go backend server to handle chat messages. The server provides an HTTP endpoint that clients can use to send and receive messages. It only requires "GET" requests for reading and writing messages, using URL parameters for all communication. Messages are stored in memory using BadgerDB. You can find the TXTtunnel project here: [TXTtunnel](https://github.com/KUKHUA/txttunnel). It literally just requests this "file" repeatedly.

## Limitations

- **Scalability**: Due to its reliance on a single text file for communication, TunnelChat is not suitable for high-traffic environments.
- **Security**: The lack of authentication and encryption means that TunnelChat is not secure for sensitive communications.
- **Persistence**: Messages are not stored persistently and are lost when the server stops or when they expire.

## Use Cases

TunnelChat is ideal for:

- **Educational Purposes**: Demonstrating alternative methods of real-time communication.
- **Proof of Concept**: Exploring the feasibility of non-WebSocket-based chat systems.
- **Small-Scale Projects**: Simple chat applications where security and scalability are not primary concerns.

## Contributing

Contributions are welcome! If you have ideas for improving TunnelChat or fixing issues, please open a pull request or submit an issue on GitHub.

## License
 This project is lincesed under Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0) license. For more information, see the [LICENSE](LICENSE) file.