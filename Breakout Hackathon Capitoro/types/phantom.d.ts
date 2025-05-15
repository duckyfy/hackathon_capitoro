interface PhantomProvider {
  isPhantom?: boolean
  connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>
  disconnect: () => Promise<void>
  signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>
  signTransaction: (transaction: any) => Promise<any>
  signAllTransactions: (transactions: any[]) => Promise<any[]>
  request: (request: {
    method: string
    params?: any
  }) => Promise<any>
}

interface Window {
  phantom?: {
    solana?: PhantomProvider
  }
}
