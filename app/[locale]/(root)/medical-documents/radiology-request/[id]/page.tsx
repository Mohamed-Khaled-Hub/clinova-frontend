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
    RadiologyRequestResponse,
} from '@/src/types/backend/backend.responses.type'
// Style
import '@/src/styles/pages/(root)/medical-documents/radiology-request/[id]/page.css'

export default function RadiologyRequestPage({ params }: IdPageProps) {
    // Params
    const { id } = use(params)

    // References
    const radiologyRequestRef = useRef<HTMLDivElement>(null)

    // Translations
    const t = useTranslations('MedicalDocuments')
    const tAge = useTranslations('Age')
    const tUnits = useTranslations('Units')
    const tNoteCat = useTranslations('NoteCategoryEnum')

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

    const calculatedBmi =
        visit.weight && visit.height && visit.height > 0
            ? (visit.weight / Math.pow(visit.height / 100, 2)).toFixed(1)
            : null

    const activeWatermark = clinic.watermarkUrl || clinic.logoUrl

    const diagnosisNotes =
        visit.notes?.filter(
            (note) => note.category === NoteCategoryEnum.DIAGNOSIS
        ) || []

    const diagnosisText = diagnosisNotes.map((n) => n.noteText).join(', ')

    const requestedRadiologyNotes =
        visit.notes?.filter(
            (note) => note.category === NoteCategoryEnum.REQUESTED_RADIOLOGY
        ) || []

    const categorySections = [
        {
            category: NoteCategoryEnum.HISTORY,
            notes:
                visit.notes?.filter(
                    (note) => note.category === NoteCategoryEnum.HISTORY
                ) || [],
        },
        {
            category: NoteCategoryEnum.COMPLAINT,
            notes:
                visit.notes?.filter(
                    (note) => note.category === NoteCategoryEnum.COMPLAINT
                ) || [],
        },
        {
            category: NoteCategoryEnum.REQUESTED_RADIOLOGY,
            notes:
                visit.notes?.filter(
                    (note) =>
                        note.category === NoteCategoryEnum.REQUESTED_RADIOLOGY
                ) || [],
        },
    ]

    return (
        <PageContainer id='radiology-request-log-page'>
            <div className='radiology-request-card-container group'>
                {/* Print Button Container */}
                <div className='radiology-request-print-btn-wrapper'>
                    <Button
                        variant='normal-dark'
                        Icon={FaPrint}
                        onClick={handlePrint}
                    />
                </div>

                <div
                    className={`radiology-request-card ${mainFont.className}`}
                    ref={radiologyRequestRef}
                    dir={locale === 'ar' ? 'rtl' : 'ltr'}
                >
                    {/* Background Watermark (Fixed across all pages) */}
                    {activeWatermark && (
                        <div className='radiology-request-watermark-wrapper'>
                            <div className='radiology-request-watermark-container'>
                                <Image
                                    src={activeWatermark}
                                    alt='Watermark'
                                    fill
                                    className='object-contain'
                                />
                            </div>
                        </div>
                    )}

                    <table className='radiology-request-print-table'>
                        {/* Header and Metadata repeated on every page */}
                        <thead>
                            <tr>
                                <td>
                                    <div className='radiology-request-header-wrapper'>
                                        {/* TOP HEADER */}
                                        <div className='radiology-request-header'>
                                            {/* Left Section: Main Clinic Logo */}
                                            <div className='radiology-request-header-main-logo'>
                                                {clinic.logoUrl && (
                                                    <div className='radiology-request-logo-wrapper is-main'>
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
                                            <div className='radiology-request-header-secondary-logo'>
                                                {clinic.secondaryLogoUrl && (
                                                    <div className='radiology-request-logo-wrapper'>
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

                                            {/* Right Section: Clinic Name, Doctor Name & Specialization */}
                                            <div className='radiology-request-header-info'>
                                                {clinic.name && (
                                                    <h1 className='radiology-request-clinic-name'>
                                                        {clinic.name}
                                                    </h1>
                                                )}
                                                <h2 className='radiology-request-doctor-name'>
                                                    {clinic.doctorName}
                                                </h2>
                                                {clinic.specialization && (
                                                    <p className='radiology-request-doctor-specialization'>
                                                        {clinic.specialization}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Gradient Header Divider */}
                                        <div className='radiology-request-divider-gradient-header' />

                                        {/* METADATA */}
                                        <div className='radiology-request-metadata-wrapper'>
                                            <div className='radiology-request-metadata-row'>
                                                {/* Patient Name */}
                                                <div className='radiology-request-metadata-item'>
                                                    <FaUser className='radiology-request-metadata-icon' />
                                                    <span className='radiology-request-metadata-key'>
                                                        {t('patientName')}:
                                                    </span>
                                                    <span className='radiology-request-metadata-value'>
                                                        {patient.name}
                                                    </span>
                                                </div>

                                                {/* Age */}
                                                {patient.age > 0 && (
                                                    <div className='radiology-request-metadata-item'>
                                                        <FaBirthdayCake className='radiology-request-metadata-icon' />
                                                        <span className='radiology-request-metadata-key'>
                                                            {t('age')}:
                                                        </span>
                                                        <span className='radiology-request-metadata-value'>
                                                            {patient.age}{' '}
                                                            {tAge('years')}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Visit Date */}
                                                {visit.visitDate && (
                                                    <div className='radiology-request-metadata-item'>
                                                        <FaCalendarAlt className='radiology-request-metadata-icon' />
                                                        <span className='radiology-request-metadata-key'>
                                                            {t('visitDate')}:
                                                        </span>
                                                        <span className='radiology-request-metadata-value'>
                                                            {visit.visitDate}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Next Visit Date */}
                                                {visit.nextVisitDate && (
                                                    <div className='radiology-request-metadata-item'>
                                                        <FaCalendarPlus className='radiology-request-metadata-icon' />
                                                        <span className='radiology-request-metadata-key'>
                                                            {t('nextVisit')}:
                                                        </span>
                                                        <span className='radiology-request-metadata-value'>
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
                                                <div className='radiology-request-metadata-vitals-row'>
                                                    <div className='radiology-request-vitals-label'>
                                                        <FaHeartbeat className='radiology-request-metadata-icon' />
                                                        <span>
                                                            {t('vitals')}:
                                                        </span>
                                                    </div>

                                                    {visit.height !== null && (
                                                        <div>
                                                            <span className='radiology-request-metadata-key'>
                                                                {t('height')}
                                                                :{' '}
                                                            </span>
                                                            <span className='radiology-request-metadata-value'>
                                                                {visit.height}{' '}
                                                                {tUnits('cm')}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {visit.weight !== null && (
                                                        <div>
                                                            <span className='radiology-request-metadata-key'>
                                                                {t('weight')}
                                                                :{' '}
                                                            </span>
                                                            <span className='radiology-request-metadata-value'>
                                                                {visit.weight}{' '}
                                                                {tUnits('kg')}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {visit.bloodPressure !==
                                                        null && (
                                                        <div>
                                                            <span className='radiology-request-metadata-key'>
                                                                {t(
                                                                    'bloodPressure'
                                                                )}
                                                                :{' '}
                                                            </span>
                                                            <span className='radiology-request-metadata-value'>
                                                                {
                                                                    visit.bloodPressure
                                                                }{' '}
                                                                {tUnits('mmHg')}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {calculatedBmi !== null && (
                                                        <div>
                                                            <span className='radiology-request-metadata-key'>
                                                                {t('bmi')}:{' '}
                                                            </span>
                                                            <span className='radiology-request-metadata-value'>
                                                                {calculatedBmi}{' '}
                                                                {tUnits('kgm2')}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Gradient Bottom Divider */}
                                        <div className='radiology-request-divider-gradient-bottom' />
                                    </div>
                                </td>
                            </tr>
                        </thead>

                        {/* Body content */}
                        <tbody>
                            <tr>
                                <td className='radiology-request-table-cell-body'>
                                    <div className='radiology-request-body-content'>
                                        {/* Dedicated Diagnosis Block */}
                                        {diagnosisText && (
                                            <div className='radiology-request-diagnosis-block'>
                                                <h3 className='radiology-request-diagnosis-title'>
                                                    {tNoteCat('DIAGNOSIS')}:
                                                </h3>
                                                <p className='radiology-request-diagnosis-text'>
                                                    {diagnosisText}
                                                </p>
                                            </div>
                                        )}

                                        {/* Section Content Lists */}
                                        <div className='radiology-request-notes-container'>
                                            {requestedRadiologyNotes.length ===
                                            0 ? (
                                                <p className='radiology-request-notes-empty'>
                                                    {t('noRadiologyNotes')}
                                                </p>
                                            ) : (
                                                categorySections.map(
                                                    (sec) =>
                                                        sec.notes.length >
                                                            0 && (
                                                            <div
                                                                key={
                                                                    sec.category
                                                                }
                                                                className='radiology-request-section-block'
                                                            >
                                                                <h3 className='radiology-request-section-title'>
                                                                    {tNoteCat(
                                                                        sec.category
                                                                    )}
                                                                    :
                                                                </h3>
                                                                <ul className='radiology-request-notes-list'>
                                                                    {sec.notes.map(
                                                                        (
                                                                            note,
                                                                            idx
                                                                        ) => (
                                                                            <li
                                                                                key={
                                                                                    idx
                                                                                }
                                                                                className='radiology-request-note-item'
                                                                            >
                                                                                {
                                                                                    note.noteText
                                                                                }
                                                                            </li>
                                                                        )
                                                                    )}
                                                                </ul>
                                                            </div>
                                                        )
                                                )
                                            )}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>

                        {/* Spacer at the bottom to ensure contents don't overlap the fixed footer */}
                        <tfoot>
                            <tr>
                                <td>
                                    <div className='radiology-request-tfoot-spacer' />
                                </td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* Fixed Footer & Signature section pinned at bottom edge */}
                    <div className='radiology-request-footer-container'>
                        {/* DOCTOR SIGNATURE (ABOVE FOOTER) */}
                        <div className='radiology-request-signature-wrapper'>
                            <div className='radiology-request-signature-box'>
                                <span className='radiology-request-signature-label'>
                                    {t('doctorSignature')}
                                </span>
                                <div className='radiology-request-signature-area'>
                                    <div className='radiology-request-signature-line' />
                                </div>
                            </div>
                        </div>

                        {/* Gradient Footer Divider */}
                        <div className='radiology-request-divider-gradient-footer' />

                        {/* FOOTER */}
                        <div className='radiology-request-footer'>
                            {clinic.clinicAddress && (
                                <div className='radiology-request-footer-item'>
                                    <FaMapMarkerAlt className='radiology-request-footer-icon' />
                                    <span>{clinic.clinicAddress}</span>
                                </div>
                            )}
                            {clinic.clinicPhones &&
                                clinic.clinicPhones.length > 0 && (
                                    <div
                                        className='radiology-request-footer-item is-phone'
                                        dir='ltr'
                                    >
                                        <FaPhoneAlt className='radiology-request-footer-icon' />
                                        <span>
                                            {clinic.clinicPhones.join(' / ')}
                                        </span>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </PageContainer>
    )
}
