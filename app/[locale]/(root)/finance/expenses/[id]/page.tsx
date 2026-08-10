'use client'

// Core
import { FaReceipt } from 'react-icons/fa'
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
    ExpenseCategoryEnum,
    FinancialStatusEnum,
    PaymentMethodEnum,
} from '@/src/enums/schemas.enum'
import { PermissionsEnum } from '@/src/enums/roles-permissions.enum'
import { StatusEnum } from '@/src/enums/ui.enum'
// Functions
import { formatTimestamp, hasPermission } from '@/src/utils/functions'
// Hooks
import { useUser } from '@/src/providers/UserProvider'
import { useExpense } from '@/src/providers/ExpenseProvider'
// Types
import { LocaleType } from '@/src/types/i18n.type'
import { IdPageProps } from '@/src/types/props.type'
import {
    BackendErrorResponse,
    ExpenseResponse,
} from '@/src/types/backend/backend.responses.type'
import { UpdateExpenseRequest } from '@/src/types/backend/backend.requests.type'
// Style
import '@/src/styles/pages/(root)/finance/expenses/[id]/page.css'

export default function ExpenseDetailsPage({ params }: IdPageProps) {
    // Params
    const { id } = use(params)

    // Translations
    const t = useTranslations('ExpensePage')
    const tTech = useTranslations('SystemTechTerms')
    const tCurrency = useTranslations('Currency')
    const tCategory = useTranslations('ExpenseCategoryEnum')
    const tMethod = useTranslations('PaymentMethodEnum')
    const tStatus = useTranslations('FinancialStatusEnum')

    // From Providers
    const router = useRouter()
    const locale = useLocale() as LocaleType
    const { updateExpense, deleteExpense, getExpenseById } = useExpense()
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

    // Expense States
    const [expense, setExpense] = useState<ExpenseResponse | null>(null)
    const [expenseCategory, setExpenseCategory] = useState<ExpenseCategoryEnum>(
        ExpenseCategoryEnum.OTHER
    )
    const [expenseAmount, setExpenseAmount] = useState<string>('0')
    const [expenseDate, setExpenseDate] = useState<string>('')
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethodEnum>(
        PaymentMethodEnum.CASH
    )
    const [status, setStatus] = useState<FinancialStatusEnum>(
        FinancialStatusEnum.PAID
    )
    const [notes, setNotes] = useState<string>('')

    // Get Expense
    useEffect(() => {
        const fetchTargetExpense = async () => {
            try {
                setIsScreenLoading(true)
                const data = await getExpenseById(id)
                setExpense(data)
            } catch (err) {
                const backendErr = err as BackendErrorResponse
                setError(backendErr.message)
            } finally {
                setIsScreenLoading(false)
            }
        }
        fetchTargetExpense().then()
    }, [id, getExpenseById])

    // Authorization Guard Check
    const canReadExpense = hasPermission(
        user,
        PermissionsEnum.EXPENSE,
        'canRead'
    )

    const canWriteExpense = hasPermission(
        user,
        PermissionsEnum.EXPENSE,
        'canWrite'
    )

    // Early Termination
    if (isLoadingProfile || isScreenLoading) {
        return <Loading />
    }

    if (!expense || !canReadExpense) {
        return null
    }

    // Event Handlers
    const handleStartEditing = () => {
        if (!canWriteExpense) return
        setError(null)
        if (expense) {
            setExpenseCategory(expense.expenseCategory)
            setExpenseAmount(expense.expenseAmount.toString())
            setExpenseDate(
                expense.expenseDate
                    ? new Date(expense.expenseDate).toISOString().slice(0, 16)
                    : ''
            )
            setPaymentMethod(expense.paymentMethod)
            setStatus(expense.status)
            setNotes(expense.notes || '')
        }
        setIsEditing(true)
    }

    const handleCancelEditing = () => {
        setIsEditing(false)
        setError(null)
    }

    const handleSaveChanges = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!canWriteExpense) return
        setError(null)
        setIsSaving(true)

        try {
            const updatedPayload: UpdateExpenseRequest = {
                expenseCategory,
                expenseAmount: Number(expenseAmount),
                paymentMethod,
                status,
                notes: notes.trim() || undefined,
            }

            if (expenseDate.trim()) {
                updatedPayload.expenseDate = new Date(expenseDate).toISOString()
            }

            const refreshedData = await updateExpense(id, updatedPayload)
            setExpense(refreshedData)

            setToast({ message: t('updateSuccess'), type: StatusEnum.SUCCESS })
            setIsEditing(false)
        } catch (err) {
            const backendErr = err as BackendErrorResponse
            setError(backendErr.message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteExpense = async () => {
        if (!canWriteExpense) return
        if (!window.confirm(t('confirmDelete'))) return

        setError(null)
        setIsDeleting(true)
        try {
            await deleteExpense(id)
            router.push('/finance/expenses')
        } catch (err) {
            const backendErr = err as BackendErrorResponse
            setError(backendErr.message)
            setIsDeleting(false)
        }
    }

    return (
        <PageContainer id='expense-details-page'>
            <PageHeader
                title={t('sectionTitle')}
                subtitle={`${tTech('id')}: ${expense._id}`}
                Icon={FaReceipt}
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
                        hideControls={!canWriteExpense}
                        onStartEditAction={handleStartEditing}
                        onCancelEditAction={handleCancelEditing}
                        onDeleteAction={handleDeleteExpense}
                    />

                    <FieldsGrid>
                        {/* Expense Amount */}
                        <DataDisplayBlock
                            label={t('amount')}
                            isEditing={isEditing}
                            viewValue={
                                <p>
                                    {expense.expenseAmount.toLocaleString()}{' '}
                                    {tCurrency('egp')}
                                </p>
                            }
                            editInput={
                                <Input
                                    value={expenseAmount}
                                    onChangeAction={(val) =>
                                        setExpenseAmount(val)
                                    }
                                    placeholder={t('amountPlaceholder')}
                                    disabled={isSaving}
                                    type='number'
                                />
                            }
                        />

                        {/* Expense Category */}
                        <DataDisplayBlock
                            label={t('category')}
                            isEditing={isEditing}
                            viewValue={tCategory(expense.expenseCategory)}
                            editInput={
                                <Select
                                    value={expenseCategory}
                                    onChangeAction={(val) =>
                                        setExpenseCategory(
                                            val as ExpenseCategoryEnum
                                        )
                                    }
                                    disabled={isSaving}
                                    options={Object.values(
                                        ExpenseCategoryEnum
                                    ).map((cat) => ({
                                        value: cat,
                                        label: tCategory(cat),
                                    }))}
                                />
                            }
                        />

                        {/* Payment Method */}
                        <DataDisplayBlock
                            label={t('paymentMethod')}
                            isEditing={isEditing}
                            viewValue={tMethod(expense.paymentMethod)}
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

                        {/* Financial Status */}
                        <DataDisplayBlock
                            label={t('status')}
                            isEditing={isEditing}
                            viewValue={
                                <StatusBadge
                                    text={tStatus(expense.status)}
                                    variant={
                                        expense.status === 'PAID'
                                            ? StatusEnum.SUCCESS
                                            : expense.status === 'PENDING'
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

                        {/* Expense Date & Time */}
                        <DataDisplayBlock
                            label={t('date')}
                            isEditing={isEditing}
                            viewValue={formatTimestamp(
                                locale,
                                expense.expenseDate,
                                'full'
                            )}
                            editInput={
                                <Input
                                    value={expenseDate}
                                    onChangeAction={(val) =>
                                        setExpenseDate(val)
                                    }
                                    placeholder=''
                                    disabled={isSaving}
                                    type='datetime-local'
                                />
                            }
                        />

                        {/* Recorded By (Locked Field) */}
                        <DataDisplayBlock
                            label={t('recordedBy')}
                            isLocked
                            viewValue={
                                locale === 'ar'
                                    ? expense.recordedBy?.fullNameAr ||
                                      expense.recordedBy?.username
                                    : expense.recordedBy?.fullNameEn ||
                                      expense.recordedBy?.username
                            }
                        />

                        {/* Notes Field */}
                        <DataDisplayBlock
                            label={t('notes')}
                            isEditing={isEditing}
                            fullWidth
                            viewValue={expense.notes}
                            editInput={
                                <TextArea
                                    value={notes}
                                    onChangeAction={(val) => setNotes(val)}
                                    placeholder={t('notesPlaceholder')}
                                    disabled={isSaving}
                                />
                            }
                        />

                        {/* Meta Audits */}
                        <DataDisplayBlock
                            label={tTech('createdAt')}
                            isLocked
                            viewValue={formatTimestamp(
                                locale,
                                expense.createdAt,
                                'relative'
                            )}
                        />

                        <DataDisplayBlock
                            label={tTech('updatedAt')}
                            isLocked
                            viewValue={formatTimestamp(
                                locale,
                                expense.updatedAt,
                                'relative'
                            )}
                        />
                    </FieldsGrid>

                    <FormBoundaryActions
                        position='bottom'
                        isEditing={isEditing}
                        isSaving={isSaving}
                        hideControls={!canWriteExpense}
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
