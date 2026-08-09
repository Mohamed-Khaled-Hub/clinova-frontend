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
import { NoteCategoryEnum } from '@/src/enums/schemas.enum'
// Functions
import { catchBackendError } from '@/src/utils/functions'
// Types
import {
    CreateVisitRequest,
    UpdateVisitRequest,
} from '@/src/types/backend/backend.requests.type'
import { VisitResponse } from '@/src/types/backend/backend.responses.type'
import { VisitContextType } from '@/src/types/contexts.type'
// Variables
import { api } from '@/src/utils/api'
import { endpoints } from '@/src/constants/server.constant'

// Context
export const VisitContext = createContext<VisitContextType>(
    {} as VisitContextType
)

// Hook
export const useVisit = () => {
    const context = useContext(VisitContext)
    if (!context) {
        throw new Error('useVisit must be used within a VisitProvider')
    }
    return context
}

// Provider
export default function VisitProvider({ children }: PropsWithChildren) {
    // GET /visits
    const getVisits = useCallback(async (): Promise<VisitResponse[]> => {
        const { data, error } = await catchBackendError(
            api.get<VisitResponse[]>(endpoints[EndpointsEnum.VISIT].root)
        )

        if (error) throw error
        return data
    }, [])

    // POST /visits
    const createVisit = useCallback(
        async (createVisitData: CreateVisitRequest): Promise<VisitResponse> => {
            const { data, error } = await catchBackendError(
                api.post<VisitResponse>(
                    endpoints[EndpointsEnum.VISIT].root,
                    createVisitData
                )
            )

            if (error) throw error
            return data
        },
        []
    )

    // GET /visits/notes/suggestions?search=...
    const getNotesSuggestions = useCallback(
        async (
            search?: string,
            category?: NoteCategoryEnum
        ): Promise<string[]> => {
            const { data, error } = await catchBackendError(
                api.get<string[]>(
                    endpoints[EndpointsEnum.VISIT].notesSuggestions(
                        search,
                        category
                    )
                )
            )

            if (error) throw error
            return data
        },
        []
    )

    // GET /visits/:id
    const getVisitById = useCallback(
        async (id: string): Promise<VisitResponse> => {
            const { data, error } = await catchBackendError(
                api.get<VisitResponse>(endpoints[EndpointsEnum.VISIT].byId(id))
            )

            if (error) throw error
            return data
        },
        []
    )

    // GET /visits/patient/:patientId
    const getVisitsByPatientId = useCallback(
        async (patientId: string): Promise<VisitResponse[]> => {
            const { data, error } = await catchBackendError(
                api.get<VisitResponse[]>(
                    endpoints[EndpointsEnum.VISIT].byPatientId(patientId)
                )
            )

            if (error) throw error
            return data
        },
        []
    )

    // GET /visits/by-date?date=YYYY-MM-DD
    const getVisitsByDate = useCallback(
        async (date: string): Promise<VisitResponse[]> => {
            const { data, error } = await catchBackendError(
                api.get<VisitResponse[]>(
                    endpoints[EndpointsEnum.VISIT].byDate(date)
                )
            )

            if (error) throw error
            return data
        },
        []
    )

    // PATCH /visits/:id
    const updateVisit = useCallback(
        async (
            id: string,
            updateVisitData: UpdateVisitRequest
        ): Promise<VisitResponse> => {
            const { data, error } = await catchBackendError(
                api.patch<VisitResponse>(
                    endpoints[EndpointsEnum.VISIT].byId(id),
                    updateVisitData
                )
            )

            if (error) throw error
            return data
        },
        []
    )

    // DELETE /visits/:id
    const deleteVisit = useCallback(async (id: string): Promise<void> => {
        const { error } = await catchBackendError(
            api.delete(endpoints[EndpointsEnum.VISIT].byId(id))
        )

        if (error) throw error
    }, [])

    // Context Value
    const contextValue = useMemo(
        () => ({
            getVisits,
            createVisit,
            getNotesSuggestions,
            getVisitById,
            getVisitsByDate,
            getVisitsByPatientId,
            updateVisit,
            deleteVisit,
        }),
        [
            getVisits,
            createVisit,
            getNotesSuggestions,
            getVisitById,
            getVisitsByDate,
            getVisitsByPatientId,
            updateVisit,
            deleteVisit,
        ]
    )

    return (
        <VisitContext.Provider value={contextValue}>
            {children}
        </VisitContext.Provider>
    )
}
