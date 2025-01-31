package address

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
)

// Secret key to be used for HMAC. This key should be kept secure and not hardcoded in production.
var secretKey = []byte("your-secret-key")

func CreateOnAppAddress(writerPublicKey string) (string, error) {
	// Create HMAC hash of the writerPublicKey using SHA256
	hmacHash := hmac.New(sha256.New, secretKey)
	_, err := hmacHash.Write([]byte(writerPublicKey))
	if err != nil {
		return "", fmt.Errorf("failed to create HMAC hash: %v", err)
	}

	// Get the resulting HMAC hash
	hashedAddress := hmacHash.Sum(nil)

	// Encode the hash as a hex string and return it
	return fmt.Sprintf("0x%s", hex.EncodeToString(hashedAddress)), nil
}
