'use client'

// Core
import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { GiTwoCoins } from 'react-icons/gi'
import { FaReceipt, FaStethoscope, FaUserInjured } from 'react-icons/fa'
import {
    FiDollarSign,
    FiGrid,
    FiKey,
    FiSettings,
    FiShield,
    FiTrendingUp,
    FiUser,
    FiUsers,
} from 'react-icons/fi'
// Components
import Button from '@/src/components/UiRelated/Button'
import Loading from '@/src/components/UiRelated/Loading'
import SummaryCard from '@/src/components/UiRelated/SummaryCard'
import PageHeader from '@/src/components/PagesRelated/PageHeader'
import PageContainer from '@/src/components/ContainerRelated/PageContainer'
// Enums
import { PermissionsEnum } from '@/src/enums/roles-permissions.enum'
// Functions
import { hasPermission } from '@/src/utils/functions'
// Hooks
import { useUser } from '@/src/providers/UserProvider'
import { useVisit } from '@/src/providers/VisitProvider'
import { usePatient } from '@/src/providers/PatientProvider'
// Types
import { LocaleType } from '@/src/types/i18n.type'
// Style
import '@/src/styles/pages/(root)/dashboard/page.css'

export default function DashboardPage() {
    // Translations
    const t = useTranslations('DashboardPage')
    const tPages = useTranslations('Pages')
    const locale = useLocale() as LocaleType

    // From Providers
    const { getVisitsByDate } = useVisit()
    const { getPatientsByDate } = usePatient()
    const { user, isLoadingProfile } = useUser()

    // Analytical State
    const [todayVisitsCount, setTodayVisitsCount] = useState<number>(0)
    const [todayPatientsCount, setTodayPatientsCount] = useState<number>(0)
    const [isFetchingData, setIsFetchingData] = useState<boolean>(true)

    // Authorization Checks
    const canReadVisits = hasPermission(user, PermissionsEnum.VISIT, 'canRead')
    const canReadPatients = hasPermission(
        user,
        PermissionsEnum.PATIENT,
        'canRead'
    )

    useEffect(() => {
        if (isLoadingProfile) return

        const fetchDailyMetrics = async () => {
            setIsFetchingData(true)
            try {
                const today = new Date().toISOString().split('T')[0]

                const [visitsRes, patientsRes] = await Promise.all([
                    canReadVisits
                        ? getVisitsByDate(today)
                        : Promise.resolve([]),
                    canReadPatients
                        ? getPatientsByDate(today)
                        : Promise.resolve([]),
                ])

                setTodayVisitsCount(visitsRes.length)
                setTodayPatientsCount(patientsRes.length)
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
        canReadVisits,
        canReadPatients,
        isLoadingProfile,
    ])

    // Quick Actions Config Matrix
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
            {(canReadVisits || canReadPatients) && (
                <section className='dashboard-summary-section'>
                    <h2 className='dashboard-section-title'>{t('summary')}</h2>
                    <div className='dashboard-summary-grid'>
                        {canReadVisits && (
                            <SummaryCard
                                label={t('todaysVisits')}
                                value={todayVisitsCount.toLocaleString(locale)}
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
        </PageContainer>
    )
}
