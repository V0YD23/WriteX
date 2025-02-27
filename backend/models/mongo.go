package models

import (
	"context"
	"fmt"
	"log"
	"os"
	"writex/structs"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// MongoDB client and collection variables
var client *mongo.Client
var writerCollection *mongo.Collection

// InitMongoDB initializes the MongoDB connection and sets the writerCollection
func InitMongoDB() error {

	er := godotenv.Load()
	if er != nil {
		fmt.Println("Error loading .env file")
		return er
	}
	// MongoDB connection URI
	mongo_uri := os.Getenv("MONGO_URI")
	clientOptions := options.Client().ApplyURI(mongo_uri)

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

	// Get the list of databases
	databases, err := client.ListDatabases(context.TODO(), bson.M{})
	if err != nil {
		return fmt.Errorf("failed to list databases: %v", err)
	}

	dbExists := false
	// Iterate through the databases slice
	for _, db := range databases.Databases {
		if db.Name == "writeXDB" {
			dbExists = true
			break
		}
	}

	// If the database doesn't exist, create it by inserting a document
	if !dbExists {
		// We can insert a dummy document into the database to ensure it is created
		// Just insert into the "writers" collection (MongoDB will create the collection if it doesn't exist)
		_, err := client.Database("writeXDB").Collection("writers").InsertOne(context.TODO(), bson.D{{"dummy", "data"}})
		if err != nil {
			return fmt.Errorf("failed to create database and collection: %v", err)
		}
	}

	// Initialize the writerCollection
	writerCollection = client.Database("writeXDB").Collection("writers")

	return nil
}

// func FetchBlogs() error {
// 	if writerCollection == nil {
// 		return fmt.Errorf("writerCollection is not initialized")
// 	}

// 	_,err := writerCollection.
// }

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

func IsPresent(publicKey string) (string, error) {
	if writerCollection == nil {
		return "", fmt.Errorf("writerCollection is not initialized")
	}

	filter := bson.M{"public_key": publicKey}
	var result bson.M

	// Perform the query
	err := writerCollection.FindOne(context.TODO(), filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return "", fmt.Errorf("public key not found")
		}
		return "", fmt.Errorf("error finding public key: %v", err)
	}

	fmt.Println(result)

	// Extract "stealthAddress" field
	stealthAddr, exists := result["stealth_address"].(string)
	if !exists {
		return "", fmt.Errorf("stealthAddress field not found or not a string")
	}

	fmt.Println(stealthAddr)

	return stealthAddr, nil
}
