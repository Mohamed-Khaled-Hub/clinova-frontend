'use client'

// Core
import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { GiTwoCoins } from 'react-icons/gi'
import { FaReceipt, FaStethoscope, FaUserInjured } from 'react-icons/fa'
import {
    FiCalendar,
    FiDollarSign,
    FiGrid,
    FiKey,
    FiSettings,
    FiShield,
    FiTrendingUp,
    FiUser,
    FiUsers,
} from 'react-icons/fi'
import { useRouter } from '@/src/i18n/routing'
// Components
import Button from '@/src/components/UiRelated/Button'
import Loading from '@/src/components/UiRelated/Loading'
import SummaryCard from '@/src/components/UiRelated/SummaryCard'
import PageHeader from '@/src/components/PagesRelated/PageHeader'
import PageContainer from '@/src/components/ContainerRelated/PageContainer'
import TableCell from '@/src/components/PagesRelated/TableCell'
import DataTable from '@/src/components/PagesRelated/DataTable'
// Enums
import { PermissionsEnum } from '@/src/enums/roles-permissions.enum'
// Functions
import { formatTimestamp, hasPermission } from '@/src/utils/functions'
// Hooks
import { useUser } from '@/src/providers/UserProvider'
import { useVisit } from '@/src/providers/VisitProvider'
import { usePatient } from '@/src/providers/PatientProvider'
import { useFinance } from '@/src/providers/FinanceProvider'
// Types
import { LocaleType } from '@/src/types/i18n.type'
import { TableColumnType } from '@/src/types/ui.type'
import { VisitResponse } from '@/src/types/backend/backend.responses.type'
// Style
import '@/src/styles/pages/(root)/dashboard/page.css'

