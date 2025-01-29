package structs

import "go.mongodb.org/mongo-driver/bson/primitive"

type Writer struct {
	ID             primitive.ObjectID `bson:"_id,omitempty"`   // Unique ID for the document        // Unique User ID (e.g., from your user database)
	PublicKey      string             `bson:"public_key"`      // Public key of the writer (used to generate stealth address)
	StealthAddress string             `bson:"stealth_address"` // One-time stealth address generated for the writer
	CreatedAt      primitive.DateTime `bson:"created_at"`      // Timestamp of address creation
}
