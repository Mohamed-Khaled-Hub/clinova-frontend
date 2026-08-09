'use client'

// Core
import { useState } from 'react'
import { SubmitEvent } from 'react'
import { FaReceipt } from 'react-icons/fa'
import { useRouter } from '@/src/i18n/routing'
import { useTranslations } from 'next-intl'
// Components
import Input from '@/src/components/UiRelated/Input'
import Select from '@/src/components/UiRelated/Select'
import Loading from '@/src/components/UiRelated/Loading'
import TextArea from '@/src/components/UiRelated/TextArea'
import PageHeader from '@/src/components/PagesRelated/PageHeader'
import PopupMessage from '@/src/components/UiRelated/PopupMessage'
import FormControl from '@/src/components/PagesRelated/FormControl'
import ErrorMessages from '@/src/components/UiRelated/ErrorMessages'
import FormFieldSet from '@/src/components/PagesRelated/FormFieldSet'
import PageContainer from '@/src/components/ContainerRelated/PageContainer'
import FormBoundaryActions from '@/src/components/PagesRelated/FormBoundaryActions'
// Enums
import {
    ExpenseCategoryEnum,
    FinancialStatusEnum,
    PaymentMethodEnum,
} from '@/src/enums/schemas.enum'
import { StatusEnum } from '@/src/enums/ui.enum'
import { PermissionsEnum } from '@/src/enums/roles-permissions.enum'
// Functions
import { hasPermission } from '@/src/utils/functions'
// Hooks
import { useUser } from '@/src/providers/UserProvider'
import { useExpense } from '@/src/providers/ExpenseProvider'
// Types
import { CreateExpenseRequest } from '@/src/types/backend/backend.requests.type'
import { BackendErrorResponse } from '@/src/types/backend/backend.responses.type'
// Style
import '@/src/styles/pages/(root)/finance/expenses/create/page.css'

