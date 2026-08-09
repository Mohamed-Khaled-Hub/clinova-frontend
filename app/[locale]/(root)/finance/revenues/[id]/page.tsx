'use client'

// Core
import { GiTwoCoins } from 'react-icons/gi'
import { useRouter } from '@/src/i18n/routing'
import { useLocale, useTranslations } from 'next-intl'
import { SubmitEvent, use, useEffect, useState } from 'react'
// Components
import Input from '@/src/components/UiRelated/Input'
import Select from '@/src/components/UiRelated/Select'
import PopupMessage from '@/src/components/UiRelated/PopupMessage'
import ErrorMessages from '@/src/components/UiRelated/ErrorMessages'
import Loading from '@/src/components/UiRelated/Loading'
import ContentSection from '@/src/components/PagesRelated/ContentSection'
import FormBoundaryActions from '@/src/components/PagesRelated/FormBoundaryActions'
import DataDisplayBlock from '@/src/components/PagesRelated/DataDisplayBlock'
import StatusBadge from '@/src/components/UiRelated/StatusBadge'
import FieldsGrid from '@/src/components/ContainerRelated/FieldsGrid'
import PageContainer from '@/src/components/ContainerRelated/PageContainer'
import PageHeader from '@/src/components/PagesRelated/PageHeader'
import TextArea from '@/src/components/UiRelated/TextArea'
// Enums
import {
    FinancialStatusEnum,
    PaymentMethodEnum,
} from '@/src/enums/schemas.enum'
import { PermissionsEnum } from '@/src/enums/roles-permissions.enum'
import { StatusEnum } from '@/src/enums/ui.enum'
// Functions
import { formatTimestamp, hasPermission } from '@/src/utils/functions'
// Hooks
import { useUser } from '@/src/providers/UserProvider'
import { useRevenue } from '@/src/providers/RevenueProvider'
// Types
import { LocaleType } from '@/src/types/i18n.type'
import { IdPageProps } from '@/src/types/props.type'
import {
    BackendErrorResponse,
    RevenueResponse,
} from '@/src/types/backend/backend.responses.type'
import { UpdateRevenueRequest } from '@/src/types/backend/backend.requests.type'
// Style
import '@/src/styles/pages/(root)/finance/revenues/[id]/page.css'

