"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { truncateAddress } from "@/lib/utils"
import { getSolanaBalance } from "@/lib/solana"
import { Wallet, Loader2 } from "lucide-react"

declare global {
  interface Window {
    phantom?: {
      solana?: {
        isPhantom: boolean
        connect: () => Promise<{ publicKey: { toString: () => string } }>
        disconnect: () => Promise<void>
      }
    }
  }
}

interface WalletConnectButtonProps {
  onWalletConnect?: (address: string) => void
  className?: string
  showBalance?: boolean
}

export function WalletConnectButton({
  onWalletConnect,
  className = "",
  showBalance = false,
}: WalletConnectButtonProps) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [loadingBalance, setLoadingBalance] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Check if wallet is already connected
    const checkWalletConnection = async () => {
      if (window.phantom?.solana) {
        try {
          const resp = await window.phantom.solana.connect({ onlyIfTrusted: true })
          const address = resp.publicKey.toString()
          setWalletAddress(address)
          onWalletConnect?.(address)

          if (showBalance) {
            fetchWalletBalance(address)
          }
        } catch (error) {
          // User has not connected to the wallet before or has revoked access
          setWalletAddress(null)
        }
      }
    }

    checkWalletConnection()
  }, [onWalletConnect, showBalance])

  const fetchWalletBalance = async (address: string) => {
    if (!address) return

    setLoadingBalance(true)
    try {
      const balance = await getSolanaBalance(address)
      setWalletBalance(balance)
    } catch (error) {
      console.error("Error fetching wallet balance:", error)
      // Don't show toast for every balance fetch error to avoid spamming the user
      if (!walletBalance) {
        // Only show toast if we don't have a previous balance
        toast({
          title: "Error fetching balance",
          description: "Could not retrieve your wallet balance. Will try again later.",
          variant: "destructive",
        })
      }
    } finally {
      setLoadingBalance(false)
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

    try {
      setConnecting(true)
      const resp = await window.phantom.solana.connect()
      const address = resp.publicKey.toString()
      setWalletAddress(address)
      onWalletConnect?.(address)

      if (showBalance) {
        fetchWalletBalance(address)
      }

      toast({
        title: "Wallet connected",
        description: `Connected to ${truncateAddress(address)}`,
      })
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

  const disconnectWallet = async () => {
    if (window.phantom?.solana) {
      await window.phantom.solana.disconnect()
      setWalletAddress(null)
      setWalletBalance(null)

      toast({
        title: "Wallet disconnected",
        description: "Your wallet has been disconnected",
      })
    }
  }

  if (walletAddress) {
    return (
      <Button variant="outline" className={`gradient-border ${className}`} onClick={disconnectWallet}>
        <Wallet className="mr-2 h-4 w-4" />
        {truncateAddress(walletAddress)}
        {showBalance && (
          <span className="ml-2 text-xs">
            {loadingBalance ? (
              <Loader2 className="h-3 w-3 animate-spin inline ml-1" />
            ) : (
              walletBalance !== null && `(${walletBalance.toFixed(2)} SOL)`
            )}
          </span>
        )}
      </Button>
    )
  }

  return (
    <Button
      className={`bg-gradient-capitoro hover:opacity-90 transition-opacity ${className}`}
      onClick={connectWallet}
      disabled={connecting}
    >
      <Wallet className="mr-2 h-4 w-4" />
      {connecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  )
}
