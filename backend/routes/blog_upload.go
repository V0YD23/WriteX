package routes

import (
	"encoding/json"
	"fmt"
	"net/http"
	"writex/blockchain"
	"writex/ipfs"
	"writex/structs"
	zksnark "writex/zkSnark"
)

func BlogUpload(w http.ResponseWriter, r *http.Request) {
	// Decode the request body into the BlogUpload struct
	var requestBody structs.BlogUpload
	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, fmt.Sprintf("Failed to parse request body: %v", err), http.StatusBadRequest)
		return
	}

	// Create the blog struct from the request data
	blog := structs.Blog{
		Author:  requestBody.Author,
		Content: requestBody.Content,
	}

	// Generate the zk-SNARK proof for the blog
	proof := zksnark.GenerateProof(blog)

	// Upload the blog content to Pinata and get the IPFS hash (CID)
	pinataHash, err := ipfs.UploadToPinata(requestBody.Content, requestBody.Title)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to upload blog content to IPFS: %v", err), http.StatusInternalServerError)
		return
	}

	// Print the data to the blockchain
	err = blockchain.PrintBCData(pinataHash, requestBody.Author, proof)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to store data on blockchain: %v", err), http.StatusInternalServerError)
		return
	}

	// Send a success response with a message and the IPFS hash
	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	response := map[string]string{
		"message": "Blog successfully uploaded and proof generated!",
		"cid":     pinataHash, // Returning the IPFS CID (hash)
	}
	json.NewEncoder(w).Encode(response)
}