export default function DashboardPage() {
    // Translations
    const t = useTranslations('DashboardPage')
    const tVisits = useTranslations('VisitsPage')
    const tPages = useTranslations('Pages')
    const tTech = useTranslations('SystemTechTerms')
    const tCategory = useTranslations('VisitCategoryEnum')

    // From Providers
    const locale = useLocale() as LocaleType
    const router = useRouter()
    const { getVisitsByDate } = useVisit()
    const { getPatientsByDate } = usePatient()
    const { getSummary } = useFinance()
    const { user, isLoadingProfile } = useUser()

    // Analytical State
    const [todayVisitsList, setTodayVisitsList] = useState<VisitResponse[]>([])
    const [todayPatientsCount, setTodayPatientsCount] = useState<number>(0)
    const [todayNetProfit, setTodayNetProfit] = useState<number>(0)
    const [isFetchingData, setIsFetchingData] = useState<boolean>(true)

    // Authorization Checks
    const canReadVisits = hasPermission(user, PermissionsEnum.VISIT, 'canRead')
    const canReadPatients = hasPermission(
        user,
        PermissionsEnum.PATIENT,
        'canRead'
    )
    const canReadFinance = hasPermission(
        user,
        PermissionsEnum.FINANCE,
        'canRead'
    )

    const hasAnySummaryPermission =
        canReadVisits || canReadPatients || canReadFinance

    useEffect(() => {
        if (isLoadingProfile) return

        const fetchDailyMetrics = async () => {
            setIsFetchingData(true)
            try {
                const todayFormatted = new Date().toISOString().split('T')[0]

                // Construct start and end of today
                const startOfToday = new Date()
                startOfToday.setHours(0, 0, 0, 0)

                const endOfToday = new Date()
                endOfToday.setHours(23, 59, 59, 999)

                const [visitsRes, patientsRes, summaryRes] = await Promise.all([
                    canReadVisits
                        ? getVisitsByDate(todayFormatted)
                        : Promise.resolve([]),
                    canReadPatients
                        ? getPatientsByDate(todayFormatted)
                        : Promise.resolve([]),
                    canReadFinance
                        ? getSummary(
                              startOfToday.toISOString(),
                              endOfToday.toISOString()
                          )
                        : Promise.resolve(null),
                ])

                setTodayVisitsList(visitsRes || [])
                setTodayPatientsCount(patientsRes?.length || 0)
                setTodayNetProfit(
                    summaryRes?.netProfit ?? summaryRes?.netProfit ?? 0
                )
            } catch (err) {
                console.error('Failed to fetch dashboard metrics:', err)
            } finally {
                setIsFetchingData(false)
            }
        }

        fetchDailyMetrics().then()
    }, [
        getVisitsByDate,
        getPatientsByDate,
        getSummary,
        canReadVisits,
        canReadPatients,
        canReadFinance,
        isLoadingProfile,
    ])

    // Quick Actions Buttons
    const quickActions = [
        {
            href: '/profile',
            label: tPages('profile'),
            Icon: FiUser,
            show: true,
        },
        {
            href: '/admin/users/create',
            label: tPages('createUser'),
            Icon: FiUsers,
            show: hasPermission(user, PermissionsEnum.USER, 'canWrite'),
        },
        {
            href: '/admin/roles/create',
            label: tPages('createRole'),
            Icon: FiKey,
            show: hasPermission(user, PermissionsEnum.ROLE, 'canWrite'),
        },
        {
            href: '/admin/permissions/create',
            label: tPages('createPermission'),
            Icon: FiShield,
            show: hasPermission(user, PermissionsEnum.PERMISSION, 'canWrite'),
        },
        {
            href: '/patients/create',
            label: tPages('createPatient'),
            Icon: FaUserInjured,
            show: hasPermission(user, PermissionsEnum.PATIENT, 'canWrite'),
        },
        {
            href: '/visits/create',
            label: tPages('createVisit'),
            Icon: FaStethoscope,
            show: hasPermission(user, PermissionsEnum.VISIT, 'canWrite'),
        },
        {
            href: '/price-catalog',
            label: tPages('priceCatalog'),
            Icon: FiDollarSign,
            show: hasPermission(user, PermissionsEnum.PRICE_CATALOG, 'canRead'),
        },
        {
            href: '/finance',
            label: tPages('finance'),
            Icon: FiTrendingUp,
            show: hasPermission(user, PermissionsEnum.FINANCE, 'canRead'),
        },
        {
            href: '/finance/expenses/create',
            label: tPages('createExpense'),
            Icon: FaReceipt,
            show: hasPermission(user, PermissionsEnum.EXPENSE, 'canWrite'),
        },
        {
            href: '/finance/revenues',
            label: tPages('revenues'),
            Icon: GiTwoCoins,
            show: hasPermission(user, PermissionsEnum.REVENUE, 'canRead'),
        },
        {
            href: '/settings',
            label: tPages('settings'),
            Icon: FiSettings,
            show: hasPermission(user, PermissionsEnum.SETTINGS, 'canRead'),
        },
    ].filter((action) => action.show)

    // Today's Visits Columns
    const tableColumns: TableColumnType<VisitResponse>[] = [
        {
            header: tVisits('tablePatientCol'),
            renderCell: (visit: VisitResponse) => {
                const localizedPatientName =
                    locale === 'ar'
                        ? visit.patient.fullNameAr || visit.patient.fullNameEn
                        : visit.patient.fullNameEn || visit.patient.fullNameAr

                return <TableCell Icon={FiUser} value={localizedPatientName} />
            },
        },
        {
            header: tVisits('tableCategoryCol'),
            renderCell: (visit: VisitResponse) => (
                <TableCell
                    Icon={FaStethoscope}
                    value={tCategory(visit.visitType)}
                />
            ),
        },
        {
            header: tVisits('tableDoctorCol'),
            renderCell: (visit: VisitResponse) => {
                const localizedDoctorName =
                    locale === 'ar'
                        ? visit.doctor.fullNameAr || visit.doctor.fullNameEn
                        : visit.doctor.fullNameEn || visit.doctor.fullNameAr

                return (
                    <TableCell variant='subtext'>
                        {localizedDoctorName || visit.doctor.username}
                    </TableCell>
                )
            },
        },
        {
            header: tVisits('tableDateCol'),
            renderCell: (visit: VisitResponse) => (
                <TableCell Icon={FiCalendar} variant='subtext'>
                    {formatTimestamp(locale, visit.visitDate, 'full')}
                </TableCell>
            ),
        },
        {
            header: tVisits('tableTimestampsCol'),
            renderCell: (visit: VisitResponse) => (
                <TableCell variant='stacked'>
                    <div>
                        <span>{tTech('createdAt')}: </span>
                        {formatTimestamp(locale, visit.createdAt, 'relative')}
                    </div>
                    <div>
                        <span>{tTech('updatedAt')}: </span>
                        {formatTimestamp(locale, visit.updatedAt, 'relative')}
                    </div>
                </TableCell>
            ),
        },
    ]

    // Early Termination
    if (isLoadingProfile || isFetchingData) {
        return <Loading />
    }

    return (
        <PageContainer className='!max-w-7xl' id='dashboard-page'>
            <PageHeader
                title={t('title')}
                subtitle={t('subtitle')}
                Icon={FiGrid}
                noBorder
            />

            {/* Daily Summary Section */}
            {hasAnySummaryPermission && (
                <section className='dashboard-summary-section'>
                    <h2 className='dashboard-section-title'>{t('summary')}</h2>
                    <div className='dashboard-summary-grid'>
                        {canReadVisits && (
                            <SummaryCard
                                label={t('todaysVisits')}
                                value={todayVisitsList.length.toLocaleString(
                                    locale
                                )}
                                Icon={FaStethoscope}
                            />
                        )}
                        {canReadPatients && (
                            <SummaryCard
                                label={t('todaysPatients')}
                                value={todayPatientsCount.toLocaleString(
                                    locale
                                )}
                                Icon={FaUserInjured}
                            />
                        )}
                        {canReadFinance && (
                            <SummaryCard
                                label={t('todaysNetProfit')}
                                value={todayNetProfit.toLocaleString(locale, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                                Icon={FiTrendingUp}
                            />
                        )}
                    </div>
                </section>
            )}

            {/* Quick Actions Matrix */}
            <section className='dashboard-quick-actions-section'>
                <h2 className='dashboard-section-title'>{t('quickActions')}</h2>
                <div className='quick-actions-grid'>
                    {quickActions.map((action) => (
                        <Button
                            key={action.href}
                            href={action.href}
                            label={action.label}
                            Icon={action.Icon}
                            variant='normal-dark'
                        />
                    ))}
                </div>
            </section>

            {/* Today's Visits Table Section */}
            {canReadVisits && (
                <section className='dashboard-table-section'>
                    <h2 className='dashboard-section-title'>
                        {t('todaysVisitsTableTitle')}
                    </h2>
                    <DataTable
                        data={todayVisitsList}
                        columns={tableColumns}
                        getRowKeyAction={(visit) => visit._id}
                        onRowClickAction={(visit) =>
                            router.push(`/visits/${visit._id}`)
                        }
                        emptyStateMessage={tVisits('noRecords')}
                    />
                </section>
            )}
        </PageContainer>
    )
}
