'use client'

// Core
import { useLocale } from 'next-intl'
import { useReactToPrint } from 'react-to-print'
import { use, useEffect, useRef, useState } from 'react'
// Functions
import { hasPermission } from '@/src/utils/functions'
// Hooks
import { useUser } from '@/src/providers/UserProvider'
import { useMedicalDocuments } from '@/src/providers/MedicalDocumentsProvider'
// Components
import Loading from '@/src/components/UiRelated/Loading'
import ErrorMessages from '@/src/components/UiRelated/ErrorMessages'
import PageContainer from '@/src/components/ContainerRelated/PageContainer'
import MedicalDocumentCard from '@/src/components/MedicalDocumentsRelated/MedicalDocumentCard'
import MedicalDocumentBody from '@/src/components/MedicalDocumentsRelated/MedicalDocumentBody'
import MedicalDocumentHeader from '@/src/components/MedicalDocumentsRelated/MedicalDocumentHeader'
import MedicalDocumentFooter from '@/src/components/MedicalDocumentsRelated/MedicalDocumentFooter'
// Enums
import { PermissionsEnum } from '@/src/enums/roles-permissions.enum'
// Types
import { IdPageProps } from '@/src/types/props.type'
import {
    BackendErrorResponse,
    RadiologyRequestResponse,
} from '@/src/types/backend/backend.responses.type'
// Style
import '@/src/styles/pages/(root)/medical-documents/radiology-request/[id]/page.css'

export default function RadiologyRequestPage({ params }: IdPageProps) {
    // Params
    const { id } = use(params)

    // References
    const radiologyRequestRef = useRef<HTMLDivElement>(null)

    // From Providers
    const locale = useLocale()
    const { user, isLoadingProfile } = useUser()
    const { getRadiologyRequest } = useMedicalDocuments()

    // Page States
    const [data, setData] = useState<RadiologyRequestResponse | null>(null)
    const [isScreenLoading, setIsScreenLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | string[] | null>(null)

    useEffect(() => {
        const fetchDocument = async () => {
            try {
                setIsScreenLoading(true)
                const response = await getRadiologyRequest(id)
                setData(response)
            } catch (err) {
                const backendErr = err as BackendErrorResponse
                console.error('Error fetching radiology request:', backendErr)
                setError(
                    backendErr.message ||
                        'Failed to grab radiology request data.'
                )
            } finally {
                setIsScreenLoading(false)
            }
        }

        fetchDocument().then()
    }, [id, getRadiologyRequest])

    // Event Handlers
    const handlePrint = useReactToPrint({
        contentRef: radiologyRequestRef,
        documentTitle: 'Radiology_Request',
    })

    // Authorization Guard Check
    const canReadRadiologyRequest = hasPermission(
        user,
        PermissionsEnum.MEDICAL_DOCUMENTS,
        'canRead'
    )

    // Early Termination
    if (isLoadingProfile || isScreenLoading) {
        return <Loading />
    }

    if (error) {
        return (
            <PageContainer id='radiology-request-log-page'>
                <ErrorMessages messages={error} />
            </PageContainer>
        )
    }

    if (!data || !canReadRadiologyRequest) return null

    // Variables
    const { clinic, patient, visit } = data

    const activeWatermark = clinic.watermarkUrl || clinic.logoUrl

    return (
        <PageContainer id='radiology-request-log-page'>
            <MedicalDocumentCard
                cardRef={radiologyRequestRef}
                watermarkUrl={activeWatermark}
                onPrintAction={handlePrint}
                locale={locale}
            >
                <table className='radiology-request-print-table'>
                    <MedicalDocumentHeader
                        clinic={clinic}
                        patient={patient}
                        visit={visit}
                    />

                    <MedicalDocumentBody
                        documentType={'RADIOLOGY_REQUEST'}
                        notes={visit.notes}
                    />

                    <MedicalDocumentFooter
                        address={clinic.clinicAddress}
                        phones={clinic.clinicPhones}
                    />
                </table>
            </MedicalDocumentCard>
        </PageContainer>
    )
}
