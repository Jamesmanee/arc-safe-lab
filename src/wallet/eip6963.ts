// Minimal EIP-6963 (Multi Injected Provider Discovery) support.
//
// This module only *discovers* injected browser wallets and exposes a tiny,
// read-only surface over the EIP-1193 provider. It intentionally does not
// implement any method that can move funds, sign data, or change wallet state.

/** The read-only subset of EIP-1193 we rely on. */
export interface Eip1193Provider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>
  on?(event: string, listener: (...args: unknown[]) => void): void
  removeListener?(event: string, listener: (...args: unknown[]) => void): void
}

/** Wallet metadata announced per EIP-6963. */
export interface Eip6963ProviderInfo {
  uuid: string
  name: string
  icon: string
  rdns: string
}

export interface Eip6963ProviderDetail {
  info: Eip6963ProviderInfo
  provider: Eip1193Provider
}

interface Eip6963AnnounceEvent extends CustomEvent {
  detail: Eip6963ProviderDetail
}

/**
 * Subscribe to EIP-6963 wallet announcements.
 *
 * Returns an unsubscribe function. The callback is invoked with the full,
 * de-duplicated list of discovered wallets whenever a new one announces itself.
 */
export function subscribeToWallets(
  onChange: (wallets: Eip6963ProviderDetail[]) => void,
): () => void {
  const byUuid = new Map<string, Eip6963ProviderDetail>()

  const handleAnnounce = (event: Event) => {
    const detail = (event as Eip6963AnnounceEvent).detail
    if (!detail?.info?.uuid) return
    byUuid.set(detail.info.uuid, detail)
    onChange([...byUuid.values()])
  }

  window.addEventListener('eip6963:announceProvider', handleAnnounce)
  // Ask any wallets that are already present to (re-)announce themselves.
  window.dispatchEvent(new Event('eip6963:requestProvider'))

  return () => {
    window.removeEventListener('eip6963:announceProvider', handleAnnounce)
  }
}

/**
 * Pick the wallet to connect to, preferring MetaMask when present.
 */
export function preferMetaMask(
  wallets: Eip6963ProviderDetail[],
): Eip6963ProviderDetail | undefined {
  const metaMask = wallets.find(
    (w) =>
      w.info.rdns === 'io.metamask' ||
      /metamask/i.test(w.info.name),
  )
  return metaMask ?? wallets[0]
}
