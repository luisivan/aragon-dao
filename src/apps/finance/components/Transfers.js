import React, { useMemo, useCallback, useContext } from 'react'
import PropTypes from 'prop-types'
import { compareDesc, format } from 'date-fns'
import BN from 'bn.js'
import {
  Button,
  ContextMenu,
  ContextMenuItem,
  DataView,
  GU,
  IconExternal,
  IconLabel,
  IconToken,
  blockExplorerUrl,
  formatTokenAmount,
  textStyle,
  useLayout,
  useTheme,
  useToast,
} from '@aragon/ui'
// import { saveAs } from 'file-saver'
import { useWallet } from '@/providers/Wallet'

import useFilteredTransfers from '../hooks/useFilteredTransfers'
import useTransactions from '../hooks/useTransactions'
import { useNetwork } from '@/hooks/shared'
import LocalIdentityBadge from '@/components/LocalIdentityBadge/LocalIdentityBadge'
import TransfersFilters from './TransfersFilters'
import NoTransfers from './NoTransfers'
import { addressesEqual, toChecksumAddress } from '@/utils/web3-utils'
import useBalances from '../hooks/useBalances'

const formatDate = date => format(date, 'yyyy-MM-dd')

// const getDownloadFilename = (appAddress, { start, end }) => {
//   const today = formatDate(Date.now())
//   let filename = `finance_${appAddress}_${today}.csv`
//   if (start && end) {
//     const formattedStart = formatDate(start)
//     const formattedEnd = formatDate(end)
//     filename = `finance_${appAddress}_${formattedStart}_to_${formattedEnd}.csv`
//   }
//   return filename
// }

const TransfersWrapper = ({ tokens }) => {
  const [transactions, { loading: isSyncing }] = useTransactions()

  const syncing = isSyncing
  return (
    <div
      css={`
        margin-top: ${2 * GU}px;
      `}
    >
      <Transfers
        tokens={tokens}
        transactions={transactions}
        isSyncing={syncing}
      />
    </div>
  )
}

