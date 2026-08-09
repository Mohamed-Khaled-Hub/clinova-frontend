'use client'

// Core
import { useState, useEffect } from 'react'
import { FiCalendar, FiCreditCard, FiUser } from 'react-icons/fi'
import { GiTwoCoins } from 'react-icons/gi'
import { useRouter } from '@/src/i18n/routing'
import { useTranslations, useLocale } from 'next-intl'
// Components
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
import { useRevenue } from '@/src/providers/RevenueProvider'
// Types
import { LocaleType } from '@/src/types/i18n.type'
import { TableColumnType } from '@/src/types/ui.type'
import { RevenueResponse } from '@/src/types/backend/backend.responses.type'
// Style
import '@/src/styles/pages/(root)/finance/revenues/page.css'

export default function RevenuesPage() {
    // Translations
    const t = useTranslations('RevenuesPage')
    const tTech = useTranslations('SystemTechTerms')
    const tCurrency = useTranslations('Currency')
    const tPayment = useTranslations('PaymentMethodEnum')
    const tStatus = useTranslations('FinancialStatusEnum')

    // From Providers
    const router = useRouter()
    const locale = useLocale() as LocaleType
    const { getRevenues } = useRevenue()
    const { user, isLoadingProfile } = useUser()

    // Revenue States
    const [revenues, setRevenues] = useState<RevenueResponse[] | null>(null)
    const [isLoadingRevenues, setIsLoadingRevenues] = useState<boolean>(true)

    // Authorization Guard Check
    const canReadRevenue = hasPermission(
        user,
        PermissionsEnum.REVENUE,
        'canRead'
    )

    // Fetch Revenues Effect
    useEffect(() => {
        if (!canReadRevenue) return

        let isMounted = true

        const fetchRevenuesData = async () => {
            try {
                setIsLoadingRevenues(true)
                const data = await getRevenues()
                if (isMounted && data) {
                    setRevenues(data)
                }
            } catch (err) {
                console.error('Failed to search revenues:', err)
            } finally {
                if (isMounted) {
                    setIsLoadingRevenues(false)
                }
            }
        }

        fetchRevenuesData().then()

        return () => {
            isMounted = false
        }
    }, [getRevenues, canReadRevenue])

    // Early Termination
    if (isLoadingRevenues || isLoadingProfile) {
        return <Loading />
    }

    if (!revenues || !canReadRevenue) {
        return null
    }

    // Table
    const tableColumns: TableColumnType<RevenueResponse>[] = [
        {
            header: t('tablePatientCol'),
            renderCell: (revenue: RevenueResponse) => {
                const patientName =
                    locale === 'ar'
                        ? revenue.visit?.patient?.fullNameAr
                        : revenue.visit?.patient?.fullNameEn
                return (
                    <TableCell
                        Icon={FiUser}
                        value={patientName || t('unknownPatient')}
                    />
                )
            },
        },
        {
            header: t('tableFinalAmountCol'),
            renderCell: (revenue: RevenueResponse) => (
                <TableCell variant='numeric'>
                    {revenue.finalAmount.toLocaleString(locale, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}{' '}
                    {tCurrency('egp')}
                </TableCell>
            ),
        },
        {
            header: t('tableDateCol'),
            renderCell: (revenue: RevenueResponse) => (
                <TableCell Icon={FiCalendar} variant='subtext'>
                    {formatTimestamp(locale, revenue.transactionDate, 'full')}
                </TableCell>
            ),
        },
        {
            header: t('tablePaymentCol'),
            renderCell: (revenue: RevenueResponse) => (
                <TableCell Icon={FiCreditCard} variant='subtext'>
                    {tPayment(revenue.paymentMethod)}
                </TableCell>
            ),
        },
        {
            header: t('tableStatusCol'),
            renderCell: (revenue: RevenueResponse) => (
                <TableCell>
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
                </TableCell>
            ),
        },
        {
            header: t('tableTimestampsCol'),
            renderCell: (revenue: RevenueResponse) => (
                <TableCell variant='stacked'>
                    <div>
                        <span>{tTech('createdAt')}: </span>
                        {formatTimestamp(locale, revenue.createdAt)}
                    </div>
                    <div>
                        <span>{tTech('updatedAt')}: </span>
                        {formatTimestamp(locale, revenue.updatedAt)}
                    </div>
                </TableCell>
            ),
        },
    ]

    return (
        <PageContainer className='!max-w-7xl' id='revenues-page'>
            <PageHeader
                title={t('title')}
                subtitle={t('subtitle')}
                Icon={GiTwoCoins}
                noBorder
            />

            <DataTable
                data={revenues}
                columns={tableColumns}
                getRowKeyAction={(revenue) => revenue._id}
                onRowClickAction={(revenue) =>
                    router.push(`/finance/revenues/${revenue._id}`)
                }
                emptyStateMessage={t('noRecords')}
            />
        </PageContainer>
    )
}
