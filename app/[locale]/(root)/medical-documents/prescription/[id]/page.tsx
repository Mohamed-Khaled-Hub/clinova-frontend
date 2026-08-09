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
import { mainFont, rxSymbolFont } from '@/src/fonts/fonts'
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
    PrescriptionResponse,
} from '@/src/types/backend/backend.responses.type'
// Style
import '@/src/styles/pages/(root)/medical-documents/prescription/[id]/page.css'

export default function PrescriptionPage({ params }: IdPageProps) {
    // Params
    const { id } = use(params)

    // References
    const prescriptionRef = useRef<HTMLDivElement>(null)

    // Translations
    const t = useTranslations('MedicalDocuments')
    const tAge = useTranslations('Age')
    const tUnits = useTranslations('Units')
    const tNoteCat = useTranslations('NoteCategoryEnum')

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

        fetchDocument()
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

    const calculatedBmi =
        visit.weight && visit.height && visit.height > 0
            ? (visit.weight / Math.pow(visit.height / 100, 2)).toFixed(1)
            : null

    const activeWatermark = clinic.watermarkUrl || clinic.logoUrl

    const diagnosisNotes =
        visit.notes?.filter(
            (note) => note.category === NoteCategoryEnum.DIAGNOSIS
        ) || []

    const prescriptionNotes =
        visit.notes?.filter(
            (note) => note.category === NoteCategoryEnum.PRESCRIBED_MEDICATIONS
        ) || []

    const diagnosisText = diagnosisNotes.map((n) => n.noteText).join(', ')

    return (
        <PageContainer id='prescription-log-page'>
            <div className='prescription-card-container group'>
                {/* Print Button Container */}
                <div className='prescription-print-btn-wrapper'>
                    <Button
                        variant='normal-dark'
                        Icon={FaPrint}
                        onClick={handlePrint}
                    />
                </div>

                <div
                    className={`prescription-card ${mainFont.className}`}
                    ref={prescriptionRef}
                    dir={locale === 'ar' ? 'rtl' : 'ltr'}
                >
                    {/* Background Watermark (Fixed on every printed page) */}
                    {activeWatermark && (
                        <div className='prescription-watermark-wrapper'>
                            <div className='prescription-watermark-container'>
                                <Image
                                    src={activeWatermark}
                                    alt='Watermark'
                                    fill
                                    className='object-contain'
                                />
                            </div>
                        </div>
                    )}

                    <table className='prescription-print-table'>
                        {/* REPEATED HEADER & METADATA ON EVERY PAGE */}
                        <thead>
                            <tr>
                                <td>
                                    <div className='prescription-header-wrapper'>
                                        <div className='prescription-header'>
                                            {/* Left Section: Main Clinic Logo */}
                                            <div className='prescription-header-main-logo'>
                                                {clinic.logoUrl && (
                                                    <div className='prescription-logo-wrapper is-main'>
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
                                            <div className='prescription-header-secondary-logo'>
                                                {clinic.secondaryLogoUrl && (
                                                    <div className='prescription-logo-wrapper'>
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
                                            <div className='prescription-header-info'>
                                                {clinic.name && (
                                                    <h1 className='prescription-clinic-name'>
                                                        {clinic.name}
                                                    </h1>
                                                )}
                                                <h2 className='prescription-doctor-name'>
                                                    {clinic.doctorName}
                                                </h2>
                                                {clinic.specialization && (
                                                    <p className='prescription-doctor-specialization'>
                                                        {clinic.specialization}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className='prescription-divider-gradient-header' />

                                        {/* METADATA */}
                                        <div className='prescription-metadata-wrapper'>
                                            <div className='prescription-metadata-row'>
                                                <div className='prescription-metadata-item'>
                                                    <FaUser className='prescription-metadata-icon' />
                                                    <span className='prescription-metadata-key'>
                                                        {t('patientName')}:
                                                    </span>
                                                    <span className='prescription-metadata-value'>
                                                        {patient.name}
                                                    </span>
                                                </div>

                                                {patient.age > 0 && (
                                                    <div className='prescription-metadata-item'>
                                                        <FaBirthdayCake className='prescription-metadata-icon' />
                                                        <span className='prescription-metadata-key'>
                                                            {t('age')}:
                                                        </span>
                                                        <span className='prescription-metadata-value'>
                                                            {patient.age}{' '}
                                                            {tAge('years')}
                                                        </span>
                                                    </div>
                                                )}

                                                {visit.visitDate && (
                                                    <div className='prescription-metadata-item'>
                                                        <FaCalendarAlt className='prescription-metadata-icon' />
                                                        <span className='prescription-metadata-key'>
                                                            {t('visitDate')}:
                                                        </span>
                                                        <span className='prescription-metadata-value'>
                                                            {visit.visitDate}
                                                        </span>
                                                    </div>
                                                )}

                                                {visit.nextVisitDate && (
                                                    <div className='prescription-metadata-item'>
                                                        <FaCalendarPlus className='prescription-metadata-icon' />
                                                        <span className='prescription-metadata-key'>
                                                            {t('nextVisit')}:
                                                        </span>
                                                        <span className='prescription-metadata-value'>
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
                                                <div className='prescription-metadata-vitals-row'>
                                                    <div className='prescription-vitals-label'>
                                                        <FaHeartbeat className='prescription-metadata-icon' />
                                                        <span>
                                                            {t('vitals')}:
                                                        </span>
                                                    </div>

                                                    {visit.height !== null && (
                                                        <div>
                                                            <span className='prescription-metadata-key'>
                                                                {t('height')}
                                                                :{' '}
                                                            </span>
                                                            <span className='prescription-metadata-value'>
                                                                {visit.height}{' '}
                                                                {tUnits('cm')}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {visit.weight !== null && (
                                                        <div>
                                                            <span className='prescription-metadata-key'>
                                                                {t('weight')}
                                                                :{' '}
                                                            </span>
                                                            <span className='prescription-metadata-value'>
                                                                {visit.weight}{' '}
                                                                {tUnits('kg')}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {visit.bloodPressure !==
                                                        null && (
                                                        <div>
                                                            <span className='prescription-metadata-key'>
                                                                {t(
                                                                    'bloodPressure'
                                                                )}
                                                                :{' '}
                                                            </span>
                                                            <span className='prescription-metadata-value'>
                                                                {
                                                                    visit.bloodPressure
                                                                }{' '}
                                                                {tUnits('mmHg')}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {calculatedBmi !== null && (
                                                        <div>
                                                            <span className='prescription-metadata-key'>
                                                                {t('bmi')}:{' '}
                                                            </span>
                                                            <span className='prescription-metadata-value'>
                                                                {calculatedBmi}{' '}
                                                                {tUnits('kgm2')}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className='prescription-divider-gradient-bottom' />
                                    </div>
                                </td>
                            </tr>
                        </thead>

                        {/* DYNAMIC CONTENT BODY */}
                        <tbody>
                            <tr>
                                <td className='prescription-table-cell-body'>
                                    <div className='prescription-body-content'>
                                        {diagnosisText && (
                                            <div className='prescription-diagnosis-block'>
                                                <h3 className='prescription-diagnosis-title'>
                                                    {tNoteCat('DIAGNOSIS')}:
                                                </h3>
                                                <p className='prescription-diagnosis-text'>
                                                    {diagnosisText}
                                                </p>
                                            </div>
                                        )}

                                        <div
                                            className={`prescription-rx-symbol ${rxSymbolFont.className}`}
                                        >
                                            Rx /
                                        </div>

                                        <div className='prescription-notes-container'>
                                            {prescriptionNotes.length === 0 ? (
                                                <p className='prescription-notes-empty'>
                                                    {t('noPrescriptionNotes')}
                                                </p>
                                            ) : (
                                                <ul className='prescription-notes-list'>
                                                    {prescriptionNotes.map(
                                                        (note, idx) => (
                                                            <li
                                                                key={idx}
                                                                className='prescription-note-item'
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
                                    <div className='prescription-tfoot-spacer' />
                                </td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* Fixed Footer + Doctor Signature locked to bottom edge on every printed page */}
                    <div className='prescription-footer-container'>
                        <div className='prescription-signature-wrapper'>
                            <div className='prescription-signature-box'>
                                <span className='prescription-signature-label'>
                                    {t('doctorSignature')}
                                </span>
                                <div className='prescription-signature-area'>
                                    <div className='prescription-signature-line' />
                                </div>
                            </div>
                        </div>

                        <div className='prescription-footer-wrapper'>
                            <div className='prescription-divider-gradient-footer' />
                            <div className='prescription-footer'>
                                {clinic.clinicAddress && (
                                    <div className='prescription-footer-item'>
                                        <FaMapMarkerAlt className='prescription-footer-icon' />
                                        <span>{clinic.clinicAddress}</span>
                                    </div>
                                )}
                                {clinic.clinicPhones &&
                                    clinic.clinicPhones.length > 0 && (
                                        <div
                                            className='prescription-footer-item is-phone'
                                            dir='ltr'
                                        >
                                            <FaPhoneAlt className='prescription-footer-icon' />
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
