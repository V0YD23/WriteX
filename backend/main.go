package main

import (
	"fmt"
	"log"
	"writex/models"
	"writex/writer"
)

func main() {
	// Initialize MongoDB connection
	err := models.InitMongoDB()
	if err != nil {
		log.Fatalf("Failed to initialize MongoDB: %v", err)
	}

	// Create a new writer and save it
	newWriter, err := writer.NewWriter("0x0ee7AF0283EA0cB89a7173875B59E64b6E4edCb0")

	if err != nil {
		log.Fatalf("Failed to save writer: %v", err)
	}

	fmt.Println(newWriter)
}
