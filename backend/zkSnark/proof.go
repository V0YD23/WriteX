package zksnark

import (
	"crypto/sha256"
	"encoding/hex"
	"writex/structs"
)

func circuitFunction(blogContent string, authorStealthKey string) string {

	contentHash := sha256.Sum256([]byte(blogContent))
	keyHash := sha256.Sum256([]byte(authorStealthKey))

	finalHash := append(contentHash[:], keyHash[:]...)

	return hex.EncodeToString(finalHash)
}

func GenerateProof(blog structs.Blog) string {
	return circuitFunction(blog.Content, blog.Author)
}

func VerifyProof(proof string, originalBlog structs.Blog) bool {
	// Compute the expected proof using the same circuit function
	expectedProof := circuitFunction(originalBlog.Content, originalBlog.Author)

	// Compare the expected proof with the received proof
	return proof == expectedProof
}
