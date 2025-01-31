package structs

import "go.mongodb.org/mongo-driver/bson/primitive"

type Writer struct {
	ID             primitive.ObjectID `bson:"_id,omitempty"`   // Unique ID for the document        // Unique User ID (e.g., from your user database)
	PublicKey      string             `bson:"public_key"`      // Public key of the writer (used to generate stealth address)
	StealthAddress string             `bson:"stealth_address"` // One-time stealth address generated for the writer
	CreatedAt      primitive.DateTime `bson:"created_at"`      // Timestamp of address creation
}

// PublicKeyRequest is the structure that holds the public key address from the request body
type PublicKeyRequest struct {
	Address string `json:"address"` // Public key of the writer
}

type Blog struct {
	Content string
	Author  string
}

type BlogUpload struct {
	Author  string `json:"key"`
	Content string `json:"content"`
	Title   string `json:"title"`
}

type ReadBlog struct {
	BlogIpfsHash string `json:"hash"`
	Proof        string `json:"proof"`
	Author       string `json:"key"`
}