export default function CreateExpensePage() {
    // Translations
    const t = useTranslations('CreateExpensePage')
    const tCategory = useTranslations('ExpenseCategoryEnum')
    const tMethod = useTranslations('PaymentMethodEnum')
    const tStatus = useTranslations('FinancialStatusEnum')

    // From Providers
    const router = useRouter()
    const { createExpense } = useExpense()
    const { user, isLoadingProfile } = useUser()

    // Page States
    const [isSuccess, setIsSuccess] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formError, setFormError] = useState<string | string[] | null>(null)
    const [toast, setToast] = useState<{
        message: string
        type: StatusEnum
    } | null>(null)

    // Variables
    const now = new Date()
    const offsetMinutes = now.getTimezoneOffset()
    const localNow = new Date(now.getTime() - offsetMinutes * 60 * 1000)
    const initialDateTimeStr = localNow.toISOString().slice(0, 16)

    // Expense State
    const [formData, setFormData] = useState<CreateExpenseRequest>({
        expenseCategory: ExpenseCategoryEnum.SUPPLIES,
        expenseAmount: 0,
        expenseDate: initialDateTimeStr,
        paymentMethod: PaymentMethodEnum.CASH,
        status: FinancialStatusEnum.PAID,
        notes: '',
        customFields: {},
    })

    // Authorization Guard Check
    const canWriteExpense = hasPermission(
        user,
        PermissionsEnum.EXPENSE,
        'canWrite'
    )

    // Early Termination
    if (isLoadingProfile) {
        return <Loading />
    }

    if (!canWriteExpense) {
        return null
    }

    // Event Handlers
    const updateFormField = <K extends keyof CreateExpenseRequest>(
        fieldName: K,
        value: CreateExpenseRequest[K]
    ) => {
        setFormData((prev) => ({ ...prev, [fieldName]: value }))
    }

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault()
        setFormError(null)
        setIsSubmitting(true)

        const payload = { ...formData }

        const optionalKeys: (keyof CreateExpenseRequest)[] = ['notes']

        optionalKeys.forEach((key) => {
            const value = payload[key]
            if (typeof value === 'string' && !value.trim()) {
                delete payload[key]
            }
        })

        try {
            await createExpense(payload)
            setIsSuccess(true)
            setToast({ message: t('successMessage'), type: StatusEnum.SUCCESS })
        } catch (err) {
            const backendErr = err as BackendErrorResponse
            setFormError(backendErr.message)
            setIsSubmitting(false)
        }
    }

    const handlePopupClose = () => {
        setToast(null)
        if (isSuccess) router.push('/finance/expenses')
    }

    return (
        <PageContainer className='!max-w-5xl' id='create-expense-container'>
            <PageHeader
                title={t('title')}
                subtitle={t('subtitle')}
                Icon={FaReceipt}
            />

            {formError && <ErrorMessages messages={formError} />}

            <form onSubmit={handleSubmit} className='expense-form-element'>
                {/* Transaction Details */}
                <FormFieldSet legend={t('transactionDetails')} columns={2}>
                    <FormControl
                        id='expenseCategory'
                        label={t('category')}
                        required
                    >
                        <Select
                            id='expenseCategory'
                            value={formData.expenseCategory}
                            onChangeAction={(val) =>
                                updateFormField(
                                    'expenseCategory',
                                    val as ExpenseCategoryEnum
                                )
                            }
                            disabled={isSubmitting}
                            required
                            options={Object.values(ExpenseCategoryEnum).map(
                                (cat) => ({
                                    value: cat,
                                    label: tCategory.has(cat)
                                        ? tCategory(cat)
                                        : cat,
                                })
                            )}
                        />
                    </FormControl>

                    <FormControl
                        id='expenseAmount'
                        label={t('amount')}
                        required
                    >
                        <Input
                            id='expenseAmount'
                            type='number'
                            value={formData.expenseAmount}
                            onChangeAction={(val) =>
                                updateFormField('expenseAmount', Number(val))
                            }
                            placeholder={t('amountPlaceholder')}
                            disabled={isSubmitting}
                            min={0.01}
                            step='any'
                            required
                        />
                    </FormControl>
                </FormFieldSet>

                {/* Processing Meta Fields */}
                <FormFieldSet legend={t('processingMeta')} columns={3}>
                    <FormControl id='expenseDate' label={t('date')} required>
                        <Input
                            id='expenseDate'
                            type='datetime-local'
                            value={formData.expenseDate || ''}
                            onChangeAction={(val) =>
                                updateFormField('expenseDate', val)
                            }
                            disabled={isSubmitting}
                            required
                        />
                    </FormControl>

                    <FormControl
                        id='paymentMethod'
                        label={t('paymentMethod')}
                        required
                    >
                        <Select
                            id='paymentMethod'
                            value={formData.paymentMethod}
                            onChangeAction={(val) =>
                                updateFormField(
                                    'paymentMethod',
                                    val as PaymentMethodEnum
                                )
                            }
                            disabled={isSubmitting}
                            required
                            options={Object.values(PaymentMethodEnum).map(
                                (method) => ({
                                    value: method,
                                    label: tMethod.has(method)
                                        ? tMethod(method)
                                        : method,
                                })
                            )}
                        />
                    </FormControl>

                    <FormControl id='status' label={t('status')} required>
                        <Select
                            id='status'
                            value={formData.status}
                            onChangeAction={(val) =>
                                updateFormField(
                                    'status',
                                    val as FinancialStatusEnum
                                )
                            }
                            disabled={isSubmitting}
                            required
                            options={Object.values(FinancialStatusEnum).map(
                                (st) => ({
                                    value: st,
                                    label: tStatus.has(st) ? tStatus(st) : st,
                                })
                            )}
                        />
                    </FormControl>
                </FormFieldSet>

                {/* Notes */}
                <FormFieldSet legend={t('notesSection')} columns={1}>
                    <FormControl id='notes' label={t('notes')}>
                        <TextArea
                            id='notes'
                            value={formData.notes || ''}
                            onChangeAction={(val) =>
                                updateFormField('notes', val)
                            }
                            placeholder={t('notesPlaceholder')}
                            disabled={isSubmitting}
                        />
                    </FormControl>
                </FormFieldSet>

                <FormBoundaryActions
                    position='bottom'
                    mode='create'
                    isSaving={isSubmitting}
                    onCreateCancelAction={() => router.back()}
                />
            </form>

            {toast && (
                <PopupMessage
                    message={toast.message}
                    type={toast.type}
                    onCloseAction={handlePopupClose}
                />
            )}
        </PageContainer>
    )
}