export default function RevenueDetailsPage({ params }: IdPageProps) {
    // Params
    const { id } = use(params)

    // Translations
    const t = useTranslations('RevenuePage')
    const tTech = useTranslations('SystemTechTerms')
    const tCurrency = useTranslations('Currency')
    const tMethod = useTranslations('PaymentMethodEnum')
    const tStatus = useTranslations('FinancialStatusEnum')

    // From Providers
    const router = useRouter()
    const locale = useLocale() as LocaleType
    const { updateRevenue, deleteRevenue, getRevenueById } = useRevenue()
    const { user, isLoadingProfile } = useUser()

    // Page States
    const [isEditing, setIsEditing] = useState<boolean>(false)
    const [isSaving, setIsSaving] = useState<boolean>(false)
    const [isDeleting, setIsDeleting] = useState<boolean>(false)
    const [isScreenLoading, setIsScreenLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | string[] | null>(null)
    const [toast, setToast] = useState<{
        message: string | string[]
        type: StatusEnum
    } | null>(null)

    // Revenue States
    const [revenue, setRevenue] = useState<RevenueResponse | null>(null)
    const [transactionAmount, setTransactionAmount] = useState<string>('0')
    const [discountAmount, setDiscountAmount] = useState<string>('0')
    const [transactionDate, setTransactionDate] = useState<string>('')
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethodEnum>(
        PaymentMethodEnum.CASH
    )
    const [status, setStatus] = useState<FinancialStatusEnum>(
        FinancialStatusEnum.PAID
    )
    const [notes, setNotes] = useState<string>('')

    // Get Revenue
    useEffect(() => {
        const fetchTargetRevenue = async () => {
            try {
                setIsScreenLoading(true)
                const data = await getRevenueById(id)
                setRevenue(data)
            } catch (err) {
                const backendErr = err as BackendErrorResponse
                setError(backendErr.message)
            } finally {
                setIsScreenLoading(false)
            }
        }
        fetchTargetRevenue().then()
    }, [id, getRevenueById])

    // Authorization Guard Check
    const canReadRevenue = hasPermission(
        user,
        PermissionsEnum.REVENUE,
        'canRead'
    )

    const canWriteRevenue = hasPermission(
        user,
        PermissionsEnum.REVENUE,
        'canWrite'
    )

    // Early Termination
    if (isLoadingProfile || isScreenLoading) {
        return <Loading />
    }

    if (!revenue || !canReadRevenue) {
        return null
    }

    // Event Handlers
    const handleStartEditing = () => {
        if (!canWriteRevenue) return
        setError(null)
        if (revenue) {
            setTransactionAmount(revenue.transactionAmount.toString())
            setDiscountAmount(revenue.discountAmount.toString())
            setTransactionDate(
                revenue.transactionDate
                    ? new Date(revenue.transactionDate)
                          .toISOString()
                          .slice(0, 16)
                    : ''
            )
            setPaymentMethod(revenue.paymentMethod)
            setStatus(revenue.status)
            setNotes(revenue.notes || '')
        }
        setIsEditing(true)
    }

    const handleCancelEditing = () => {
        setIsEditing(false)
        setError(null)
    }

    const handleSaveChanges = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!canWriteRevenue) return
        setError(null)
        if (Number(discountAmount) > Number(transactionAmount)) {
            setError(
                t('discountError') ||
                    'Discount cannot exceed transactional amount.'
            )
            return
        }
        setIsSaving(true)

        try {
            const updatedPayload: UpdateRevenueRequest = {
                transactionAmount: Number(transactionAmount),
                discountAmount: Number(discountAmount),
                paymentMethod,
                status,
                notes: notes.trim() || undefined,
            }

            if (transactionDate.trim()) {
                updatedPayload.transactionDate = new Date(
                    transactionDate
                ).toISOString()
            }

            const refreshedData = await updateRevenue(id, updatedPayload)
            setRevenue(refreshedData)

            setToast({ message: t('updateSuccess'), type: StatusEnum.SUCCESS })
            setIsEditing(false)
        } catch (err) {
            const backendErr = err as BackendErrorResponse
            setError(backendErr.message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteRevenue = async () => {
        if (!canWriteRevenue) return
        if (!window.confirm(t('confirmDelete'))) return

        setError(null)
        setIsDeleting(true)
        try {
            await deleteRevenue(id)
            router.push('/finance/revenues')
        } catch (err) {
            const backendErr = err as BackendErrorResponse
            setError(backendErr.message)
            setIsDeleting(false)
        }
    }

    return (
        <PageContainer id='revenue-details-page'>
            <PageHeader
                title={t('sectionTitle')}
                subtitle={`${tTech('id')}: ${revenue._id}`}
                Icon={GiTwoCoins}
            />

            {error && <ErrorMessages messages={error} />}

            <form onSubmit={handleSaveChanges}>
                <ContentSection>
                    <FormBoundaryActions
                        title={t('sectionTitle')}
                        position='top'
                        isEditing={isEditing}
                        isSaving={isSaving}
                        isDeleting={isDeleting}
                        hideControls={!canWriteRevenue}
                        onStartEditAction={handleStartEditing}
                        onCancelEditAction={handleCancelEditing}
                        onDeleteAction={handleDeleteRevenue}
                    />

                    <FieldsGrid>
                        {/* Transaction Base Amount */}
                        <DataDisplayBlock
                            label={t('transactionAmount')}
                            isEditing={isEditing}
                            viewValue={
                                <p>
                                    {revenue.transactionAmount.toLocaleString()}{' '}
                                    {tCurrency('egp')}
                                </p>
                            }
                            editInput={
                                <Input
                                    value={transactionAmount}
                                    onChangeAction={(val) =>
                                        setTransactionAmount(val)
                                    }
                                    placeholder={t(
                                        'transactionAmountPlaceholder'
                                    )}
                                    disabled={isSaving}
                                    type='number'
                                />
                            }
                        />

                        {/* Discount Amount */}
                        <DataDisplayBlock
                            label={t('discountAmount')}
                            isEditing={isEditing}
                            viewValue={
                                <p>
                                    {revenue.discountAmount.toLocaleString()}{' '}
                                    {tCurrency('egp')}
                                </p>
                            }
                            editInput={
                                <Input
                                    value={discountAmount}
                                    onChangeAction={(val) =>
                                        setDiscountAmount(val)
                                    }
                                    placeholder={t('discountAmountPlaceholder')}
                                    disabled={isSaving}
                                    type='number'
                                />
                            }
                        />

                        {/* Calculated Final Net Amount (Locked Audit Field) */}
                        <DataDisplayBlock
                            label={t('finalAmount')}
                            isLocked
                            viewValue={
                                <p>
                                    {revenue.finalAmount.toLocaleString()}{' '}
                                    {tCurrency('egp')}
                                </p>
                            }
                        />

                        {/* Connected Patient (Locked Field) */}
                        <DataDisplayBlock
                            label={t('patient')}
                            isLocked
                            viewValue={
                                locale === 'ar'
                                    ? revenue.visit?.patient?.fullNameAr
                                    : revenue.visit?.patient?.fullNameEn
                            }
                        />

                        {/* Assignee Doctor (Locked Field) */}
                        <DataDisplayBlock
                            label={t('doctor')}
                            isLocked
                            viewValue={
                                locale === 'ar'
                                    ? revenue.visit?.doctor?.fullNameAr ||
                                      revenue.visit?.doctor?.username
                                    : revenue.visit?.doctor?.fullNameEn ||
                                      revenue.visit?.doctor?.username
                            }
                        />

                        {/* Payment Method Selection */}
                        <DataDisplayBlock
                            label={t('paymentMethod')}
                            isEditing={isEditing}
                            viewValue={tMethod(revenue.paymentMethod)}
                            editInput={
                                <Select
                                    value={paymentMethod}
                                    onChangeAction={(val) =>
                                        setPaymentMethod(
                                            val as PaymentMethodEnum
                                        )
                                    }
                                    disabled={isSaving}
                                    options={Object.values(
                                        PaymentMethodEnum
                                    ).map((method) => ({
                                        value: method,
                                        label: tMethod(method),
                                    }))}
                                />
                            }
                        />

                        {/* Financial Ledger Status Badge */}
                        <DataDisplayBlock
                            label={t('status')}
                            isEditing={isEditing}
                            viewValue={
                                <StatusBadge
                                    text={tStatus(revenue.status)}
                                    variant={
                                        revenue.status === 'PAID'
                                            ? StatusEnum.SUCCESS
                                            : revenue.status === 'PENDING'
                                              ? StatusEnum.WARNING
                                              : StatusEnum.ERROR
                                    }
                                />
                            }
                            editInput={
                                <Select
                                    value={status}
                                    onChangeAction={(val) =>
                                        setStatus(val as FinancialStatusEnum)
                                    }
                                    disabled={isSaving}
                                    options={Object.values(
                                        FinancialStatusEnum
                                    ).map((stat) => ({
                                        value: stat,
                                        label: tStatus(stat),
                                    }))}
                                />
                            }
                        />

                        {/* Transaction Operational Date */}
                        <DataDisplayBlock
                            label={t('date')}
                            isEditing={isEditing}
                            viewValue={formatTimestamp(
                                locale,
                                revenue.transactionDate,
                                'full'
                            )}
                            editInput={
                                <Input
                                    value={transactionDate}
                                    onChangeAction={(val) =>
                                        setTransactionDate(val)
                                    }
                                    placeholder=''
                                    disabled={isSaving}
                                    type='datetime-local'
                                />
                            }
                        />

                        {/* System Entry Created By Auditor (Locked Field) */}
                        <DataDisplayBlock
                            label={t('recordedBy')}
                            isLocked
                            viewValue={
                                revenue.recordedBy
                                    ? locale === 'ar'
                                        ? revenue.recordedBy.fullNameAr ||
                                          revenue.recordedBy.username
                                        : revenue.recordedBy.fullNameEn ||
                                          revenue.recordedBy.username
                                    : t('systemAutomated')
                            }
                        />

                        {/* Remarks and Notes Textarea */}
                        <DataDisplayBlock
                            label={t('notes')}
                            isEditing={isEditing}
                            fullWidth
                            viewValue={revenue.notes}
                            editInput={
                                <TextArea
                                    value={notes}
                                    onChangeAction={(val) => setNotes(val)}
                                    placeholder={t('notesPlaceholder')}
                                    disabled={isSaving}
                                />
                            }
                        />

                        {/* Audit Log Timestamp - Created */}
                        <DataDisplayBlock
                            label={tTech('createdAt')}
                            isLocked
                            viewValue={formatTimestamp(
                                locale,
                                revenue.createdAt
                            )}
                        />

                        {/* Audit Log Timestamp - Updated */}
                        <DataDisplayBlock
                            label={tTech('updatedAt')}
                            isLocked
                            viewValue={formatTimestamp(
                                locale,
                                revenue.updatedAt
                            )}
                        />
                    </FieldsGrid>

                    <FormBoundaryActions
                        position='bottom'
                        isEditing={isEditing}
                        isSaving={isSaving}
                        hideControls={!canWriteRevenue}
                        onStartEditAction={handleStartEditing}
                        onCancelEditAction={handleCancelEditing}
                    />
                </ContentSection>
            </form>

            {toast && (
                <PopupMessage
                    message={toast.message}
                    type={toast.type}
                    onCloseAction={() => setToast(null)}
                />
            )}
        </PageContainer>
    )
}
