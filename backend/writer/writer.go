package writer

import (
	"fmt"
	"time"
	add "writex/address"
	"writex/models"
	"writex/structs"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

func NewWriter(publicKey string) (*structs.Writer, error) {
	stealthAddress, err := add.CreateOnAppAddress(publicKey)
	if err != nil {
		return nil, err
	}

	writer := &structs.Writer{
		ID:             primitive.NewObjectID(),
		PublicKey:      publicKey,
		StealthAddress: stealthAddress,
		CreatedAt:      primitive.NewDateTimeFromTime(time.Now()),
	}

	err = SaveWriter(writer)
	if err != nil {
		return nil, err
	}

	return writer, nil
}

func IsWriterPresent(publicKey string) (string, bool) {
	result, err := models.IsPresent(publicKey)
	if err != nil {
		return "", false
	}
	return result, true
}

// SaveWriter saves the current writer instance to the MongoDB collection
func SaveWriter(w *structs.Writer) error {
	// Call the SaveWriter function from the models package to insert the writer into the database
	err := models.SaveWriter(w)
	if err != nil {
		return fmt.Errorf("could not save writer: %v", err)
	}

	return nil
}
