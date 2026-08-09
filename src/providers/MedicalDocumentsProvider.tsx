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
    PrescriptionResponse,
    LabRequestResponse,
    RadiologyRequestResponse,
} from '@/src/types/backend/backend.responses.type'
import { MedicalDocumentsContextType } from '@/src/types/contexts.type'
// Variables
import { api } from '@/src/utils/api'
import { endpoints } from '@/src/constants/server.constant'

// Context
export const MedicalDocumentsContext =
    createContext<MedicalDocumentsContextType>(
        {} as MedicalDocumentsContextType
    )

// Hook
export const useMedicalDocuments = () => {
    const context = useContext(MedicalDocumentsContext)
    if (!context) {
        throw new Error(
            'useMedicalDocuments must be used within a MedicalDocumentsProvider'
        )
    }
    return context
}

// Provider
export default function MedicalDocumentsProvider({
    children,
}: PropsWithChildren) {
    // GET /medical-documents/prescription/:visitId
    const getPrescription = useCallback(
        async (visitId: string): Promise<PrescriptionResponse> => {
            const { data, error } = await catchBackendError(
                api.get<PrescriptionResponse>(
                    endpoints[EndpointsEnum.MEDICAL_DOCUMENTS].prescription(
                        visitId
                    )
                )
            )

            if (error) throw error
            return data
        },
        []
    )

    // GET /medical-documents/lab-request/:visitId
    const getLabRequest = useCallback(
        async (visitId: string): Promise<LabRequestResponse> => {
            const { data, error } = await catchBackendError(
                api.get<LabRequestResponse>(
                    endpoints[EndpointsEnum.MEDICAL_DOCUMENTS].labRequest(
                        visitId
                    )
                )
            )

            if (error) throw error
            return data
        },
        []
    )

    // GET /medical-documents/radiology-request/:visitId
    const getRadiologyRequest = useCallback(
        async (visitId: string): Promise<RadiologyRequestResponse> => {
            const { data, error } = await catchBackendError(
                api.get<RadiologyRequestResponse>(
                    endpoints[EndpointsEnum.MEDICAL_DOCUMENTS].radiologyRequest(
                        visitId
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
        () => ({ getPrescription, getLabRequest, getRadiologyRequest }),
        [getPrescription, getLabRequest, getRadiologyRequest]
    )

    return (
        <MedicalDocumentsContext.Provider value={contextValue}>
            {children}
        </MedicalDocumentsContext.Provider>
    )
}
