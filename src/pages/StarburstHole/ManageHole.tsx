import React, { useCallback, useState }  from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'

import { JSBI } from '@uniswap/sdk'
import { STARBURST, XSTARBURST } from "../../constants/index";
import { useHoleInfo } from '../../state/stake/hooks'
import DoubleCurrencyLogo from '../../components/DoubleLogo'
import { useWalletModalToggle } from '../../state/application/hooks'
import { TYPE } from '../../theme'

import { RowBetween } from '../../components/Row'
import { CardSection, DataCard, CardNoise, CardBGImage } from '../../components/earn/styled'
import { ButtonPrimary } from '../../components/Button'

import { useTokenBalance } from '../../state/wallet/hooks'
import { useActiveWeb3React } from '../../hooks'
import { useColor } from '../../hooks/useColor'
import { unwrappedToken } from '../../utils/wrappedCurrency'
import StakingModal from '../../components/StarburstHole/StakingModal'
import UnstakingModal from '../../components/StarburstHole/UnstakingModal'

const PageWrapper = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
`

const PositionInfo = styled(AutoColumn)<{ dim: any }>`
  position: relative;
  max-width: 640px;
  width: 100%;
  opacity: ${({ dim }) => (dim ? 0.6 : 1)};
`

const BottomSection = styled(AutoColumn)`
  border-radius: 12px;
  width: 100%;
  position: relative;
`

const StyledDataCard = styled(DataCard)<{ bgColor?: any; showBackground?: any }>`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #1e1a31 0%, #3d51a5 100%);
  z-index: 2;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  background: ${({ theme, bgColor, showBackground }) =>
    `radial-gradient(91.85% 100% at 1.84% 0%, ${bgColor} 0%,  ${showBackground ? theme.black : theme.bg5} 100%) `};
`

const PoolData = styled(DataCard)`
  background: none;
  border: 1px solid ${({ theme }) => theme.bg4};
  padding: 1rem;
  z-index: 1;
`
const DataRow = styled(RowBetween)`
  justify-content: center;
  gap: 12px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    gap: 12px;
  `};
`

