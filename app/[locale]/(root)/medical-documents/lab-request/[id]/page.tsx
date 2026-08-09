'use client'

// Core
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import { useReactToPrint } from 'react-to-print'
import { use, useEffect, useRef, useState } from 'react'
import {
    FaBirthdayCake,
    FaCalendarAlt,
    FaCalendarPlus,
    FaHeartbeat,
    FaMapMarkerAlt,
    FaPhoneAlt,
    FaPrint,
    FaUser,
} from 'react-icons/fa'
// Fonts
import { mainFont } from '@/src/fonts/fonts'
// Functions
import { hasPermission } from '@/src/utils/functions'
// Hooks
import { useUser } from '@/src/providers/UserProvider'
import { useMedicalDocuments } from '@/src/providers/MedicalDocumentsProvider'
// Components
import Button from '@/src/components/UiRelated/Button'
import Loading from '@/src/components/UiRelated/Loading'
import ErrorMessages from '@/src/components/UiRelated/ErrorMessages'
import PageContainer from '@/src/components/ContainerRelated/PageContainer'
// Enums
import { NoteCategoryEnum } from '@/src/enums/schemas.enum'
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

    // Translations
    const t = useTranslations('MedicalDocuments')
    const tAge = useTranslations('Age')
    const tUnits = useTranslations('Units')
    const tNoteCat = useTranslations('NoteCategoryEnum')

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

        fetchDocument()
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

    const calculatedBmi =
        visit.weight && visit.height && visit.height > 0
            ? (visit.weight / Math.pow(visit.height / 100, 2)).toFixed(1)
            : null

    const activeWatermark = clinic.watermarkUrl || clinic.logoUrl

    const diagnosisNotes =
        visit.notes?.filter(
            (note) => note.category === NoteCategoryEnum.DIAGNOSIS
        ) || []

    const labNotes =
        visit.notes?.filter(
            (note) => note.category === NoteCategoryEnum.REQUESTED_LAB_TESTS
        ) || []

    const diagnosisText = diagnosisNotes.map((n) => n.noteText).join(', ')

    return (
        <PageContainer id='lab-request-log-page'>
            <div className='lab-request-card-container group'>
                {/* Print Button Container */}
                <div className='lab-request-print-btn-wrapper'>
                    <Button
                        variant='normal-dark'
                        Icon={FaPrint}
                        onClick={handlePrint}
                    />
                </div>

                <div
                    className={`lab-request-card ${mainFont.className}`}
                    ref={labRequestRef}
                    dir={locale === 'ar' ? 'rtl' : 'ltr'}
                >
                    {/* Background Watermark (Fixed on every printed page) */}
                    {activeWatermark && (
                        <div className='lab-request-watermark-wrapper'>
                            <div className='lab-request-watermark-container'>
                                <Image
                                    src={activeWatermark}
                                    alt='Watermark'
                                    fill
                                    className='object-contain'
                                />
                            </div>
                        </div>
                    )}

                    <table className='lab-request-print-table'>
                        {/* REPEATED HEADER & METADATA ON EVERY PAGE */}
                        <thead>
                            <tr>
                                <td>
                                    <div className='lab-request-header-wrapper'>
                                        <div className='lab-request-header'>
                                            {/* Left Section: Main Clinic Logo */}
                                            <div className='lab-request-header-main-logo'>
                                                {clinic.logoUrl && (
                                                    <div className='lab-request-logo-wrapper is-main'>
                                                        <Image
                                                            src={clinic.logoUrl}
                                                            alt='Clinic Logo'
                                                            fill
                                                            className='object-contain'
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Center Section: Secondary Logo */}
                                            <div className='lab-request-header-secondary-logo'>
                                                {clinic.secondaryLogoUrl && (
                                                    <div className='lab-request-logo-wrapper'>
                                                        <Image
                                                            src={
                                                                clinic.secondaryLogoUrl
                                                            }
                                                            alt='Secondary Logo'
                                                            fill
                                                            className='object-contain'
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right Section: Info */}
                                            <div className='lab-request-header-info'>
                                                {clinic.name && (
                                                    <h1 className='lab-request-clinic-name'>
                                                        {clinic.name}
                                                    </h1>
                                                )}
                                                <h2 className='lab-request-doctor-name'>
                                                    {clinic.doctorName}
                                                </h2>
                                                {clinic.specialization && (
                                                    <p className='lab-request-doctor-specialization'>
                                                        {clinic.specialization}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className='lab-request-divider-gradient-header' />

                                        {/* METADATA */}
                                        <div className='lab-request-metadata-wrapper'>
                                            <div className='lab-request-metadata-row'>
                                                <div className='lab-request-metadata-item'>
                                                    <FaUser className='lab-request-metadata-icon' />
                                                    <span className='lab-request-metadata-key'>
                                                        {t('patientName')}:
                                                    </span>
                                                    <span className='lab-request-metadata-value'>
                                                        {patient.name}
                                                    </span>
                                                </div>

                                                {patient.age > 0 && (
                                                    <div className='lab-request-metadata-item'>
                                                        <FaBirthdayCake className='lab-request-metadata-icon' />
                                                        <span className='lab-request-metadata-key'>
                                                            {t('age')}:
                                                        </span>
                                                        <span className='lab-request-metadata-value'>
                                                            {patient.age}{' '}
                                                            {tAge('years')}
                                                        </span>
                                                    </div>
                                                )}

                                                {visit.visitDate && (
                                                    <div className='lab-request-metadata-item'>
                                                        <FaCalendarAlt className='lab-request-metadata-icon' />
                                                        <span className='lab-request-metadata-key'>
                                                            {t('visitDate')}:
                                                        </span>
                                                        <span className='lab-request-metadata-value'>
                                                            {visit.visitDate}
                                                        </span>
                                                    </div>
                                                )}

                                                {visit.nextVisitDate && (
                                                    <div className='lab-request-metadata-item'>
                                                        <FaCalendarPlus className='lab-request-metadata-icon' />
                                                        <span className='lab-request-metadata-key'>
                                                            {t('nextVisit')}:
                                                        </span>
                                                        <span className='lab-request-metadata-value'>
                                                            {
                                                                visit.nextVisitDate
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Vitals Row */}
                                            {(visit.height !== null ||
                                                visit.weight !== null ||
                                                visit.bloodPressure !== null ||
                                                calculatedBmi !== null) && (
                                                <div className='lab-request-metadata-vitals-row'>
                                                    <div className='lab-request-vitals-label'>
                                                        <FaHeartbeat className='lab-request-metadata-icon' />
                                                        <span>
                                                            {t('vitals')}:
                                                        </span>
                                                    </div>

                                                    {visit.height !== null && (
                                                        <div>
                                                            <span className='lab-request-metadata-key'>
                                                                {t('height')}
                                                                :{' '}
                                                            </span>
                                                            <span className='lab-request-metadata-value'>
                                                                {visit.height}{' '}
                                                                {tUnits('cm')}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {visit.weight !== null && (
                                                        <div>
                                                            <span className='lab-request-metadata-key'>
                                                                {t('weight')}
                                                                :{' '}
                                                            </span>
                                                            <span className='lab-request-metadata-value'>
                                                                {visit.weight}{' '}
                                                                {tUnits('kg')}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {visit.bloodPressure !==
                                                        null && (
                                                        <div>
                                                            <span className='lab-request-metadata-key'>
                                                                {t(
                                                                    'bloodPressure'
                                                                )}
                                                                :{' '}
                                                            </span>
                                                            <span className='lab-request-metadata-value'>
                                                                {
                                                                    visit.bloodPressure
                                                                }{' '}
                                                                {tUnits('mmHg')}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {calculatedBmi !== null && (
                                                        <div>
                                                            <span className='lab-request-metadata-key'>
                                                                {t('bmi')}:{' '}
                                                            </span>
                                                            <span className='lab-request-metadata-value'>
                                                                {calculatedBmi}{' '}
                                                                {tUnits('kgm2')}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className='lab-request-divider-gradient-bottom' />
                                    </div>
                                </td>
                            </tr>
                        </thead>

                        {/* DYNAMIC CONTENT BODY */}
                        <tbody>
                            <tr>
                                <td className='lab-request-table-cell-body'>
                                    <div className='lab-request-body-content'>
                                        {diagnosisText && (
                                            <div className='lab-request-diagnosis-block'>
                                                <h3 className='lab-request-diagnosis-title'>
                                                    {tNoteCat('DIAGNOSIS')}:
                                                </h3>
                                                <p className='lab-request-diagnosis-text'>
                                                    {diagnosisText}
                                                </p>
                                            </div>
                                        )}

                                        <h3 className='lab-request-section-title'>
                                            {tNoteCat('REQUESTED_LAB_TESTS')}:
                                        </h3>

                                        <div className='lab-request-notes-container'>
                                            {labNotes.length === 0 ? (
                                                <p className='lab-request-notes-empty'>
                                                    {t('noLabNotes')}
                                                </p>
                                            ) : (
                                                <ul className='lab-request-notes-list'>
                                                    {labNotes.map(
                                                        (note, idx) => (
                                                            <li
                                                                key={idx}
                                                                className='lab-request-note-item'
                                                            >
                                                                {note.noteText}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>

                        {/* REPEATED SPACER AT BOTTOM OF EVERY PAGE */}
                        <tfoot>
                            <tr>
                                <td>
                                    <div className='lab-request-tfoot-spacer' />
                                </td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* Fixed Footer + Doctor Signature locked to bottom edge on every printed page */}
                    <div className='lab-request-footer-container'>
                        <div className='lab-request-signature-wrapper'>
                            <div className='lab-request-signature-box'>
                                <span className='lab-request-signature-label'>
                                    {t('doctorSignature')}
                                </span>
                                <div className='lab-request-signature-area'>
                                    <div className='lab-request-signature-line' />
                                </div>
                            </div>
                        </div>

                        <div className='lab-request-footer-wrapper'>
                            <div className='lab-request-divider-gradient-footer' />
                            <div className='lab-request-footer'>
                                {clinic.clinicAddress && (
                                    <div className='lab-request-footer-item'>
                                        <FaMapMarkerAlt className='lab-request-footer-icon' />
                                        <span>{clinic.clinicAddress}</span>
                                    </div>
                                )}
                                {clinic.clinicPhones &&
                                    clinic.clinicPhones.length > 0 && (
                                        <div
                                            className='lab-request-footer-item is-phone'
                                            dir='ltr'
                                        >
                                            <FaPhoneAlt className='lab-request-footer-icon' />
                                            <span>
                                                {clinic.clinicPhones.join(
                                                    ' / '
                                                )}
                                            </span>
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageContainer>
    )
}
