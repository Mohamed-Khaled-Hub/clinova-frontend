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
import MedicalDocumentFooter from '@/src/components/MedicalDocumentsRelated/MedicalDocumentFooter'
import MedicalDocumentHeader from '@/src/components/MedicalDocumentsRelated/MedicalDocumentHeader'
// Enums
import { PermissionsEnum } from '@/src/enums/roles-permissions.enum'
// Types
import { IdPageProps } from '@/src/types/props.type'
import {
    BackendErrorResponse,
    LabRequestResponse,
} from '@/src/types/backend/backend.responses.type'
// Style
import '@/src/styles/pages/(root)/medical-documents/lab-request/[id]/page.css'

export default function LabRequestPage({ params }: IdPageProps) {
    // Params
    const { id } = use(params)

    // References
    const labRequestRef = useRef<HTMLDivElement>(null)

    // From Providers
    const locale = useLocale()
    const { user, isLoadingProfile } = useUser()
    const { getLabRequest } = useMedicalDocuments()

    // Page States
    const [data, setData] = useState<LabRequestResponse | null>(null)
    const [isScreenLoading, setIsScreenLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | string[] | null>(null)

    useEffect(() => {
        const fetchDocument = async () => {
            try {
                setIsScreenLoading(true)
                const response = await getLabRequest(id)
                setData(response)
            } catch (err) {
                const backendErr = err as BackendErrorResponse
                console.error('Error fetching lab request:', backendErr)
                setError(
                    backendErr.message || 'Failed to grab lab request data.'
                )
            } finally {
                setIsScreenLoading(false)
            }
        }

        fetchDocument().then()
    }, [id, getLabRequest])

    // Event Handlers
    const handlePrint = useReactToPrint({
        contentRef: labRequestRef,
        documentTitle: 'Lab_Request',
    })

    // Authorization Guard Check
    const canReadLabRequest = hasPermission(
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
            <PageContainer id='lab-request-log-page'>
                <ErrorMessages messages={error} />
            </PageContainer>
        )
    }

    if (!data || !canReadLabRequest) return null

    // Variables
    const { clinic, patient, visit } = data

    const activeWatermark = clinic.watermarkUrl || clinic.logoUrl

    return (
        <PageContainer id='lab-request-log-page'>
            <MedicalDocumentCard
                cardRef={labRequestRef}
                watermarkUrl={activeWatermark}
                onPrintAction={handlePrint}
                locale={locale}
            >
                <table className='lab-request-print-table'>
                    <MedicalDocumentHeader
                        clinic={clinic}
                        patient={patient}
                        visit={visit}
                    />

                    <MedicalDocumentBody
                        documentType={'LAB_REQUEST'}
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
