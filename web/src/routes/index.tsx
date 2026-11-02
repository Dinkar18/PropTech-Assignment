import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import { AddMemberForm } from '../components/AddMemberForm'
import { BillsFeed } from '../components/BillsFeed'
import { GlobalErrorBanner } from '../components/GlobalErrorBanner'
import { Header } from '../components/Header'
import { HouseholdSummary } from '../components/HouseholdSummary'
import { SplitBillForm } from '../components/SplitBillForm'
import { ToastContainer } from '../components/ToastContainer'
import * as api from '../lib/api'
import type { Balance, Bill, Home, Member, Toast } from '../types/models'

export const Route = createFileRoute('/')({
  component: BillSplitterApp,
})

function BillSplitterApp() {
  const [homes, setHomes] = useState<Home[]>([])
  const [selectedHomeId, setSelectedHomeId] = useState<string>('')
  const [members, setMembers] = useState<Member[]>([])
  const [balances, setBalances] = useState<Balance[]>([])
  const [bills, setBills] = useState<Bill[]>([])

  // UI status
  const [loadingData, setLoadingData] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState<{ shareId: string; message: string } | null>(
    null,
  )
  const [payingShareId, setPayingShareId] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])

  // Form states
  const [newHomeName, setNewHomeName] = useState('')
  const [showHomeModal, setShowHomeModal] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')
  const [newBillTitle, setNewBillTitle] = useState('')
  const [newBillAmount, setNewBillAmount] = useState('')
  const [submittingBill, setSubmittingBill] = useState(false)
  const [billFormError, setBillFormError] = useState<string | null>(null)

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  // Sync properties list
  const loadHomes = useCallback(async () => {
    setGlobalError(null)
    try {
      const fetchedHomes = await api.fetchHomes()
      setHomes(fetchedHomes)
      if (fetchedHomes.length > 0 && !selectedHomeId) {
        setSelectedHomeId(fetchedHomes[0]?.id || '')
      }
    } catch (err: unknown) {
      setGlobalError(err instanceof Error ? err.message : 'Could not fetch properties')
    }
  }, [selectedHomeId])

  // Sync household data (members, bills, balances)
  const loadHomeData = useCallback(async (homeId: string) => {
    if (!homeId) return
    setLoadingData(true)
    setGlobalError(null)
    try {
      const data = await api.fetchHomeData(homeId)
      setMembers(data.members)
      setBills(data.bills)
      setBalances(data.balances)
    } catch (err: unknown) {
      setGlobalError(err instanceof Error ? err.message : 'Error syncing household data')
    } finally {
      setLoadingData(false)
    }
  }, [])

  useEffect(() => {
    loadHomes()
  }, [loadHomes])

  useEffect(() => {
    if (selectedHomeId) {
      loadHomeData(selectedHomeId)
    } else {
      setMembers([])
      setBills([])
      setBalances([])
    }
  }, [selectedHomeId, loadHomeData])

  // Handlers
  const handleCreateHome = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newHomeName.trim()) return
    setGlobalError(null)
    try {
      const createdHome = await api.createHome(newHomeName.trim())
      setNewHomeName('')
      setShowHomeModal(false)
      setSelectedHomeId(createdHome.id)
      loadHomes()
      showToast(`Property "${createdHome.name}" created successfully!`, 'success')
    } catch (err: unknown) {
      setGlobalError(err instanceof Error ? err.message : 'Failed to create property')
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedHomeId || !newMemberName.trim()) return
    setGlobalError(null)
    try {
      const added = await api.addMember(selectedHomeId, newMemberName.trim())
      setNewMemberName('')
      loadHomeData(selectedHomeId)
      showToast(`Roommate "${added.name}" joined the flat!`, 'success')
    } catch (err: unknown) {
      setGlobalError(err instanceof Error ? err.message : 'Failed to add roommate')
    }
  }

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault()
    setBillFormError(null)
    if (!selectedHomeId) return

    const parsedRupees = Number.parseFloat(newBillAmount)
    const totalCents =
      Number.isFinite(parsedRupees) && parsedRupees > 0 ? Math.round(parsedRupees * 100) : 0

    if (!newBillTitle.trim()) {
      setBillFormError('Please enter what this bill is for')
      return
    }
    if (totalCents <= 0) {
      setBillFormError(
        'Please enter a valid positive amount in Rupees (e.g. 1500 for ₹1,500 or 197.50)',
      )
      return
    }
    if (members.length === 0) {
      setBillFormError('Cannot split a bill without roommates. Add a roommate first.')
      return
    }

    setSubmittingBill(true)
    try {
      await api.createBill(selectedHomeId, newBillTitle.trim(), totalCents)
      setNewBillTitle('')
      setNewBillAmount('')
      loadHomeData(selectedHomeId)
      showToast('Bill split and distributed across roommates!', 'success')
    } catch (err: unknown) {
      setBillFormError(err instanceof Error ? err.message : 'Failed to split bill')
    } finally {
      setSubmittingBill(false)
    }
  }

  const handlePayShare = async (billId: string, shareId: string) => {
    setPaymentError(null)
    setPayingShareId(shareId)

    const idempotencyKey = crypto.randomUUID()
    try {
      await api.payShare(billId, shareId, idempotencyKey)
      await loadHomeData(selectedHomeId)
      showToast('Payment settled and recorded!', 'success')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Payment could not be completed'
      setPaymentError({ shareId, message })
      showToast(message, 'error')
    } finally {
      setPayingShareId(null)
    }
  }

  // Summary Metrics
  const totalOutstandingCents = balances.reduce((sum, b) => sum + b.outstandingCents, 0)
  const settledBillsCount = bills.filter((b) => b.shares.every((s) => s.paidAt !== null)).length

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, background: '#f8fafc' }}>
      <Header
        homes={homes}
        selectedHomeId={selectedHomeId}
        onSelectHome={setSelectedHomeId}
        showHomeModal={showHomeModal}
        onToggleHomeModal={setShowHomeModal}
        newHomeName={newHomeName}
        onChangeNewHomeName={setNewHomeName}
        onCreateHome={handleCreateHome}
      />

      <main style={{ maxWidth: 1160, margin: '0 auto', padding: '32px 24px' }}>
        {globalError && (
          <GlobalErrorBanner
            error={globalError}
            onRetry={() => {
              if (selectedHomeId) loadHomeData(selectedHomeId)
              else loadHomes()
            }}
          />
        )}

        {selectedHomeId ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <HouseholdSummary
              totalOutstandingCents={totalOutstandingCents}
              members={members}
              settledBillsCount={settledBillsCount}
              totalBillsCount={bills.length}
              balances={balances}
            />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                gap: 28,
                alignItems: 'start',
              }}
            >
              <BillsFeed
                bills={bills}
                loadingData={loadingData}
                payingShareId={payingShareId}
                paymentError={paymentError}
                onPayShare={handlePayShare}
              />

              <aside
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 24,
                  position: 'sticky',
                  top: 96,
                }}
              >
                <SplitBillForm
                  members={members}
                  newBillTitle={newBillTitle}
                  onChangeTitle={setNewBillTitle}
                  newBillAmount={newBillAmount}
                  onChangeAmount={setNewBillAmount}
                  submittingBill={submittingBill}
                  billFormError={billFormError}
                  onSubmit={handleCreateBill}
                />

                <AddMemberForm
                  members={members}
                  newMemberName={newMemberName}
                  onChangeName={setNewMemberName}
                  onSubmit={handleAddMember}
                />
              </aside>
            </div>
          </div>
        ) : (
          <div
            className="fintech-card"
            style={{
              padding: '64px 24px',
              textAlign: 'center',
              borderRadius: 20,
              background: '#ffffff',
            }}
          >
            <div style={{ fontSize: 44, marginBottom: 14 }}>🏘️</div>
            <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
              No Property Selected
            </h3>
            <p style={{ margin: '0 auto', maxWidth: 360, color: '#64748b', fontSize: 14 }}>
              Create a new flat or select an existing one above to begin managing bills and shares
              with your flatmates.
            </p>
          </div>
        )}
      </main>

      <ToastContainer toasts={toasts} />
    </div>
  )
}
