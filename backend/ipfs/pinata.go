package ipfs

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/joho/godotenv"
)

// Pinata API URL
const pinataURL = "https://api.pinata.cloud/pinning/pinJSONToIPFS"

type PinataMetadata struct {
	Name string `json:"name"`
}

type PinataOptions struct {
	CidVersion int `json:"cidVersion"`
}

type PinataPayload struct {
	PinataContent  interface{}    `json:"pinataContent"`
	PinataMetadata PinataMetadata `json:"pinataMetadata"`
	PinataOptions  PinataOptions  `json:"pinataOptions"`
}

// GetDataFromPinata retrieves the content of the blog from IPFS using the provided IPFS hash.
func GetDataFromPinata(ipfsHash string) (string, error) {
	// Construct the URL to access the content from IPFS
	url := fmt.Sprintf("https://gateway.pinata.cloud/ipfs/%s", ipfsHash)

	// Create a GET request to the IPFS gateway
	resp, err := http.Get(url)
	if err != nil {
		return "", fmt.Errorf("failed to get data from Pinata: %v", err)
	}
	defer resp.Body.Close()

	// Check for successful status code
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("received non-OK response code: %v", resp.StatusCode)
	}

	// Read the response body (content of the blog)
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response body: %v", err)
	}

	// Convert the body to a string and return
	return string(body), nil
}

func UploadToPinata(blogContent string, blogTitle string) (string, error) {
	// Load API credentials from .env
	err := godotenv.Load()
	if err != nil {
		fmt.Println("Error loading .env file")
		return "", err
	}

	// Fetch the API Key and Secret from environment variables
	pinataAPIKey := os.Getenv("PINATA_API_KEY")
	pinataAPISecret := os.Getenv("PINATA_API_SECRET")

	if pinataAPIKey == "" || pinataAPISecret == "" {
		return "", fmt.Errorf("missing Pinata API Key or Secret")
	}

	// Creating JSON payload
	payload := PinataPayload{
		PinataContent: blogContent,
		PinataMetadata: PinataMetadata{
			Name: blogTitle,
		},
		PinataOptions: PinataOptions{
			CidVersion: 1,
		},
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequest("POST", pinataURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("pinata_api_key", pinataAPIKey)
	req.Header.Set("pinata_secret_api_key", pinataAPISecret)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	// Read response
	body, err := io.ReadAll(resp.Body) // For Go 1.16+
	if err != nil {
		return "", err
	}

	// Parse JSON response
	var result map[string]interface{}
	err = json.Unmarshal(body, &result)
	if err != nil {
		return "", err
	}

	// Get the IPFS hash from the response
	cid, ok := result["IpfsHash"].(string)
	if !ok {
		return "", fmt.Errorf("invalid response from Pinata")
	}

	fmt.Println("Uploaded to IPFS with CID:", cid)
	return cid, nil
}