const Transfers = React.memo(({ tokens, transactions, isSyncing }) => {
  // const { appState } = useAragonApi()

  const { account: connectedAccount } = useWallet()
  // const currentApp = useCurrentApp()
  const { layoutName } = useLayout()
  const theme = useTheme()
  // const toast = useToast()

  const {
    emptyResultsViaFilters,
    filteredTransfers,
    handleClearFilters,
    handleSelectedDateRangeChange,
    handleTokenChange,
    handleTransferTypeChange,
    page,
    setPage,
    selectedDateRange,
    selectedToken,
    selectedTransferType,
    symbols,
    transferTypes,
  } = useFilteredTransfers({ transactions, tokens })

  const tokenDetails =
    tokens.length > 0
      ? tokens.reduce((details, { address, decimals, symbol }) => {
          details[toChecksumAddress(address)] = {
            decimals,
            symbol,
          }
          return details
        }, {})
      : {}

  // const { resolve: resolveAddress } = useContext(IdentityContext)
  const handleDownload = () => {}
  // = useCallback(async () => {
  //   if (!currentApp || !currentApp.appAddress) {
  //     return
  //   }

  //   const data = await getDownloadData(
  //     filteredTransfers,
  //     tokenDetails,
  //     resolveAddress
  //   )
  //   const filename = getDownloadFilename(
  //     currentApp.appAddress,
  //     selectedDateRange
  //   )
  //   saveAs(new Blob([data], { type: 'text/csv;charset=utf-8' }), filename)
  //   toast('Transfers data exported')
  // }, [
  //   currentApp,
  //   filteredTransfers,
  //   tokenDetails,
  //   resolveAddress,
  //   selectedDateRange,
  //   toast,
  // ])

  const compactMode = layoutName === 'small'

  const sortedTransfers = useMemo(
    () =>
      filteredTransfers.sort(({ date: dateLeft }, { date: dateRight }) =>
        // Sort by date descending
        compareDesc(dateLeft, dateRight)
      ),
    [filteredTransfers]
  )

  const dataViewStatus = useMemo(() => {
    if (emptyResultsViaFilters && transactions.length > 0) {
      return 'empty-filters'
    }
    if (isSyncing) {
      return 'loading'
    }
    return 'default'
  }, [emptyResultsViaFilters, isSyncing, transactions.length])

  return (
    <DataView
      status={dataViewStatus}
      page={page}
      emptyState={status => {
        if (status === 'loading') {
          return <div>Loading!</div>
        }

        // Use the default for other `status` values.
        return null
      }}
      onPageChange={setPage}
      onStatusEmptyClear={handleClearFilters}
      heading={
        <React.Fragment>
          <div
            css={`
              padding-bottom: ${2 * GU}px;
              display: flex;
              align-items: center;
              justify-content: space-between;
            `}
          >
            <div
              css={`
                color: ${theme.content};
                ${textStyle('body1')};
              `}
            >
              Transfers
            </div>
            {transactions.length > 0 && (
              <div>
                <Button
                  icon={<IconExternal />}
                  label="Export"
                  onClick={handleDownload}
                />
              </div>
            )}
          </div>
          {!compactMode && (
            <TransfersFilters
              dateRangeFilter={selectedDateRange}
              onDateRangeChange={handleSelectedDateRangeChange}
              onTokenChange={handleTokenChange}
              onTransferTypeChange={handleTransferTypeChange}
              tokenFilter={selectedToken}
              transferTypeFilter={selectedTransferType}
              transferTypes={transferTypes}
              symbols={symbols}
            />
          )}
        </React.Fragment>
      }
      fields={[
        { label: 'Date', priority: 2 },
        { label: 'Source/recipient', priority: 3 },
        { label: 'Reference', priority: 1 },
        { label: 'Amount', priority: 2 },
      ]}
      entries={sortedTransfers}
      renderEntry={({ amount, date, entity, isIncoming, reference, token }) => {
        const formattedDate = format(date, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
        const { symbol, decimals } = tokenDetails[toChecksumAddress(token)]

        const formattedAmount = formatTokenAmount(
          isIncoming ? amount : amount.neg(),
          decimals,
          { displaySign: true, digits: 5, symbol }
        )

        return [
          <time
            dateTime={formattedDate}
            title={formattedDate}
            css={`
              padding-right: ${2 * GU}px;
              white-space: nowrap;
            `}
          >
            {formatDate(date)}
          </time>,
          <div
            css={`
              padding: 0 ${0.5 * GU}px;
              ${!compactMode
                ? `
                    display: inline-flex;
                    max-width: ${layoutName === 'large' ? 'unset' : '150px'};
                  `
                : ''};
            `}
          >
            <LocalIdentityBadge
              connectedAccount={addressesEqual(entity, connectedAccount)}
              entity={entity}
            />
          </div>,
          <div
            css={`
              padding: ${1 * GU}px ${0.5 * GU}px;
              overflow-wrap: break-word;
              word-break: break-word;
              hyphens: auto;
            `}
          >
            {reference}
          </div>,
          <span
            css={`
              font-weight: 600;
              color: ${isIncoming ? theme.positive : theme.negative};
            `}
          >
            {formattedAmount}
          </span>,
        ]
      }}
      renderEntryActions={({ entity, transactionHash }) => (
        <ContextMenu zIndex={1}>
          <ContextMenuViewTransaction transactionHash={transactionHash} />
          {/* <ContextMenuItemCustomLabel entity={entity} /> */}
        </ContextMenu>
      )}
    />
  )
})

// const ContextMenuItemCustomLabel = ({ entity }) => {
//   const theme = useTheme()
//   const [label, showLocalIdentityModal] = useIdentity(entity)
//   const handleEditLabel = useCallback(() => showLocalIdentityModal(entity))

//   return (
//     <ContextMenuItem onClick={handleEditLabel}>
//       <IconLabel
//         css={`
//           color: ${theme.surfaceContentSecondary};
//         `}
//       />
//       <span
//         css={`
//           margin-left: ${1 * GU}px;
//         `}
//       >
//         {label ? 'Edit' : 'Add'} custom label
//       </span>
//     </ContextMenuItem>
//   )
// }

const ContextMenuViewTransaction = ({ transactionHash }) => {
  const theme = useTheme()
  const network = useNetwork()
  const handleViewTransaction = useCallback(() => {
    if (network && network.type) {
      window.open(
        blockExplorerUrl('transaction', transactionHash, {
          networkType: network.type,
        }),
        '_blank',
        'noopener'
      )
    }
  }, [transactionHash, network])

  return (
    <ContextMenuItem onClick={handleViewTransaction}>
      <IconToken
        css={`
          color: ${theme.surfaceContentSecondary};
        `}
      />
      <span
        css={`
          margin-left: ${1 * GU}px;
        `}
      >
        View transaction
      </span>
    </ContextMenuItem>
  )
}

export default TransfersWrapper