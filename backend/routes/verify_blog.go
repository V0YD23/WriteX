package routes

import (
	"encoding/json"
	"fmt"
	"net/http"
	"writex/ipfs"
	"writex/structs"
	zksnark "writex/zkSnark"
)

func VerifyBlog(w http.ResponseWriter, r *http.Request) {

	var reqData structs.ReadBlog

	if err := json.NewDecoder(r.Body).Decode(&reqData); err != nil {
		http.Error(w, fmt.Sprintf("Failed to parse request body: %v", err), http.StatusBadRequest)
		return
	}
	content, err := ipfs.GetDataFromPinata(reqData.BlogIpfsHash)

	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to Get Data From IPFS %v", err), http.StatusBadRequest)
		return
	}

	blog := structs.Blog{
		Content: content,
		Author:  reqData.Author,
	}
	isValid := zksnark.VerifyProof(reqData.Proof, blog)

	if !isValid {
		http.Error(w, fmt.Sprintf("Not a Valid Author or Blog %v", err), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	response := map[string]string{
		"message": "Verified Successfully !",
	}
	json.NewEncoder(w).Encode(response)

}
