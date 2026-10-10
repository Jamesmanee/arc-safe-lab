import { useCallback, useEffect, useState } from 'react'
import './App.css'
import {
  ARC_TESTNET_CHAIN_ID,
  ARC_TESTNET_NAME,
  isArcTestnet,
  parseChainId,
} from './wallet/arc'
import {
  preferMetaMask,
  subscribeToWallets,
  type Eip1193Provider,
  type Eip6963ProviderDetail,
} from './wallet/eip6963'

function shortenAddress(address: string): string {
  if (address.length < 10) return address
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

function App() {
  const [wallets, setWallets] = useState<Eip6963ProviderDetail[]>([])
  const [provider, setProvider] = useState<Eip1193Provider | null>(null)
  const [walletName, setWalletName] = useState<string | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Discover injected wallets via EIP-6963. No account access is requested here.
  useEffect(() => subscribeToWallets(setWallets), [])

  // Keep chain ID and account in sync while connected (read-only listeners).
  useEffect(() => {
    if (!provider?.on || !provider.removeListener) return

    const handleChainChanged = (raw: unknown) => setChainId(parseChainId(raw))
    const handleAccountsChanged = (accounts: unknown) => {
      const list = Array.isArray(accounts) ? (accounts as string[]) : []
      setAddress(list[0] ?? null)
    }

    provider.on('chainChanged', handleChainChanged)
    provider.on('accountsChanged', handleAccountsChanged)
    return () => {
      provider.removeListener?.('chainChanged', handleChainChanged)
      provider.removeListener?.('accountsChanged', handleAccountsChanged)
    }
  }, [provider])

  const connect = useCallback(async () => {
    setError(null)
    const selected = preferMetaMask(wallets)
    if (!selected) {
      setError('No browser wallet detected. Please install one (e.g. MetaMask).')
      return
    }

    setConnecting(true)
    try {
      const eip1193 = selected.provider
      // Read-only connection: request account addresses and current chain only.
      const accounts = (await eip1193.request({
        method: 'eth_requestAccounts',
      })) as string[]
      const rawChainId = await eip1193.request({ method: 'eth_chainId' })

      setProvider(eip1193)
      setWalletName(selected.info.name)
      setAddress(accounts[0] ?? null)
      setChainId(parseChainId(rawChainId))
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to connect to wallet.'
      setError(message)
    } finally {
      setConnecting(false)
    }
  }, [wallets])

  const disconnect = useCallback(() => {
    // Read-only apps cannot force a wallet to revoke access; we simply clear
    // local state so the UI returns to its disconnected view.
    setProvider(null)
    setWalletName(null)
    setAddress(null)
    setChainId(null)
    setError(null)
  }, [])

  const connected = provider !== null && address !== null
  const onArc = isArcTestnet(chainId)

  return (
    <main className="app">
      <header className="app-header">
        <span className="badge">Testnet Only</span>
        <h1>Arc Safe Lab</h1>
        <p className="tagline">
          A read-only security demo for the Arc Testnet. This app can view your
          wallet — it can never move funds or sign anything.
        </p>
      </header>

      <section className="card">
        {!connected ? (
          <>
            <h2>Connect a wallet</h2>
            <p className="muted">
              Discovers injected browser wallets via EIP-6963 and prefers
              MetaMask. Account access is requested only when you click Connect.
            </p>
            <button
              type="button"
              className="primary"
              onClick={connect}
              disabled={connecting}
            >
              {connecting ? 'Connecting…' : 'Connect (read-only)'}
            </button>
            {wallets.length > 0 && (
              <p className="muted detected">
                Detected: {wallets.map((w) => w.info.name).join(', ')}
              </p>
            )}
          </>
        ) : (
          <>
            <h2>Connected</h2>
            <dl className="details">
              <div>
                <dt>Wallet</dt>
                <dd>{walletName ?? 'Unknown'}</dd>
              </div>
              <div>
                <dt>Address</dt>
                <dd>
                  <code title={address ?? undefined}>
                    {shortenAddress(address!)}
                  </code>
                </dd>
              </div>
              <div>
                <dt>Chain ID</dt>
                <dd>
                  <code>{chainId ?? 'unknown'}</code>
                </dd>
              </div>
              <div>
                <dt>Network</dt>
                <dd>
                  <span className={onArc ? 'status ok' : 'status warn'}>
                    {onArc ? ARC_TESTNET_NAME : 'Not Arc Testnet'}
                  </span>
                </dd>
              </div>
            </dl>

            {!onArc && (
              <div className="warning" role="alert">
                <strong>Wrong network.</strong> This wallet is not connected to{' '}
                {ARC_TESTNET_NAME} (chain ID {ARC_TESTNET_CHAIN_ID}). Switch
                networks in your wallet to continue.
              </div>
            )}

            <button type="button" className="secondary" onClick={disconnect}>
              Disconnect
            </button>
          </>
        )}

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </section>

      <section className="note">
        <h3>Security note</h3>
        <p>
          This is <strong>Gate 1</strong> of Arc Safe Lab and is strictly{' '}
          <strong>read-only</strong>. It does not send transactions, request
          token approvals, sign messages, or ask for private keys, seed phrases,
          or API keys. It targets the Arc Testnet only — never mainnet.
        </p>
      </section>
    </main>
  )
}

export default App
