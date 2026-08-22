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
    PrescriptionResponse,
} from '@/src/types/backend/backend.responses.type'
// Style
import '@/src/styles/pages/(root)/medical-documents/prescription/[id]/page.css'

export default function PrescriptionPage({ params }: IdPageProps) {
    // Params
    const { id } = use(params)

    // References
    const prescriptionRef = useRef<HTMLDivElement>(null)

    // From Providers
    const locale = useLocale()
    const { user, isLoadingProfile } = useUser()
    const { getPrescription } = useMedicalDocuments()

    // Page States
    const [data, setData] = useState<PrescriptionResponse | null>(null)
    const [isScreenLoading, setIsScreenLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | string[] | null>(null)

    useEffect(() => {
        const fetchDocument = async () => {
            try {
                setIsScreenLoading(true)
                const response = await getPrescription(id)
                setData(response)
            } catch (err) {
                const backendErr = err as BackendErrorResponse
                console.error('Error fetching prescription:', backendErr)
                setError(
                    backendErr.message || 'Failed to grab prescription data.'
                )
            } finally {
                setIsScreenLoading(false)
            }
        }

        fetchDocument().then()
    }, [id, getPrescription])

    // Event Handlers
    const handlePrint = useReactToPrint({
        contentRef: prescriptionRef,
        documentTitle: 'Prescription',
    })

    // Authorization Guard Check
    const canReadPrescription = hasPermission(
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
            <PageContainer id='prescription-log-page'>
                <ErrorMessages messages={error} />
            </PageContainer>
        )
    }

    if (!data || !canReadPrescription) return null

    // Variables
    const { clinic, patient, visit } = data

    const activeWatermark = clinic.watermarkUrl || clinic.logoUrl

    return (
        <PageContainer id='prescription-log-page'>
            <MedicalDocumentCard
                cardRef={prescriptionRef}
                watermarkUrl={activeWatermark}
                onPrintAction={handlePrint}
                locale={locale}
            >
                <table className='prescription-print-table'>
                    <MedicalDocumentHeader
                        clinic={clinic}
                        patient={patient}
                        visit={visit}
                    />

                    <MedicalDocumentBody
                        documentType={'PRESCRIPTION'}
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
