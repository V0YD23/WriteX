package models

import (
	"context"
	"fmt"
	"log"
	"writex/structs"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// MongoDB client and collection variables
var client *mongo.Client
var writerCollection *mongo.Collection

// InitMongoDB initializes the MongoDB connection and sets the writerCollection
func InitMongoDB() error {
	// MongoDB connection URI
	clientOptions := options.Client().ApplyURI("mongodb+srv://user:mongo12345@cluster0.phiye.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")

	// Establish MongoDB connection
	var err error
	client, err = mongo.Connect(context.TODO(), clientOptions)
	if err != nil {
		return fmt.Errorf("failed to connect to MongoDB: %v", err)
	}

	// Check MongoDB connection
	err = client.Ping(context.TODO(), nil)
	if err != nil {
		return fmt.Errorf("failed to ping MongoDB: %v", err)
	}

	// Initialize the writerCollection
	writerCollection = client.Database("writeXDB").Collection("writers")

	return nil
}

// SaveWriter saves a new writer's data to the MongoDB collection
func SaveWriter(writer *structs.Writer) error {
	if writerCollection == nil {
		return fmt.Errorf("writerCollection is not initialized")
	}

	_, err := writerCollection.InsertOne(context.TODO(), writer)
	if err != nil {
		return fmt.Errorf("could not insert writer: %v", err)
	}

	log.Println("Writer saved successfully!")
	return nil
}
