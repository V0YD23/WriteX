"use client"
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { BookOpen, LogOut, User, Scroll, Hexagon } from "lucide-react";
import { useSearchParams } from "next/navigation";

type Blog = {
  title: string;
  ipfsHash: string;
};

// Contract configurations
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

const WriterDashboard = () => {
  const [account, setAccount] = useState("");
  const [stealthAddress, setStealthAddress] = useState("");
  const [blogs, setBlogs] = useState<Blog[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const searchParams = useSearchParams();
  const stealth = searchParams.get("stealth") ?? "";

  // Fetch blogs and user data on component mount
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Connect wallet
        if (!window.ethereum) {
          throw new Error("MetaMask not installed");
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);

        setStealthAddress(stealth);

        // Fetch blogs from contract
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          signer
        );
        const result = await contract.getBlogs(); // Fetch the data
        console.log(result); // Log to inspect the result
    
        if (Array.isArray(result) && result.length === 2) {
          const [titles, ipfsHashes] = result; // Destructure only if the result is an array with 2 elements
          console.log(titles, ipfsHashes);
          
          // Now you can proceed with mapping
          const formattedBlogs = titles.map((title:string, index:string) => ({
            title,
            ipfsHash: ipfsHashes[index],
          }));
    
          console.log(formattedBlogs); // Log the formatted blogs
          setBlogs(formattedBlogs);

          setBlogs(formattedBlogs);
          setLoading(false);
        } else {
          console.error("Invalid contract response:", result);
        }

      } catch (err) {
        console.error("Dashboard initialization error:", err);
        setError("error");
        setLoading(false);
      }
    };

    initializeDashboard();
  }, []);

  // Generate avatar fallback
  const getAvatarFallback = (address: string) => {
    return address ? `${address.substring(0, 2)}` : "WR";
  };

  // Truncate address for display
  const truncateAddress = (address: string) => {
    return address
      ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
      : "";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Hexagon className="w-16 h-16 text-blue-400 animate-pulse" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center text-red-300">
        Error: {error}
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white p-6"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <BookOpen className="w-10 h-10 text-blue-400" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Writer Dashboard
          </h1>
        </div>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar className="cursor-pointer ring-2 ring-blue-500/50 hover:ring-blue-400">
              <AvatarImage src="/path-to-avatar-image" />
              <AvatarFallback className="bg-blue-600 text-white">
                {getAvatarFallback(account)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-blue-900 border-blue-700 text-white">
            <DropdownMenuLabel>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>{truncateAddress(account)}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-blue-700" />
            <DropdownMenuItem className="focus:bg-blue-800 focus:text-white">
              <User className="mr-2 w-4 h-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-blue-800 focus:text-white">
              <LogOut className="mr-2 w-4 h-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Stealth Address Section */}
      <Card className="mb-6 bg-blue-900/30 backdrop-blur-lg border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-xl text-blue-300 flex items-center">
            <Scroll className="mr-2 w-6 h-6 text-blue-400" />
            Stealth Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-blue-200 break-all">
            {stealthAddress || "No stealth address found"}
          </p>
        </CardContent>
      </Card>

      {/* Blogs Section */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-blue-200">Your Blogs</h2>
        {blogs.length === 0 ? (
          <div className="text-blue-300 italic">No blogs published yet</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="bg-blue-900/40 backdrop-blur-lg border-blue-500/20 hover:border-cyan-500/50">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-200 truncate">
                      {blog.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <Badge
                        variant="outline"
                        className="bg-blue-800/50 text-blue-300"
                      >
                        IPFS Hash
                      </Badge>
                      <span className="text-sm text-blue-400 font-mono truncate max-w-[150px]">
                        {blog.ipfsHash}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Subtle Background Animation */}
      <div
        className="fixed inset-0 z-[-1] opacity-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, rgba(59, 130, 246, 0.1), transparent 70%)",
          animationName: "pulse",
          animationDuration: "5s",
          animationIterationCount: "infinite",
          animationTimingFunction: "ease-in-out",
        }}
      />

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap");

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
};

export default WriterDashboard;