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
    CreatePatientRequest,
    UpdatePatientRequest,
} from '@/src/types/backend/backend.requests.type'
import { PatientContextType } from '@/src/types/contexts.type'
import { PatientDocument } from '@/src/types/backend/documents.type'
import { MessageResponse } from '@/src/types/backend/backend.responses.type'
// Variables
import { api } from '@/src/utils/api'
import { endpoints } from '@/src/constants/server.constant'

// Context
export const PatientContext = createContext<PatientContextType>(
    {} as PatientContextType
)

// Hook
export const usePatient = () => {
    const context = useContext(PatientContext)
    if (!context) {
        throw new Error('usePatient must be used within a PatientProvider')
    }
    return context
}

// Provider
export default function PatientProvider({ children }: PropsWithChildren) {
    // GET /patients
    const getPatients = useCallback(async (): Promise<PatientDocument[]> => {
        const { data, error } = await catchBackendError(
            api.get<PatientDocument[]>(endpoints[EndpointsEnum.PATIENT].root)
        )

        if (error) throw error
        return data
    }, [])

    // GET /patients/search?term=...
    const searchPatients = useCallback(
        async (term?: string): Promise<PatientDocument[]> => {
            const { data, error } = await catchBackendError(
                api.get<PatientDocument[]>(
                    endpoints[EndpointsEnum.PATIENT].search(term)
                )
            )

            if (error) throw error
            return data
        },
        []
    )

    // GET /patients/:id
    const getPatientById = useCallback(
        async (id: string): Promise<PatientDocument> => {
            const { data, error } = await catchBackendError(
                api.get<PatientDocument>(
                    endpoints[EndpointsEnum.PATIENT].byId(id)
                )
            )

            if (error) throw error
            return data
        },
        []
    )

    // GET /patients/by-date?date=YYYY-MM-DD
    const getPatientsByDate = useCallback(
        async (date: string): Promise<PatientDocument[]> => {
            const { data, error } = await catchBackendError(
                api.get<PatientDocument[]>(
                    endpoints[EndpointsEnum.PATIENT].byDate(date)
                )
            )

            if (error) throw error
            return data
        },
        []
    )

    // POST /patients
    const createPatient = useCallback(
        async (
            createPatientData: CreatePatientRequest
        ): Promise<PatientDocument> => {
            const { data, error } = await catchBackendError(
                api.post<PatientDocument>(
                    endpoints[EndpointsEnum.PATIENT].root,
                    createPatientData
                )
            )

            if (error) throw error
            return data
        },
        []
    )

    // PATCH /patients/:id
    const updatePatient = useCallback(
        async (
            id: string,
            updatePatientData: UpdatePatientRequest
        ): Promise<PatientDocument> => {
            const { data, error } = await catchBackendError(
                api.patch<PatientDocument>(
                    endpoints[EndpointsEnum.PATIENT].byId(id),
                    updatePatientData
                )
            )

            if (error) throw error
            return data
        },
        []
    )

    // DELETE /patients/:id
    const deletePatient = useCallback(async (id: string): Promise<void> => {
        const { error } = await catchBackendError(
            api.delete<MessageResponse>(
                endpoints[EndpointsEnum.PATIENT].byId(id)
            )
        )

        if (error) throw error
    }, [])

    // Context Value
    const contextValue = useMemo(
        () => ({
            getPatients,
            getPatientById,
            getPatientsByDate,
            searchPatients,
            createPatient,
            updatePatient,
            deletePatient,
        }),
        [
            getPatients,
            getPatientById,
            getPatientsByDate,
            searchPatients,
            createPatient,
            updatePatient,
            deletePatient,
        ]
    )

    return (
        <PatientContext.Provider value={contextValue}>
            {children}
        </PatientContext.Provider>
    )
}
