package address

import (
	"crypto/sha256"
	"fmt"
	"math/rand"
	"time"
)

func CreateOnAppAddress(writerPublicKey string) (string, error) {
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))

	//Generate a random byte slice (32 bytes long)
	randomBytes := make([]byte, 32)
	_, err := rng.Read(randomBytes)
	if err != nil {
		panic(err)
	}

	// Hash the random bytes to get a unique address-like string
	hashedAddress := sha256.Sum256(randomBytes)
	return fmt.Sprintf("0x%s", hashedAddress[:]), nil

}
