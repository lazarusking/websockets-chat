# Websocket Chat App

This is a WebSocket-based chat application built with Go (for the server) and React (for the frontend). It allows multiple users to exchange text messages in real-time through WebSocket connections.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
  - [Server](#server)
  - [Frontend](#frontend)
- [Contributing](#contributing)

## Features

- Real-time chat: Users can send and receive text messages in real-time.
- WebSocket communication: Communication between the frontend and server is handled via WebSocket connections.
- Usernames: Users can set their usernames when joining the chat.
- Reconnection: The application supports reconnection to the server in case of connection loss.
- Typing indicator: The chat displays a typing indicator when a user is typing a message.
- Quick replies: Quick reply buttons for common phrases are available for easy message sending.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following prerequisites installed on your system:

- [Go](https://golang.org/dl/): Go programming language (for the server)
- [Node.js](https://nodejs.org/): JavaScript runtime (for the frontend)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/): Package manager for Node.js

### Installation

1. Clone the repository

2. Install server dependencies:

   ```shell
   cd server
   go mod tidy
   ```

3. Install frontend dependencies:

   ```shell
   cd frontend
   npm install   # or yarn install
   ```

## Usage

### Server

1. Start the server:

   ```shell
   cd server
   go run main.go
   ```

   The server will run on `http://localhost:8080`.

### Frontend

1. Start the frontend:

   ```shell
   cd frontend
   npm start   # or yarn start
   ```

2. Open your web browser and navigate to `http://localhost:5173` to access the chat application.

## Contributing

Feel free to contribute
