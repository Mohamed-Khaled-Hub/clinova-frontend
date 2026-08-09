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
import { ExpenseCategoryEnum } from '@/src/enums/schemas.enum'
// Functions
import { catchBackendError } from '@/src/utils/functions'
// Types
import {
    CreateExpenseRequest,
    UpdateExpenseRequest,
} from '@/src/types/backend/backend.requests.type'
import { ExpenseResponse } from '@/src/types/backend/backend.responses.type'
import { ExpenseContextType } from '@/src/types/contexts.type'
// Variables
import { api } from '@/src/utils/api'
import { endpoints } from '@/src/constants/server.constant'

// Context
export const ExpenseContext = createContext<ExpenseContextType>(
    {} as ExpenseContextType
)

// Hook
export const useExpense = () => {
    const context = useContext(ExpenseContext)
    if (!context) {
        throw new Error('useExpense must be used within an ExpenseProvider')
    }
    return context
}

// Provider
export default function ExpenseProvider({ children }: PropsWithChildren) {
    // GET /expenses
    const getExpenses = useCallback(async (): Promise<ExpenseResponse[]> => {
        const { data, error } = await catchBackendError(
            api.get<ExpenseResponse[]>(endpoints[EndpointsEnum.EXPENSE].root)
        )

        if (error) throw error
        return data
    }, [])

    // POST /expenses
    const createExpense = useCallback(
        async (
            createExpenseData: CreateExpenseRequest
        ): Promise<ExpenseResponse> => {
            const { data, error } = await catchBackendError(
                api.post<ExpenseResponse>(
                    endpoints[EndpointsEnum.EXPENSE].root,
                    createExpenseData
                )
            )

            if (error) throw error
            return data
        },
        []
    )

    // GET /expenses/:id
    const getExpenseById = useCallback(
        async (id: string): Promise<ExpenseResponse> => {
            const { data, error } = await catchBackendError(
                api.get<ExpenseResponse>(
                    endpoints[EndpointsEnum.EXPENSE].byId(id)
                )
            )

            if (error) throw error
            return data
        },
        []
    )

    // GET /expenses/category/:category
    const getExpensesByCategory = useCallback(
        async (category: ExpenseCategoryEnum): Promise<ExpenseResponse[]> => {
            const { data, error } = await catchBackendError(
                api.get<ExpenseResponse[]>(
                    endpoints[EndpointsEnum.EXPENSE].byCategory(category)
                )
            )

            if (error) throw error
            return data
        },
        []
    )

    // PATCH /expenses/:id
    const updateExpense = useCallback(
        async (
            id: string,
            updateExpenseData: UpdateExpenseRequest
        ): Promise<ExpenseResponse> => {
            const { data, error } = await catchBackendError(
                api.patch<ExpenseResponse>(
                    endpoints[EndpointsEnum.EXPENSE].byId(id),
                    updateExpenseData
                )
            )

            if (error) throw error
            return data
        },
        []
    )

    // DELETE /expenses/:id
    const deleteExpense = useCallback(async (id: string): Promise<void> => {
        const { error } = await catchBackendError(
            api.delete(endpoints[EndpointsEnum.EXPENSE].byId(id))
        )

        if (error) throw error
    }, [])

    // Context Value
    const contextValue = useMemo(
        () => ({
            getExpenses,
            createExpense,
            getExpenseById,
            getExpensesByCategory,
            updateExpense,
            deleteExpense,
        }),
        [
            getExpenses,
            createExpense,
            getExpenseById,
            getExpensesByCategory,
            updateExpense,
            deleteExpense,
        ]
    )

    return (
        <ExpenseContext.Provider value={contextValue}>
            {children}
        </ExpenseContext.Provider>
    )
}
