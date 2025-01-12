import { ChainId, Currency, currencyEquals, JSBI, Price, WETH } from '@uniswap/sdk'
import { useMemo } from 'react'
import { USDC, USDT, DAI, FRAX, STARBURST } from '../constants'
import { PairState, usePairs } from '../data/Reserves'
import { useActiveWeb3React } from '../hooks'
import { wrappedCurrency } from './wrappedCurrency'

/**
 * Returns the price in USDC of the input currency
 * @param currency currency to compute the USDC price of
 */
export default function useUSDCPrice(currency?: Currency): Price | undefined {
  const { chainId } = useActiveWeb3React()
  const wrapped = wrappedCurrency(currency, chainId)
  const tokenPairs: [Currency | undefined, Currency | undefined][] = useMemo(
    () => [
      [
        chainId && wrapped && currencyEquals(WETH[chainId], wrapped) ? undefined : currency,
        chainId ? WETH[chainId] : undefined
      ],
      [wrapped?.equals(STARBURST) ? undefined : wrapped, chainId === ChainId.MATIC ? STARBURST : undefined],
      [wrapped?.equals(USDC) ? undefined : wrapped, chainId === ChainId.MATIC ? USDC : undefined],
      [wrapped?.equals(USDT) ? undefined : wrapped, chainId === ChainId.MATIC ? USDT : undefined],
      [wrapped?.equals(DAI) ? undefined : wrapped, chainId === ChainId.MATIC ? DAI : undefined],
      [chainId ? WETH[chainId] : undefined, chainId === ChainId.MATIC ? USDC : undefined],
      [chainId ? STARBURST : undefined, chainId === ChainId.MATIC ? USDC : undefined]
    ],
    [chainId, currency, wrapped]
  )
  const [[ethPairState, ethPair], [starburstPairState, starburstPair], [usdcPairState, usdcPair],[usdtPairState, usdtPair],[daiPairState, daiPair], [usdcEthPairState, usdcEthPair], [usdcStarburstPairState, usdcStarburstPair]] = usePairs(tokenPairs)

  return useMemo(() => {
    if (!currency || !wrapped || !chainId) {
      return undefined
    }
    // handle weth/eth
    if (wrapped.equals(WETH[chainId])) {
      if (usdcPair) {
        const price = usdcPair.priceOf(WETH[chainId])
        return new Price(currency, USDC, price.denominator, price.numerator)
      } else {
        return undefined
      }
    }
    // handle usdc
    if (wrapped.equals(USDC)) {
      return new Price(USDC, USDC, '1', '1')
    }
    if ( wrapped.equals(USDT)) {
      return new Price(USDT, USDT, '1', '1')
    }
    if (wrapped.equals(DAI)) {
      return new Price(DAI, DAI, '1', '1')
    }
    if (wrapped.equals(FRAX)) {
      return new Price(FRAX, FRAX, '1', '1')
    }

    const ethPairETHAmount = ethPair?.reserveOf(WETH[chainId])
    const ethPairETHUSDCValue: JSBI =
      ethPairETHAmount && usdcEthPair ? usdcEthPair.priceOf(WETH[chainId]).quote(ethPairETHAmount).raw : JSBI.BigInt(0)

    // all other tokens
    // first try the usdc pair
    if (usdcPairState === PairState.EXISTS && usdcPair && usdcPair.reserveOf(USDC).greaterThan(ethPairETHUSDCValue)) {
      const price = usdcPair.priceOf(wrapped)
      return new Price(currency, USDC, price.denominator, price.numerator)
    }
    if (usdtPairState === PairState.EXISTS && usdtPair && usdtPair.reserveOf(USDT).greaterThan(ethPairETHUSDCValue)) {
      const price = usdtPair.priceOf(wrapped)
      return new Price(currency, USDT, price.denominator, price.numerator)
    }
    if (daiPairState === PairState.EXISTS && daiPair && daiPair.reserveOf(DAI).greaterThan(ethPairETHUSDCValue)) {
      const price = daiPair.priceOf(wrapped)
      return new Price(currency, DAI, price.denominator, price.numerator)
    }
    if (ethPairState === PairState.EXISTS && ethPair && usdcEthPairState === PairState.EXISTS && usdcEthPair) {
      if (usdcEthPair.reserveOf(USDC).greaterThan('0') && ethPair.reserveOf(WETH[chainId]).greaterThan('1')) {
        const ethUsdcPrice = usdcEthPair.priceOf(USDC)
        const currencyEthPrice = ethPair.priceOf(WETH[chainId])
        const usdcPrice = ethUsdcPrice.multiply(currencyEthPrice).invert()
        return new Price(currency, USDC, usdcPrice.denominator, usdcPrice.numerator)
      }
    }
    if (starburstPairState === PairState.EXISTS && starburstPair && usdcStarburstPairState === PairState.EXISTS && usdcStarburstPair) {
      if (usdcStarburstPair.reserveOf(USDC).greaterThan('0') && starburstPair.reserveOf(STARBURST).greaterThan('5')) {
        const starburstUsdcPrice = usdcStarburstPair.priceOf(USDC)
        const currencyStarburstPrice = starburstPair.priceOf(STARBURST)
        const usdcPrice = starburstUsdcPrice.multiply(currencyStarburstPrice).invert()
        return new Price(currency, USDC, usdcPrice.denominator, usdcPrice.numerator)
      }
    }
    return undefined
  }, [chainId, currency, ethPair, ethPairState, usdcEthPair, usdcEthPairState, usdcPair, usdcPairState, wrapped])
}
