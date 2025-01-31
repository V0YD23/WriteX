package routes

import (
	"encoding/json"
	"fmt"
	"net/http"
	"writex/structs"
	"writex/writer"
)

// Create a writer and save it via HTTP route
func CreateWriterHandler(w http.ResponseWriter, r *http.Request) {
	// Parse the body of the request to extract the writer's address
	var requestBody structs.PublicKeyRequest
	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, fmt.Sprintf("Failed to parse request body: %v", err), http.StatusBadRequest)
		return
	}

	writerAddress := requestBody.Address
	if writerAddress == "" {
		http.Error(w, "Missing 'address' in request body", http.StatusBadRequest)
		return
	}

	// Create a new writer using the provided address
	newWriter, err := writer.NewWriter(writerAddress)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to create writer: %v", err), http.StatusInternalServerError)
		return
	}

	// Send a success response with writer details
	w.WriteHeader(http.StatusCreated)
	// Set the response header to indicate JSON content type
	w.Header().Set("Content-Type", "application/json")

	// Encode the map with StealthAddress into JSON and send the response
	json.NewEncoder(w).Encode(map[string]interface{}{
		"stealthAddress": newWriter.StealthAddress,
	})
}
