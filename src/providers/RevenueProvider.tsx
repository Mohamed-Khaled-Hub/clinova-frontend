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
// Functions
import { catchBackendError } from '@/src/utils/functions'
// Types
import {
    CreateRevenueRequest,
    UpdateRevenueRequest,
} from '@/src/types/backend/backend.requests.type'
import { RevenueResponse } from '@/src/types/backend/backend.responses.type'
import { RevenueContextType } from '@/src/types/contexts.type'
// Variables
import { api } from '@/src/utils/api'
import { endpoints } from '@/src/constants/server.constant'

// Context
export const RevenueContext = createContext<RevenueContextType>(
    {} as RevenueContextType
)

// Hook
export const useRevenue = () => {
    const context = useContext(RevenueContext)
    if (!context) {
        throw new Error('useRevenue must be used within a RevenueProvider')
    }
    return context
}

// Provider
export default function RevenueProvider({ children }: PropsWithChildren) {
    // GET /revenues
    const getRevenues = useCallback(async (): Promise<RevenueResponse[]> => {
        const { data, error } = await catchBackendError(
            api.get<RevenueResponse[]>(endpoints[EndpointsEnum.REVENUE].root)
        )

        if (error) throw error
        return data
    }, [])

    // POST /revenues
    const createRevenue = useCallback(
        async (
            createRevenueData: CreateRevenueRequest
        ): Promise<RevenueResponse> => {
            const { data, error } = await catchBackendError(
                api.post<RevenueResponse>(
                    endpoints[EndpointsEnum.REVENUE].root,
                    createRevenueData
                )
            )

            if (error) throw error
            return data
        },
        []
    )

    // GET /revenues/:id
    const getRevenueById = useCallback(
        async (id: string): Promise<RevenueResponse> => {
            const { data, error } = await catchBackendError(
                api.get<RevenueResponse>(
                    endpoints[EndpointsEnum.REVENUE].byId(id)
                )
            )

            if (error) throw error
            return data
        },
        []
    )

    // GET /revenues/visit/:visitId
    const getRevenueByVisitId = useCallback(
        async (visitId: string): Promise<RevenueResponse> => {
            const { data, error } = await catchBackendError(
                api.get<RevenueResponse>(
                    endpoints[EndpointsEnum.REVENUE].byVisitId(visitId)
                )
            )

            if (error) throw error
            return data
        },
        []
    )

    // PATCH /revenues/:id
    const updateRevenue = useCallback(
        async (
            id: string,
            updateRevenueData: UpdateRevenueRequest
        ): Promise<RevenueResponse> => {
            const { data, error } = await catchBackendError(
                api.patch<RevenueResponse>(
                    endpoints[EndpointsEnum.REVENUE].byId(id),
                    updateRevenueData
                )
            )

            if (error) throw error
            return data
        },
        []
    )

    // DELETE /revenues/:id
    const deleteRevenue = useCallback(async (id: string): Promise<void> => {
        const { error } = await catchBackendError(
            api.delete(endpoints[EndpointsEnum.REVENUE].byId(id))
        )

        if (error) throw error
    }, [])

    // Context Value
    const contextValue = useMemo(
        () => ({
            getRevenues,
            createRevenue,
            getRevenueById,
            getRevenueByVisitId,
            updateRevenue,
            deleteRevenue,
        }),
        [
            getRevenues,
            createRevenue,
            getRevenueById,
            getRevenueByVisitId,
            updateRevenue,
            deleteRevenue,
        ]
    )

    return (
        <RevenueContext.Provider value={contextValue}>
            {children}
        </RevenueContext.Provider>
    )
}
