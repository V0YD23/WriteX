package main

import (
	"fmt"
	"log"
	"net/http"
	"writex/models"
	"writex/routes"

	"github.com/rs/cors" // Import the cors package
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
	http.HandleFunc("/verify-blog", routes.VerifyBlog) // This is just to verify the blog using proof now

	// Enable CORS with default settings
	corsHandler := cors.Default().Handler(http.DefaultServeMux)

	// Start the server with the CORS middleware applied
	fmt.Println("Server starting on port 8000...")
	if err := http.ListenAndServe(":8000", corsHandler); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
