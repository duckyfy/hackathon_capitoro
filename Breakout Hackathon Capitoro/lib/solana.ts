"use client"

import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js"

// Cache for balance results to reduce API calls
const balanceCache: Record<string, { balance: number; timestamp: number }> = {}
// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000

// Create a singleton connection to avoid multiple connections
let connectionInstance: Connection | null = null

// Get the Solana connection instance
function getConnection(): Connection {
  if (!connectionInstance) {
    connectionInstance = new Connection("https://devnet.helius-rpc.com/?api-key=365be56c-0b2a-485d-9146-52e92f60d6bd", {
      commitment: "confirmed",
      disableRetryOnRateLimit: false, // Enable built-in retry
      confirmTransactionInitialTimeout: 60000, // 60 seconds
    })
  }
  return connectionInstance
}

/**
 * Fetches the SOL balance for a given wallet address with caching
 * @param address Solana wallet address as string
 * @param forceRefresh Whether to bypass cache and force a refresh
 * @returns Balance in SOL (not lamports)
 */
export async function getSolanaBalance(address: string, forceRefresh = false): Promise<number> {
  try {
    // Check cache first if not forcing refresh
    if (!forceRefresh && balanceCache[address]) {
      const cachedData = balanceCache[address]
      const now = Date.now()
      // If cache is still valid, return cached balance
      if (now - cachedData.timestamp < CACHE_TTL) {
        console.log("Using cached balance for", address)
        return cachedData.balance
      }
    }

    // Convert string address to PublicKey
    const publicKey = new PublicKey(address)

    // Get connection and balance
    const connection = getConnection()

    // Implement manual retry logic with exponential backoff
    let retries = 3
    let delay = 1000 // Start with 1 second delay
    let balance: number | null = null

    while (retries > 0 && balance === null) {
      try {
        // Get balance in lamports
        balance = await connection.getBalance(publicKey)
      } catch (error: any) {
        // If we get a 429 error, wait and retry
        if (error.message && error.message.includes("429")) {
          console.log(`Rate limit hit, retrying after ${delay}ms...`)
          await new Promise((resolve) => setTimeout(resolve, delay))
          delay *= 2 // Exponential backoff
          retries--
        } else {
          // For other errors, just throw
          throw error
        }
      }
    }

    if (balance === null) {
      throw new Error("Failed to fetch balance after multiple retries")
    }

    // Convert lamports to SOL (1 SOL = 1,000,000,000 lamports)
    const solBalance = balance / LAMPORTS_PER_SOL

    // Cache the result
    balanceCache[address] = {
      balance: solBalance,
      timestamp: Date.now(),
    }

    return solBalance
  } catch (error) {
    console.error("Error fetching Solana balance:", error)
    throw error
  }
}

/**
 * Validates if a string is a valid Solana address
 * @param address Address to validate
 * @returns Boolean indicating if address is valid
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address)
    return true
  } catch (error) {
    return false
  }
}
