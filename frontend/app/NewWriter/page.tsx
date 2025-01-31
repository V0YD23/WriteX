"use client"
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Wallet, ShieldCheck } from "lucide-react";
import {useRouter} from "next/navigation";

// Keeping contract configurations from previous implementation
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "";
const CONTRACT_ABI = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "blogCount",
				"type": "uint256"
			}
		],
		"name": "BlogListGot",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "string",
				"name": "ipfsHash",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "key",
				"type": "string"
			}
		],
		"name": "BlogStored",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "FundsSent",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "key",
				"type": "string"
			}
		],
		"name": "newWriter",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "string",
				"name": "key",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "realKey",
				"type": "address"
			}
		],
		"name": "NewWriterAdded",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "ipfsHash",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "key",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "proof",
				"type": "string"
			}
		],
		"name": "postBlog",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "key",
				"type": "string"
			}
		],
		"name": "realBlog",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "TipsSent",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "key",
				"type": "string"
			}
		],
		"name": "tipWriter",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "addresses",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "blogCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "blogs",
		"outputs": [
			{
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "ipfsHash",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "proof",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "key",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getBlogs",
		"outputs": [
			{
				"internalType": "string[]",
				"name": "titles",
				"type": "string[]"
			},
			{
				"internalType": "string[]",
				"name": "ipfsHashes",
				"type": "string[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

const RegisterWriter = () => {
  const [account, setAccount] = useState("");
  const [key, setKey] = useState("");
  const [stealth, setStealth] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [present,setPresent] = useState<boolean>(false);



  const router = useRouter();

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
      console.log(data)
      if (account && data.stealthAddress && data.present != "already") {
        console.log("clicked")
        registerWriter();
      }else{
        console.log("heybaby")
        setPresent(true)
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
    if (account && stealth && !present) {
      registerWriter();
    }
    console.log(stealth)
    if(stealth != "") {
        router.push(`/blog-page?stealth=${stealth}`);
    }
  }, [account, stealth]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(circle at top right, #0f172a, #1e293b, #0f172a)',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 100, 
          damping: 10,
          duration: 0.5 
        }}
      >
        <Card 
          className="w-[400px] bg-blue-900/30 backdrop-blur-2xl border-blue-500/20 shadow-2xl overflow-hidden"
          style={{
            boxShadow: '0 25px 50px -12px rgba(30, 64, 175, 0.25)'
          }}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
          <CardHeader className="space-y-2 pt-6">
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-8 h-8 text-blue-400" strokeWidth={2} />
              <CardTitle 
                className="text-3xl font-bold" 
                style={{ 
                  background: 'linear-gradient(to right, #3b82f6, #22d3ee)', 
                  WebkitBackgroundClip: 'text', 
                  color: 'transparent' 
                }}
              >
                Writer Hub
              </CardTitle>
            </div>
            <CardDescription className="text-blue-200/80 font-light">
              Secure your decentralized writing identity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            {!account ? (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-xl border-0"
                  onClick={connectWallet}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Wallet className="mr-2 h-5 w-5" />
                      Connect Wallet
                    </>
                  )}
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-blue-900/30 border border-blue-500/30">
                  <p className="text-xs text-blue-300 uppercase tracking-wider">Connected Wallet</p>
                  <p className="text-sm font-mono text-blue-200 truncate">
                    {account}
                  </p>
                </div>
                <Input
                  type="text"
                  placeholder="Create your unique writer key"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="bg-blue-900/30 border-blue-500/30 text-white placeholder:text-blue-300/60 focus:border-cyan-500 focus:ring-cyan-500"
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col">
            {message && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
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

      {/* Optional Subtle Background Animation */}
      <div 
        className="fixed inset-0 z-[-1] opacity-20 pointer-events-none" 
        style={{
          background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.1), transparent 70%)',
          animationName: 'pulse',
          animationDuration: '5s',
          animationIterationCount: 'infinite',
          animationTimingFunction: 'ease-in-out'
        }}
      />

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default RegisterWriter;
