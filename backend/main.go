package main

import (
	"fmt"
	"log"
	"net/http"
	"writex/models"
	"writex/routes"
)

func main() {
	// Initialize MongoDB connection (This can also be done in the route)
	err := models.InitMongoDB()
	if err != nil {
		log.Fatalf("Failed to initialize MongoDB: %v", err)
	}
	fmt.Println("MongoDB connected successfully!")
	// Define the HTTP routes
	http.HandleFunc("/create-writer", routes.CreateWriterHandler) // Route to create a writer
	http.HandleFunc("/blog-upload", routes.BlogUpload)
	// Start the server
	fmt.Println("Server starting on port 8000...")
	if err := http.ListenAndServe(":8000", nil); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
