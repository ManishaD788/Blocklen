"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { ShieldAlert, Zap, FileJson, CheckCircle2, Shield, Loader2 } from "lucide-react";

// ABIs - Replace with your deployed contract's address on Sepolia!
const CONTRACT_ADDRESS = "0x9b60ca0D76A809f0e062a827082f6d93A21107D6";
const CONTRACT_ABI = [
  "function storeAudit(string memory _contractName, string memory _auditHash) public",
  "function getAuditsCount() public view returns (uint256)"
];

interface AuditResult {
  riskScore: number;
  vulnerabilities: string[];
  gasInefficiencies: string[];
  suggestions: string[];
}

export default function Home() {
  const [code, setCode] = useState("");
  const [contractName, setContractName] = useState("MyContract");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [txHash, setTxHash] = useState("");
  const [isBlockchainLoading, setIsBlockchainLoading] = useState(false);

  const handleAudit = async () => {
    if (!code) return alert("Please enter contract code");
    
    setLoading(true);
    setResult(null);
    setTxHash("");
    
    try {
        const res = await fetch("/api/audit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code })
        });
        
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        
        setResult(data);
    } catch (err: any) {
        alert(err.message || "Auditing failed.");
    } finally {
        setLoading(false);
    }
  };

  const storeOnSepolia = async () => {
    if (!result || typeof window.ethereum === "undefined") {
        return alert("Please audit a contract first and install MetaMask.");
    }

    setIsBlockchainLoading(true);
    try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();

        if (network.chainId !== 11155111n) {
             alert("Please switch MetaMask to Sepolia Testnet");
             setIsBlockchainLoading(false);
             return;
        }

        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        // Generate a hash of our audit result to store
        // In a real app we might put result on IPFS, then hash the IPFS CID
        const auditDataString = JSON.stringify(result);
        const auditHash = ethers.id(auditDataString); 
        
        console.log("Storing Hash:", auditHash);
        const tx = await contract.storeAudit(contractName, auditHash);
        
        console.log("Tx Sent:", tx.hash);
        await tx.wait();
        
        setTxHash(tx.hash);
        alert("Verification stored successfully on Sepolia!");
    } catch (err: any) {
        console.error(err);
        alert("Transaction Failed! See console. Did you replace the CONTRACT_ADDRESS?");
    } finally {
        setIsBlockchainLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r flex flex-col justify-center items-center from-emerald-400 to-cyan-400 bg-clip-text text-transparent w-full mx-auto">
               <Shield className="w-16 text-emerald-500 h-16 inline-block" />
               AI Smart Contract Auditor
            </h1>
            <p className="text-neutral-400">Powered by Groq LLM & Sepolia Base</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Editor Area */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
                <input 
                    type="text" 
                    value={contractName} 
                    onChange={e => setContractName(e.target.value)}
                    placeholder="Contract Name"
                    className="bg-neutral-900 border border-neutral-800 rounded px-4 py-3 w-full focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition"
                />
            </div>
            
            <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="// Paste your Solidity contract code here..."
                className="w-full h-[500px] p-4 font-mono text-sm bg-neutral-900/50 border border-neutral-800 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition resize-none"
            />
            
            <button
                onClick={handleAudit}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-4 px-4 rounded-lg transition-all flex items-center justify-center disabled:opacity-50"
            >
                {loading ? <span className="flex items-center"><Loader2 className="animate-spin mr-2" /> Analyzing Code...</span> 
                         : "Analyze Smart Contract"}
            </button>
          </div>

          {/* Results Area */}
          <div className="bg-neutral-900 rounded-lg border border-neutral-800 flex flex-col overflow-hidden h-[630px]">
                {!result && !loading && (
                    <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 p-8 text-center space-y-4">
                        <FileJson className="w-16 h-16 opacity-50 text-neutral-600" />
                        <p>Audit results will appear here.</p>
                    </div>
                )}
                
                {loading && (
                    <div className="flex-1 flex items-center justify-center p-8">
                         <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                         <span className="ml-4 font-semibold text-neutral-400 animate-pulse">Running Groq Analysis...</span>
                    </div>
                )}

                {result && !loading && (
                    <div className="flex-1 overflow-y-auto w-full p-6 space-y-6 flex flex-col">
                        <div className="flex-1 space-y-6">
                            {/* Score */}
                            <div className="flex items-center justify-between bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                                 <div className="font-semibold text-lg text-neutral-300">Overall Risk Score</div>
                                 <div className={`text-4xl font-black ${result.riskScore > 70 ? 'text-red-500' : result.riskScore > 30 ? 'text-yellow-500' : 'text-emerald-500'}`}>
                                     {result.riskScore}/100
                                 </div>
                            </div>

                            {/* Vulns */}
                            <div>
                                 <h3 className="flex items-center text-red-400 font-bold text-lg mb-3 border-b border-neutral-800 pb-2">
                                    <ShieldAlert className="w-5 h-5 mr-2" /> Critical Vulnerabilities
                                 </h3>
                                 {result.vulnerabilities.length > 0 ? (
                                    <ul className="list-disc pl-5 space-y-2 text-neutral-300 text-sm">
                                        {result.vulnerabilities.map((v, i) => <li key={i}>{v}</li>)}
                                    </ul>
                                 ) : <p className="text-neutral-500 italic text-sm">No vulnerabilities found.</p>}
                            </div>

                            {/* Gas */}
                            <div>
                                 <h3 className="flex items-center text-yellow-400 font-bold text-lg mb-3 border-b border-neutral-800 pb-2">
                                    <Zap className="w-5 h-5 mr-2" /> Gas Inefficiencies
                                 </h3>
                                 {result.gasInefficiencies.length > 0 ? (
                                    <ul className="list-disc pl-5 space-y-2 text-neutral-300 text-sm">
                                        {result.gasInefficiencies.map((g, i) => <li key={i}>{g}</li>)}
                                    </ul>
                                 ) : <p className="text-neutral-500 italic text-sm">Already gas optimized.</p>}
                            </div>

                            {/* Tips */}
                            <div>
                                 <h3 className="flex items-center text-emerald-400 font-bold text-lg mb-3 border-b border-neutral-800 pb-2">
                                    <CheckCircle2 className="w-5 h-5 mr-2" /> Suggestions
                                 </h3>
                                 {result.suggestions.length > 0 ? (
                                    <ul className="list-disc pl-5 space-y-2 text-neutral-300 text-sm">
                                        {result.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                 ) : <p className="text-neutral-500 italic text-sm">No suggestions.</p>}
                            </div>
                        </div>

                        {/* Blockchain Proof - Fixed to Bottom */}
                        <div className="mt-auto pt-6 border-t border-neutral-800 bg-neutral-900">
                            <button
                                onClick={storeOnSepolia}
                                disabled={isBlockchainLoading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center disabled:opacity-50"
                            >
                                {isBlockchainLoading ? 
                                    <span className="flex items-center"><Loader2 className="animate-spin mr-2" /> Confirming in Wallet...</span> : 
                                    "Save Audit Proof to Sepolia Testnet"}
                            </button>
                            {txHash && (
                                <p className="text-xs text-neutral-400 mt-2 text-center break-all">
                                    Tx Hash: <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" className="text-blue-400 underline">{txHash}</a>
                                </p>
                            )}
                        </div>
                    </div>
                )}
          </div>
        </div>
      </div>
    </main>
  );
}
