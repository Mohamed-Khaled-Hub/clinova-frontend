'use client'

// Core
import { useState, useEffect } from 'react'
import { FiTrendingUp, FiPieChart, FiDollarSign } from 'react-icons/fi'
import { useTranslations, useLocale } from 'next-intl'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    LineChart,
    Line,
    Rectangle,
} from 'recharts'
// Components
import Loading from '@/src/components/UiRelated/Loading'
import SummaryCard from '@/src/components/UiRelated/SummaryCard'
import PageHeader from '@/src/components/PagesRelated/PageHeader'
import PageContainer from '@/src/components/ContainerRelated/PageContainer'
// Enums
import { IntervalEnum } from '@/src/enums/finance.enum'
import { PermissionsEnum } from '@/src/enums/roles-permissions.enum'
// Functions
import { hasPermission } from '@/src/utils/functions'
// Hooks
import { useUser } from '@/src/providers/UserProvider'
import { useFinance } from '@/src/providers/FinanceProvider'
// Types
import { LocaleType } from '@/src/types/i18n.type'
import {
    FinanceGetSummaryResponse,
    FinanceGetTimelineResponse,
    FinanceGetRevenueByCategoryResponse,
    FinanceGetExpensesByCategoryResponse,
} from '@/src/types/backend/backend.responses.type'
// Variables
import { CHART_COLORS, LINE_COLORS } from '@/src/constants/ui.constant'
// Style
import '@/src/styles/pages/(root)/finance/page.css'

