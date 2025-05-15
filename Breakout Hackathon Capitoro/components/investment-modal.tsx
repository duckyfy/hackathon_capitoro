"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { formatSolana } from "@/lib/utils"
import { getSolanaBalance } from "@/lib/solana"
import { AlertCircle, CheckCircle, ExternalLink, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"

interface InvestmentModalProps {
  isOpen: boolean
  onClose: () => void
  project: any
  onInvestmentComplete: () => void
}

export function InvestmentModal({ isOpen, onClose, project, onInvestmentComplete }: InvestmentModalProps) {
  const { supabase, user } = useSupabase()
  const { toast } = useToast()

  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [walletBalance, setWalletBalance] = useState<number>(0)
  const [investmentAmount, setInvestmentAmount] = useState<string>("0.1")
  const [loading, setLoading] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [loadingBalance, setLoadingBalance] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [transactionHash, setTransactionHash] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [balanceError, setBalanceError] = useState(false)

  useEffect(() => {
    // Reset state when modal opens
    if (isOpen) {
      setTransactionStatus("idle")
      setTransactionHash(null)
      setErrorMessage(null)
      setInvestmentAmount("0.1")
      setBalanceError(false)
      checkWalletConnection()
    }
  }, [isOpen])

  const checkWalletConnection = async () => {
    setConnecting(true)

    try {
      // Check if Phantom wallet is installed
      if (!window.phantom?.solana) {
        setWalletConnected(false)
        return
      }

      // Check if wallet is already connected
      try {
        const resp = await window.phantom.solana.connect({ onlyIfTrusted: true })
        const address = resp.publicKey.toString()
        setWalletAddress(address)
        setWalletConnected(true)
        fetchWalletBalance(address)
      } catch (error) {
        // User has not connected to the wallet before or has revoked access
        setWalletConnected(false)
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error)
    } finally {
      setConnecting(false)
    }
  }

  const connectWallet = async () => {
    if (!window.phantom?.solana) {
      toast({
        title: "Phantom wallet not found",
        description: "Please install Phantom wallet extension and refresh the page",
        variant: "destructive",
      })
      return
    }

    setConnecting(true)

    try {
      const resp = await window.phantom.solana.connect()
      const address = resp.publicKey.toString()
      setWalletAddress(address)
      setWalletConnected(true)
      fetchWalletBalance(address)
    } catch (error: any) {
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect to Phantom wallet",
        variant: "destructive",
      })
    } finally {
      setConnecting(false)
    }
  }

  const fetchWalletBalance = async (address: string) => {
    if (!address) return

    setLoadingBalance(true)
    setBalanceError(false)
    try {
      const balance = await getSolanaBalance(address)
      setWalletBalance(balance)
    } catch (error) {
      console.error("Error fetching wallet balance:", error)
      setBalanceError(true)
      // Set a default balance as fallback
      setWalletBalance(1.0)
    } finally {
      setLoadingBalance(false)
    }
  }

  const handleInvestmentAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow numbers and decimals
    if (/^\d*\.?\d*$/.test(value)) {
      setInvestmentAmount(value)
    }
  }

  const handleInvest = async () => {
    if (!user || !walletAddress || !project.entrepreneur_wallet_address) {
      toast({
        title: "Investment failed",
        description: "Missing user or wallet information",
        variant: "destructive",
      })
      return
    }

    const amount = Number.parseFloat(investmentAmount)

    // Validate investment amount
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid investment amount",
        variant: "destructive",
      })
      return
    }

    // Check if amount exceeds wallet balance
    if (amount > walletBalance) {
      toast({
        title: "Insufficient balance",
        description: `Your wallet balance (${formatSolana(walletBalance)}) is less than the investment amount`,
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setTransactionStatus("processing")
    setErrorMessage(null)

    try {
      // Create a Solana connection
      const connection = new Connection(
        "https://devnet.helius-rpc.com/?api-key=365be56c-0b2a-485d-9146-52e92f60d6bd",
        "confirmed",
      )

      // Convert SOL amount to lamports (1 SOL = 1,000,000,000 lamports)
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL)

      // Create a new transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(walletAddress),
          toPubkey: new PublicKey(project.entrepreneur_wallet_address),
          lamports,
        }),
      )

      // Get the latest blockhash
      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = new PublicKey(walletAddress)

      // Sign the transaction with the user's wallet
      const signedTransaction = await window.phantom.solana.signTransaction(transaction)

      // Send the signed transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize())

      // Wait for transaction confirmation
      const confirmation = await connection.confirmTransaction(signature, "confirmed")

      if (confirmation.value.err) {
        throw new Error("Transaction failed to confirm")
      }

      // Record investment in database
      const { error } = await supabase.from("investments").insert({
        investor_id: user.id,
        project_id: project.id,
        amount: amount,
        transaction_hash: signature,
        created_at: new Date().toISOString(),
      })

      if (error) throw error

      // Update wallet balance (local state)
      setWalletBalance((prev) => prev - amount)

      setTransactionStatus("success")
      setTransactionHash(signature)

      toast({
        title: "Investment successful!",
        description: `You have successfully invested ${formatSolana(amount)} in ${project.name}`,
      })

      // Notify parent component that investment is complete
      onInvestmentComplete()
    } catch (error: any) {
      console.error("Investment error:", error)
      setTransactionStatus("error")
      setErrorMessage(error.message || "An error occurred during the investment process")

      toast({
        title: "Investment failed",
        description: error.message || "Failed to complete the investment",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invest in {project?.name}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Support this project by investing Solana tokens
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!walletConnected ? (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="mb-4 text-center">
                <p className="mb-2">Connect your Phantom wallet to invest</p>
                <p className="text-sm text-gray-400">You need a Phantom wallet to invest in this project</p>
              </div>
              <Button
                onClick={connectWallet}
                className="bg-gradient-capitoro hover:opacity-90 transition-opacity"
                disabled={connecting}
              >
                {connecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect Wallet"
                )}
              </Button>
            </div>
          ) : transactionStatus === "success" ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center py-4">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="text-green-500" size={32} />
                </div>
                <h3 className="text-xl font-medium mb-2">Investment Successful!</h3>
                <p className="text-center text-gray-400 mb-4">
                  You have successfully invested {formatSolana(Number.parseFloat(investmentAmount))} in {project.name}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Transaction Hash</span>
                  <a
                    href={`https://explorer.solana.com/tx/${transactionHash}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-capitoro-blue hover:text-capitoro-purple flex items-center gap-1"
                  >
                    View on Explorer
                    <ExternalLink size={14} />
                  </a>
                </div>
                <p className="font-mono text-xs mt-1 break-all">{transactionHash}</p>
              </div>
            </div>
          ) : transactionStatus === "error" ? (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Transaction Failed</AlertTitle>
                <AlertDescription>
                  {errorMessage || "An error occurred during the transaction. Please try again."}
                </AlertDescription>
              </Alert>

              <Button onClick={() => setTransactionStatus("idle")} className="w-full">
                Try Again
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                <p className="text-sm text-gray-400">Your Wallet Balance</p>
                {loadingBalance ? (
                  <div className="flex items-center mt-1">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Loading balance...</span>
                  </div>
                ) : (
                  <div>
                    <p className="text-xl font-medium">{formatSolana(walletBalance)}</p>
                    {balanceError && (
                      <p className="text-xs text-amber-400 mt-1">
                        Note: Using estimated balance due to network issues. Actual balance may differ.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="investment-amount">Investment Amount (SOL)</Label>
                <Input
                  id="investment-amount"
                  type="text"
                  value={investmentAmount}
                  onChange={handleInvestmentAmountChange}
                  className="bg-gray-800 border-gray-700"
                />
                <p className="text-xs text-gray-400">Maximum investment: {formatSolana(walletBalance)}</p>
              </div>

              <Alert className="bg-blue-900/20 border-blue-800 text-blue-400">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Investment Information</AlertTitle>
                <AlertDescription>
                  Your investment will be sent directly to the entrepreneur's wallet. This transaction cannot be
                  reversed once confirmed.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        <DialogFooter>
          {transactionStatus === "success" ? (
            <Button onClick={onClose}>Close</Button>
          ) : transactionStatus === "error" ? (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          ) : transactionStatus === "idle" && walletConnected ? (
            <>
              <Button variant="outline" onClick={onClose} className="mr-2">
                Cancel
              </Button>
              <Button
                onClick={handleInvest}
                className="bg-gradient-capitoro hover:opacity-90 transition-opacity"
                disabled={loading || loadingBalance || Number.parseFloat(investmentAmount) > walletBalance}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Invest ${formatSolana(Number.parseFloat(investmentAmount) || 0)}`
                )}
              </Button>
            </>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
