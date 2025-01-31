"use client"

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

// Contract configs remain the same
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "";
// ABI of the `newWriter` function
const CONTRACT_ABI = [
    {
      "type": "function",
      "name": "addresses",
      "inputs": [{ "name": "", "type": "string", "internalType": "string" }],
      "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "blogCount",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "blogs",
      "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "outputs": [
        { "name": "title", "type": "string", "internalType": "string" },
        { "name": "ipfsHash", "type": "string", "internalType": "string" },
        { "name": "proof", "type": "string", "internalType": "string" },
        { "name": "key", "type": "string", "internalType": "string" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getBlogs",
      "inputs": [],
      "outputs": [
        { "name": "titles", "type": "string[]", "internalType": "string[]" },
        { "name": "ipfsHashes", "type": "string[]", "internalType": "string[]" }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "newWriter",
      "inputs": [{ "name": "key", "type": "string", "internalType": "string" }],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "postBlog",
      "inputs": [
        { "name": "title", "type": "string", "internalType": "string" },
        { "name": "ipfsHash", "type": "string", "internalType": "string" },
        { "name": "key", "type": "string", "internalType": "string" },
        { "name": "proof", "type": "string", "internalType": "string" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "realBlog",
      "inputs": [{ "name": "key", "type": "string", "internalType": "string" }],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "function",
      "name": "tipWriter",
      "inputs": [{ "name": "key", "type": "string", "internalType": "string" }],
      "outputs": [],
      "stateMutability": "payable"
    },
    {
      "type": "event",
      "name": "BlogListGot",
      "inputs": [
        {
          "name": "blogCount",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "BlogStored",
      "inputs": [
        {
          "name": "title",
          "type": "string",
          "indexed": true,
          "internalType": "string"
        },
        {
          "name": "ipfsHash",
          "type": "string",
          "indexed": true,
          "internalType": "string"
        },
        {
          "name": "key",
          "type": "string",
          "indexed": false,
          "internalType": "string"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "FundsSent",
      "inputs": [
        {
          "name": "to",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "amount",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "NewWriterAdded",
      "inputs": [
        {
          "name": "key",
          "type": "string",
          "indexed": true,
          "internalType": "string"
        },
        {
          "name": "realKey",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "TipsSent",
      "inputs": [
        {
          "name": "to",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "amount",
          "type": "uint256",
          "indexed": false,
          "internalType": "uint256"
        }
      ],
      "anonymous": false
    }
  ];



const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

const RegisterWriter = () => {
  const [account, setAccount] = useState("");
  const [key, setKey] = useState("");
  const [stealth, setStealth] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // success, error, info

  const connectWallet = async () => {
    if (!window.ethereum) {
      setMessage("MetaMask is not installed!");
      setMessageType("error");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
      setMessage(`Wallet connected successfully!`);
      setMessageType("success");
      await sendAddressToBackend(address);
    } catch (error) {
      setMessage("Failed to connect wallet.");
      setMessageType("error");
      console.error(error);
    }
  };

  const sendAddressToBackend = async (walletAddress:any) => {
    try {
      const response = await fetch(`${BACKEND_API_URL}/create-writer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: walletAddress }),
      });

      if (!response.ok) throw new Error("Failed to send wallet address to backend");

      const data = await response.json();
      setStealth(data.stealthAddress);
      if (account && data.stealthAddress) {
        registerWriter();
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Error connecting to backend services.");
      setMessageType("error");
    }
  };

  const registerWriter = async () => {
    if (!account) {
      setMessage("Please connect your wallet first.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.newWriter(stealth);
      await tx.wait();

      setMessage("Successfully registered as a writer! Welcome aboard! 🎉");
      setMessageType("success");
    } catch (error) {
      console.error(error);
      setMessage("Transaction failed.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (account && stealth) {
      registerWriter();
    }
  }, [account, stealth]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-[400px] bg-gray-800/40 backdrop-blur-lg border-purple-500/20 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Become a Writer
            </CardTitle>
            <CardDescription className="text-gray-400">
              Connect your wallet to join our decentralized writing platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!account ? (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
                  onClick={connectWallet}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Connect Wallet"
                  )}
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-gray-700/30 border border-purple-500/20">
                  <p className="text-sm text-gray-400">Connected Account</p>
                  <p className="text-sm font-mono text-purple-300 truncate">
                    {account}
                  </p>
                </div>
                <Input
                  type="text"
                  placeholder="Enter your unique key"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="bg-gray-700/30 border-purple-500/20 text-white placeholder:text-gray-500"
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col">
            {message && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`w-full p-3 rounded-lg text-sm ${
                  messageType === "success"
                    ? "bg-green-500/20 text-green-300"
                    : messageType === "error"
                    ? "bg-red-500/20 text-red-300"
                    : "bg-blue-500/20 text-blue-300"
                }`}
              >
                {message}
              </motion.div>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default RegisterWriter;
