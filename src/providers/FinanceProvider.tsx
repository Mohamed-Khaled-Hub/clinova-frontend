'use client'

// Core
import {
    PropsWithChildren,
    createContext,
    useContext,
    useCallback,
    useMemo,
} from 'react'
// Enums
import { EndpointsEnum } from '@/src/enums/endpoints.enum'
import { IntervalEnum } from '@/src/enums/finance.enum'
// Functions
import { catchBackendError } from '@/src/utils/functions'
// Types
import {
    FinanceGetSummaryResponse,
    FinanceGetTimelineResponse,
    FinanceGetRevenueByCategoryResponse,
    FinanceGetExpensesByCategoryResponse,
} from '@/src/types/backend/backend.responses.type'
import { FinanceContextType } from '@/src/types/contexts.type'
// Variables
import { api } from '@/src/utils/api'
import { endpoints } from '@/src/constants/server.constant'

// Context
export const FinanceContext = createContext<FinanceContextType>(
    {} as FinanceContextType
)

// Hook
export const useFinance = () => {
    const context = useContext(FinanceContext)
    if (!context) {
        throw new Error('useFinance must be used within a FinanceProvider')
    }
    return context
}

// Provider
export default function FinanceProvider({ children }: PropsWithChildren) {
    // GET /finance/summary?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
    const getSummary = useCallback(
        async (
            startDate: string,
            endDate: string
        ): Promise<FinanceGetSummaryResponse> => {
            const { data, error } = await catchBackendError(
                api.get<FinanceGetSummaryResponse>(
                    endpoints[EndpointsEnum.FINANCE].summary(startDate, endDate)
                )
            )

            if (error) throw error
            return data
        },
        []
    )

    // GET /finance/timeline?interval=[monthly|weekly|daily]&year=YYYY
    const getTimeline = useCallback(
        async (
            year: string,
            interval?: IntervalEnum
        ): Promise<FinanceGetTimelineResponse[]> => {
            const { data, error } = await catchBackendError(
                api.get<FinanceGetTimelineResponse[]>(
                    interval
                        ? endpoints[EndpointsEnum.FINANCE].timeline(
                              year,
                              interval
                          )
                        : endpoints[EndpointsEnum.FINANCE].timeline(year)
                )
            )

            if (error) throw error
            return data
        },
        []
    )

    // GET /finance/revenue-by-category?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
    const getRevenueByCategory = useCallback(
        async (
            startDate: string,
            endDate: string
        ): Promise<FinanceGetRevenueByCategoryResponse[]> => {
            const { data, error } = await catchBackendError(
                api.get<FinanceGetRevenueByCategoryResponse[]>(
                    endpoints[EndpointsEnum.FINANCE].revenueByCategory(
                        startDate,
                        endDate
                    )
                )
            )

            if (error) throw error
            return data
        },
        []
    )

    // GET /finance/expenses-by-category?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
    const getExpensesByCategory = useCallback(
        async (
            startDate: string,
            endDate: string
        ): Promise<FinanceGetExpensesByCategoryResponse[]> => {
            const { data, error } = await catchBackendError(
                api.get<FinanceGetExpensesByCategoryResponse[]>(
                    endpoints[EndpointsEnum.FINANCE].expensesByCategory(
                        startDate,
                        endDate
                    )
                )
            )

            if (error) throw error
            return data
        },
        []
    )

    // Context Value
    const contextValue = useMemo(
        () => ({
            getSummary,
            getTimeline,
            getRevenueByCategory,
            getExpensesByCategory,
        }),
        [getSummary, getTimeline, getRevenueByCategory, getExpensesByCategory]
    )

    return (
        <FinanceContext.Provider value={contextValue}>
            {children}
        </FinanceContext.Provider>
    )
}
