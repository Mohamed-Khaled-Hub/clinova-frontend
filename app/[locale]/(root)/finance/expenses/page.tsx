'use client'

// Core
import { FiPlusCircle, FiCalendar, FiCreditCard } from 'react-icons/fi'
import { FaReceipt } from 'react-icons/fa'
import { useRouter } from '@/src/i18n/routing'
import { useTranslations, useLocale } from 'next-intl'
import { useState, useEffect } from 'react'
// Components
import Button from '@/src/components/UiRelated/Button'
import Loading from '@/src/components/UiRelated/Loading'
import StatusBadge from '@/src/components/UiRelated/StatusBadge'
import PageHeader from '@/src/components/PagesRelated/PageHeader'
import PageContainer from '@/src/components/ContainerRelated/PageContainer'
import TableCell from '@/src/components/PagesRelated/TableCell'
import DataTable from '@/src/components/PagesRelated/DataTable'
// Enums
import { StatusEnum } from '@/src/enums/ui.enum'
import { PermissionsEnum } from '@/src/enums/roles-permissions.enum'
// Functions
import { formatTimestamp, hasPermission } from '@/src/utils/functions'
// Hooks
import { useUser } from '@/src/providers/UserProvider'
import { useExpense } from '@/src/providers/ExpenseProvider'
// Types
import { LocaleType } from '@/src/types/i18n.type'
import { TableColumnType } from '@/src/types/ui.type'
import { ExpenseResponse } from '@/src/types/backend/backend.responses.type'
// Style
import '@/src/styles/pages/(root)/finance/expenses/page.css'

export default function ExpensesPage() {
    // Translations
    const t = useTranslations('ExpensesPage')
    const tPages = useTranslations('Pages')
    const tCurrency = useTranslations('Currency')
    const tTech = useTranslations('SystemTechTerms')
    const tCategory = useTranslations('ExpenseCategoryEnum')
    const tPayment = useTranslations('PaymentMethodEnum')
    const tStatus = useTranslations('FinancialStatusEnum')

    // From Providers
    const router = useRouter()
    const locale = useLocale() as LocaleType
    const { getExpenses } = useExpense()
    const { user, isLoadingProfile } = useUser()

    // Page States
    const [expenses, setExpenses] = useState<ExpenseResponse[]>([])
    const [isLoadingExpenses, setIsLoadingExpenses] = useState<boolean>(true)

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

    // Fetch expenses on page mount
    useEffect(() => {
        const fetchExpenses = async () => {
            if (!canReadExpense) {
                setIsLoadingExpenses(false)
                return
            }

            try {
                const data = await getExpenses()
                setExpenses(data)
            } catch (error) {
                console.error('Failed to fetch expenses:', error)
            } finally {
                setIsLoadingExpenses(false)
            }
        }

        if (!isLoadingProfile) {
            fetchExpenses().then()
        }
    }, [canReadExpense, getExpenses, isLoadingProfile])

    // Early Termination
    if (isLoadingExpenses || isLoadingProfile) {
        return <Loading />
    }

    if (!expenses || !canReadExpense) {
        return null
    }

    // Table
    const tableColumns: TableColumnType<ExpenseResponse>[] = [
        {
            header: t('tableCategoryCol'),
            renderCell: (expense: ExpenseResponse) => (
                <TableCell
                    Icon={FaReceipt}
                    value={tCategory(expense.expenseCategory)}
                />
            ),
        },
        {
            header: t('tableAmountCol'),
            renderCell: (expense: ExpenseResponse) => (
                <TableCell variant='numeric'>
                    {expense.expenseAmount.toLocaleString(locale, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}{' '}
                    {tCurrency('egp')}
                </TableCell>
            ),
        },
        {
            header: t('tableDateCol'),
            renderCell: (expense: ExpenseResponse) => (
                <TableCell Icon={FiCalendar} variant='subtext'>
                    {formatTimestamp(locale, expense.expenseDate, 'full')}
                </TableCell>
            ),
        },
        {
            header: t('tablePaymentCol'),
            renderCell: (expense: ExpenseResponse) => (
                <TableCell Icon={FiCreditCard} variant='subtext'>
                    {tPayment(expense.paymentMethod)}
                </TableCell>
            ),
        },
        {
            header: t('tableStatusCol'),
            renderCell: (expense: ExpenseResponse) => (
                <TableCell>
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
                </TableCell>
            ),
        },
        {
            header: t('tableTimestampsCol'),
            renderCell: (expense: ExpenseResponse) => (
                <TableCell variant='stacked'>
                    <div>
                        <span>{tTech('createdAt')}: </span>
                        {formatTimestamp(locale, expense.createdAt)}
                    </div>
                    <div>
                        <span>{tTech('updatedAt')}: </span>
                        {formatTimestamp(locale, expense.updatedAt)}
                    </div>
                </TableCell>
            ),
        },
    ]

    return (
        <PageContainer className='!max-w-7xl' id='expenses-page'>
            <PageHeader
                title={t('title')}
                subtitle={t('subtitle')}
                action={
                    canWriteExpense ? (
                        <Button
                            href='/finance/expenses/create'
                            label={tPages('createExpense')}
                            Icon={FiPlusCircle}
                            variant='normal-dark'
                        />
                    ) : undefined
                }
                Icon={FaReceipt}
                noBorder
            />

            <DataTable
                data={expenses}
                columns={tableColumns}
                getRowKeyAction={(expense) => expense._id}
                onRowClickAction={(expense) =>
                    router.push(`/finance/expenses/${expense._id}`)
                }
                emptyStateMessage={t('noRecords')}
            />
        </PageContainer>
    )
}