export default function FinancePage() {
    // Translations
    const t = useTranslations('FinancePage')
    const tCurrency = useTranslations('Currency')
    const tVisitCategory = useTranslations('VisitCategoryEnum')
    const tExpenseCategory = useTranslations('ExpenseCategoryEnum')

    // Context Providers
    const locale = useLocale() as LocaleType
    const { user, isLoadingProfile } = useUser()
    const {
        getSummary,
        getTimeline,
        getRevenueByCategory,
        getExpensesByCategory,
    } = useFinance()

    // Analytical State
    const [summary, setSummary] = useState<FinanceGetSummaryResponse | null>(
        null
    )
    const [timeline, setTimeline] = useState<FinanceGetTimelineResponse[]>([])
    const [revenueData, setRevenueData] = useState<
        FinanceGetRevenueByCategoryResponse[]
    >([])
    const [expensesData, setExpensesData] = useState<
        FinanceGetExpensesByCategoryResponse[]
    >([])
    const [isFetchingData, setIsFetchingData] = useState<boolean>(true)

    // Authorization Check
    const canReadFinance = hasPermission(
        user,
        PermissionsEnum.FINANCE,
        'canRead'
    )

    useEffect(() => {
        if (!canReadFinance || isLoadingProfile) return

        const fetchAnalyticsMetrics = async () => {
            setIsFetchingData(true)
            try {
                const currentYear = new Date().getFullYear().toString()
                const startDate = `${currentYear}-01-01`
                const endDate = `${currentYear}-12-31`

                const [summaryRes, timelineRes, revenueRes, expensesRes] =
                    await Promise.all([
                        getSummary(startDate, endDate),
                        getTimeline(currentYear, IntervalEnum.MONTHLY),
                        getRevenueByCategory(startDate, endDate),
                        getExpensesByCategory(startDate, endDate),
                    ])

                setSummary(summaryRes)
                setTimeline(timelineRes)
                setRevenueData(revenueRes)
                setExpensesData(
                    expensesRes.filter(
                        (e) => e.expense !== 0 || e.percentage !== 0
                    )
                )
            } catch (err) {
                console.error(
                    'Failed to resolve data ledger arrays from finance service controllers:',
                    err
                )
            } finally {
                setIsFetchingData(false)
            }
        }

        fetchAnalyticsMetrics().then()
    }, [
        getSummary,
        getTimeline,
        getExpensesByCategory,
        getRevenueByCategory,
        canReadFinance,
        isLoadingProfile,
    ])

    // Early termination
    if (isLoadingProfile || isFetchingData) {
        return <Loading />
    }

    if (!canReadFinance) return null

    return (
        <PageContainer className='!max-w-7xl' id='finance-analytics-page'>
            <PageHeader
                title={t('title')}
                subtitle={t('subtitle')}
                Icon={FiTrendingUp}
                noBorder
            />

            {/* Metrics Overview Cards Row */}
            {summary && (
                <div className='analytics-summary-grid'>
                    <SummaryCard
                        label={t('totalRevenue')}
                        value={`${summary.totalRevenue.toLocaleString(locale)} ${tCurrency('egp')}`}
                        Icon={FiDollarSign}
                    />
                    <SummaryCard
                        label={t('totalExpenses')}
                        value={`${summary.totalExpenses.toLocaleString(locale)} ${tCurrency('egp')}`}
                        Icon={FiPieChart}
                    />
                    <SummaryCard
                        label={t('netProfit')}
                        value={`${summary.netProfit.toLocaleString(locale)} ${tCurrency('egp')}`}
                        Icon={FiTrendingUp}
                    />
                </div>
            )}

            {/* Main Graphs Panel Layout Grid */}
            <div className='analytics-charts-matrix'>
                {/* Timeline Performance Line Chart */}
                <div className='chart-container full-width'>
                    <h4 className='chart-title'>
                        {t('financialTimelineTitle')}
                    </h4>
                    <div className='chart-wrapper'>
                        <ResponsiveContainer width='100%' height={320}>
                            <LineChart
                                data={timeline}
                                margin={{
                                    top: 10,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray='3 3'
                                    vertical={false}
                                />
                                <XAxis dataKey='period' />
                                <YAxis />
                                <Tooltip
                                    formatter={(value) => [
                                        `${value!.toLocaleString()} ${tCurrency('egp')}`,
                                    ]}
                                />
                                <Legend />
                                <Line
                                    type='monotone'
                                    dataKey='revenue'
                                    name={t('totalRevenue')}
                                    stroke={LINE_COLORS.totalRevenue}
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                                <Line
                                    type='monotone'
                                    dataKey='expense'
                                    name={t('totalExpenses')}
                                    stroke={LINE_COLORS.totalExpenses}
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                />
                                <Line
                                    type='monotone'
                                    dataKey='netProfit'
                                    name={t('netProfit')}
                                    stroke={LINE_COLORS.netProfit}
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Revenue Breakdowns Bar Chart */}
                <div className='chart-container'>
                    <h4 className='chart-title'>
                        {t('revenueByCategoryTitle')}
                    </h4>
                    <div className='chart-wrapper'>
                        <ResponsiveContainer width='100%' height={300}>
                            <BarChart
                                data={revenueData}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray='3 3'
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey='visitType'
                                    tickFormatter={(v) => tVisitCategory(v)}
                                />
                                <YAxis />
                                <Tooltip
                                    formatter={(value, _, props) => [
                                        `${value!.toLocaleString()} ${tCurrency('egp')}`,
                                        tVisitCategory(props.payload.visitType),
                                    ]}
                                />
                                <Bar
                                    dataKey='revenue'
                                    fill={CHART_COLORS[0]}
                                    radius={[4, 4, 0, 0]}
                                    shape={(props) => {
                                        return (
                                            <Rectangle
                                                {...props}
                                                fill={
                                                    CHART_COLORS[
                                                        props.index %
                                                            CHART_COLORS.length
                                                    ]
                                                }
                                            />
                                        )
                                    }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Expense Allocation Distribution Pie Chart */}
                <div className='chart-container'>
                    <h4 className='chart-title'>
                        {t('expensesByCategoryTitle')}
                    </h4>
                    <div className='chart-wrapper'>
                        <ResponsiveContainer width='100%' height={300}>
                            <PieChart>
                                <Pie
                                    data={expensesData.map((item, index) => ({
                                        ...item,
                                        fill: CHART_COLORS[
                                            index % CHART_COLORS.length
                                        ],
                                    }))}
                                    dataKey='expense'
                                    nameKey='expenseCategory'
                                    cx='50%'
                                    cy='50%'
                                    outerRadius={80}
                                />
                                <Tooltip
                                    formatter={(value, name) => [
                                        `${value!.toLocaleString()} ${tCurrency('egp')}`,
                                        tExpenseCategory(name as string),
                                    ]}
                                />
                                <Legend
                                    formatter={(value) =>
                                        tExpenseCategory(value)
                                    }
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </PageContainer>
    )
}
