package blockchain

import "fmt"

func PrintBCData(pinataHash string, Key string, proof string) error {
	fmt.Println(pinataHash)
	fmt.Println(Key)
	fmt.Println(proof)
	return nil
}
