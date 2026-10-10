// Arc Testnet network constants and helpers.

/** Arc Testnet chain ID (decimal). */
export const ARC_TESTNET_CHAIN_ID = 5042002

export const ARC_TESTNET_NAME = 'Arc Testnet'

/** Parse an EIP-1193 `eth_chainId` result (hex string) into a decimal number. */
export function parseChainId(raw: unknown): number | null {
  if (typeof raw === 'string' && raw.length > 0) {
    const parsed = Number.parseInt(raw, 16)
    return Number.isNaN(parsed) ? null : parsed
  }
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return raw
  }
  return null
}

export function isArcTestnet(chainId: number | null): boolean {
  return chainId === ARC_TESTNET_CHAIN_ID
}
