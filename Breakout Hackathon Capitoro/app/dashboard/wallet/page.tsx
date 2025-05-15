"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { truncateAddress, formatSolana } from "@/lib/utils"
import { getSolanaBalance, isValidSolanaAddress } from "@/lib/solana"
import { Wallet, Copy, CheckCircle, Loader2, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function WalletPage() {
  const { supabase, user } = useSupabase()
  const { toast } = useToast()
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingBalance, setLoadingBalance] = useState(false)
  const [refreshAttempts, setRefreshAttempts] = useState(0)

  useEffect(() => {
    const fetchWalletAddress = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase.from("users").select("wallet_address").eq("id", user.id).single()

        if (error) throw error
        setWalletAddress(data.wallet_address || null)

        // If wallet address exists, fetch balance
        if (data.wallet_address && isValidSolanaAddress(data.wallet_address)) {
          fetchWalletBalance(data.wallet_address)
        }
      } catch (error) {
        console.error("Error fetching wallet address:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchWalletAddress()
  }, [supabase, user])

  const fetchWalletBalance = async (address: string, forceRefresh = false) => {
    if (!address || !isValidSolanaAddress(address)) return

    setLoadingBalance(true)
    try {
      const balance = await getSolanaBalance(address, forceRefresh)
      setWalletBalance(balance)
      // Reset refresh attempts on success
      setRefreshAttempts(0)
    } catch (error) {
      console.error("Error fetching wallet balance:", error)

      // Increment refresh attempts
      const newAttempts = refreshAttempts + 1
      setRefreshAttempts(newAttempts)

      // Only show toast if we've tried a few times
      if (newAttempts >= 2) {
        toast({
          title: "Error fetching balance",
          description: "Could not retrieve your wallet balance from Solana network. Please try again later.",
          variant: "destructive",
        })
      }
    } finally {
      setLoadingBalance(false)
    }
  }

  const handleWalletConnect = async (address: string) => {
    if (!user) return

    try {
      const { error } = await supabase.from("users").update({ wallet_address: address }).eq("id", user.id)

      if (error) throw error

      setWalletAddress(address)
      fetchWalletBalance(address)
    } catch (error) {
      console.error("Error updating wallet address:", error)
    }
  }

  const copyToClipboard = () => {
    if (!walletAddress) return

    navigator.clipboard.writeText(walletAddress)
    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  const refreshBalance = () => {
    if (walletAddress) {
      fetchWalletBalance(walletAddress, true) // Force refresh
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-capitoro-purple"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Wallet</h1>
        <p className="text-gray-400">Connect and manage your Solana wallet</p>
      </div>

      <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-800">
        <CardHeader>
          <CardTitle>Phantom Wallet</CardTitle>
          <CardDescription>Connect your Phantom wallet to invest in projects or receive funding</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {walletAddress ? (
            <>
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-capitoro-purple/20 rounded-full flex items-center justify-center">
                    <Wallet className="text-capitoro-purple" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Wallet Address</p>
                    <p className="font-mono">{truncateAddress(walletAddress)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyToClipboard}
                  className="text-gray-400 hover:text-white"
                >
                  {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-capitoro-green/20 rounded-full flex items-center justify-center">
                    <Wallet className="text-capitoro-green" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Wallet Balance</p>
                    {loadingBalance ? (
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Loading balance...</span>
                      </div>
                    ) : (
                      <p className="font-medium">{walletBalance !== null ? formatSolana(walletBalance) : "N/A"}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={refreshBalance}
                  className="text-gray-400 hover:text-white"
                  disabled={loadingBalance}
                >
                  <RefreshCw size={18} className={loadingBalance ? "animate-spin" : ""} />
                </Button>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  className="gradient-border"
                  onClick={() =>
                    window.open(`https://explorer.solana.com/address/${walletAddress}?cluster=devnet`, "_blank")
                  }
                >
                  View on Solana Explorer
                </Button>
                <WalletConnectButton onWalletConnect={handleWalletConnect} />
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Wallet className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">No wallet connected</h3>
              <p className="mt-2 text-gray-400 mb-6">
                Connect your Phantom wallet to start investing or receive funding.
              </p>
              <WalletConnectButton onWalletConnect={handleWalletConnect} />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gray-900/60 backdrop-blur-sm border-gray-800">
        <CardHeader>
          <CardTitle>About Solana</CardTitle>
          <CardDescription>Learn more about using Solana for investments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Solana is a high-performance blockchain supporting builders around the world creating crypto apps that
            scale.
          </p>
          <p>Capitoro uses Solana for secure, transparent transactions between investors and entrepreneurs.</p>
          <div className="mt-4">
            <Button variant="outline" className="gradient-border" asChild>
              <a href="https://solana.com" target="_blank" rel="noopener noreferrer">
                Learn More About Solana
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
