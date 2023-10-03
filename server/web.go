package main

import (
	"log"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

// Client represents a connected WebSocket client.
type Client struct {
	conn   *websocket.Conn
	send   chan []byte // Buffered channel of outbound messages.
	UserID string      // Add any client-specific properties here
}
type User struct {
	ID      string `json:"id"`
	User    string `json:"user"`
	Status  string `json:"status"`
	Message string `json:"message"`
}

var (
	clients    = make(map[*Client]bool)
	broadcast  = make(chan []byte)
	register   = make(chan *Client)
	unregister = make(chan *Client)
)

// listen handles incoming messages from a client.
func (c *Client) listen() {
	defer func() {
		unregister <- c // Send the client to be unregistered
		c.conn.Close()
	}()

	for {
		_, messageContent, err := c.conn.ReadMessage()
		if err != nil {
			log.Println(err)
			return
		}
		broadcast <- messageContent

		// handleMessage(c, messageType, messageContent)
	}
}

// send messages to the client.
func (c *Client) write() {
	for message := range c.send { //range handles reading every value sent in the channel
		w, err := c.conn.NextWriter(websocket.TextMessage)
		if err != nil {
			return
		}
		w.Write(message)

		// Add queued chat messages to the current websocket message.
		n := len(c.send)
		for i := 0; i < n; i++ {
			w.Write([]byte{'\n'})
			w.Write(<-c.send)
		}

		if err := w.Close(); err != nil {
			return
		}
	}
}

// registerClient registers a client as connected.

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	client := &Client{
		conn:   conn,
		send:   make(chan []byte, 256),
		UserID: uuid.NewString(), // Add client-specific properties if needed
	}
	// Register the client by sending it to the register channel.
	register <- client // Send the client to be registered

	go client.listen()
	go client.write()

}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

func main() {
	http.HandleFunc("/", handleWebSocket)
	go monitorClientsChannel() // Start a goroutine for receiving channel messages
	http.ListenAndServe("localhost:8080", nil)
}

func monitorClientsChannel() {
	for {
		select {
		case message := <-broadcast:
			for client := range clients {
				client.send <- message
			}
		case client := <-register:
			clients[client] = true
			user := User{ID: client.UserID, User: "", Status: "setup"}
			client.conn.WriteJSON(user) //write user struct to client

		case client := <-unregister:
			if _, ok := clients[client]; ok {
				delete(clients, client)
				close(client.send)
			}
		}
	}
}