export default function ManageHole() {
  const { account } = useActiveWeb3React()

  const holeInfo = useHoleInfo();
  const currency0 = unwrappedToken(STARBURST)
  const currency1 = unwrappedToken(XSTARBURST)

  const [showStakingModal, setShowStakingModal] = useState(false)
  const [showUnstakingModal, setShowUnstakingModal] = useState(false)

  const backgroundColor = useColor(STARBURST);

  const userLiquidityUnstaked = useTokenBalance(account ?? undefined, STARBURST)
  const showAddLiquidityButton = Boolean(holeInfo?.xSTARBURSTBalance?.equalTo('0') && userLiquidityUnstaked?.equalTo('0'))


  const toggleWalletModal = useWalletModalToggle()

  const handleDepositClick = useCallback(() => {
    if (account) {
      setShowStakingModal(true)
    } else {
      toggleWalletModal()
    }
  }, [account, toggleWalletModal])
  return (
    <PageWrapper gap="lg" justify="center">
      <RowBetween style={{ gap: '24px' }}>
        <TYPE.mediumHeader style={{ margin: 0 }}>
        Dragon's Hole
        </TYPE.mediumHeader>
        <DoubleCurrencyLogo currency0={currency0 ?? undefined} currency1={currency1 ?? undefined} size={24} />
      </RowBetween>

      <DataRow style={{ gap: '24px' }}>
        <PoolData>
          <AutoColumn gap="sm">
            <TYPE.body style={{ margin: 0 }}>Total STARBURST</TYPE.body>
            <TYPE.body fontSize={24} fontWeight={500}>
            { holeInfo ? holeInfo.totalStarburstBalance.toFixed(2, {groupSeparator: ','}): 0 }
            </TYPE.body>
          </AutoColumn>
        </PoolData>
        <PoolData>
          <AutoColumn gap="sm">
            <TYPE.body style={{ margin: 0 }}>xSTARBURST Rate</TYPE.body>
            <TYPE.body fontSize={24} fontWeight={500}>
            {`${holeInfo.STARBURSTtoxSTARBURST
            ?.toFixed(8, { groupSeparator: ',' })} xSTARBURST / STARBURST`}
            </TYPE.body>
          </AutoColumn>
        </PoolData>
      </DataRow>

      {/**showAddLiquidityButton && (
        <VoteCard>
          <CardBGImage />
          <CardNoise />
          <CardSection>
            <AutoColumn gap="md">
              <RowBetween>
      <TYPE.white fontWeight={600}>Step 1. Get {(stakingInfo?.name && stakingInfo?.name !== "" ? stakingInfo.name : "STARBURST-V2")} Liquidity tokens</TYPE.white>
              </RowBetween>
              <RowBetween style={{ marginBottom: '1rem' }}>
                <TYPE.white fontSize={14}>
                  { (stakingInfo?.name && stakingInfo?.name !== "" ? stakingInfo.name : "STARBURST-V2") + " tokens are required. Once you've added liquidity to the " + currencyA?.symbol + "-" + currencyB?.symbol + " pool you can stake your liquidity tokens on " + (stakingInfo?.lp && stakingInfo?.lp !== "" ? "the Aavegotchi page" : "this page.")}
                
                </TYPE.white>
              </RowBetween>
              <ButtonPrimary
                padding="8px"
                borderRadius="8px"
                width={'fit-content'}
                as={Link}
                to={`/add/${currencyA && currencyId(currencyA)}/${currencyB && currencyId(currencyB)}`}
              >
                {`Add ${currencyA?.symbol}-${currencyB?.symbol} liquidity`}
              </ButtonPrimary>
            </AutoColumn>
          </CardSection>
          <CardBGImage />
          <CardNoise />
        </VoteCard>
      )*/}

      {holeInfo && (
        <>
          <StakingModal
            isOpen={showStakingModal}
            onDismiss={() => setShowStakingModal(false)}
            holeInfo={holeInfo}
            userLiquidityUnstaked={userLiquidityUnstaked}
          />
          <UnstakingModal
            isOpen={showUnstakingModal}
            onDismiss={() => setShowUnstakingModal(false)}
            holeInfo={holeInfo}
          />
        </>
      )}

      <PositionInfo gap="lg" justify="center" dim={showAddLiquidityButton}>
        <BottomSection gap="lg" justify="center">
          <StyledDataCard disabled={false} bgColor={backgroundColor} showBackground={!showAddLiquidityButton}>
            <CardSection>
              <CardBGImage desaturate />
              <CardNoise />
              <AutoColumn gap="md">
                <RowBetween>
                  <TYPE.white fontWeight={600}>Your STARBURST balance</TYPE.white>
                </RowBetween>
                <RowBetween style={{ alignItems: 'baseline' }}>
                  <TYPE.white fontSize={36} fontWeight={600}>
                  {`${holeInfo.STARBURSTBalance
                      ?.toFixed(10, { groupSeparator: ',' })}`}
                  </TYPE.white>
                  <TYPE.white>
                    STARBURST
                  </TYPE.white>
                </RowBetween>
              </AutoColumn>
            </CardSection>
          </StyledDataCard>
         
        </BottomSection>
        <TYPE.main style={{ textAlign: 'center' }} fontSize={14}>
          <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px' }}>
            ⭐️
          </span>
          When you withdraw, the contract will automagically claim STARBURST on your behalf!
        </TYPE.main>

        { (
          <DataRow style={{ marginBottom: '1rem' }}>
            <ButtonPrimary padding="8px" borderRadius="8px" width="160px"  onClick={handleDepositClick}>
              Deposit
            </ButtonPrimary>

            {holeInfo?.xSTARBURSTBalance?.greaterThan(JSBI.BigInt(0)) && (
              <>
                <ButtonPrimary
                  padding="8px"
                  borderRadius="8px"
                  width="160px"
                  onClick={() => setShowUnstakingModal(true)}
                >
                
                  Withdraw
                </ButtonPrimary>
              </>
            )}
          </DataRow>
        )}
        {!userLiquidityUnstaked ? null : userLiquidityUnstaked.equalTo('0') ? null : (
          <TYPE.main>{userLiquidityUnstaked.toSignificant(6)} STARBURST tokens available</TYPE.main>
        )}
      </PositionInfo>
    </PageWrapper>
  )
}
