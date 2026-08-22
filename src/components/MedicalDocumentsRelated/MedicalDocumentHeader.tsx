'use client'

// Core
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import {
    FaBirthdayCake,
    FaCalendarAlt,
    FaCalendarPlus,
    FaHeartbeat,
    FaUser,
} from 'react-icons/fa'
// Types
import { MedicalDocumentHeaderProps } from '@/src/types/props.type'
// Style
import '@/src/styles/components/MedicalDocumentsRelated/MedicalDocumentHeader.css'

export default function MedicalDocumentHeader({
    clinic,
    patient,
    visit,
}: MedicalDocumentHeaderProps) {
    // Translations
    const t = useTranslations('MedicalDocuments')
    const tAge = useTranslations('Age')
    const tUnits = useTranslations('Units')

    // Variables
    const calculatedBmi =
        visit.weight && visit.height && visit.height > 0
            ? (visit.weight / Math.pow(visit.height / 100, 2)).toFixed(1)
            : null

    return (
        <thead className='medical-document-header-root'>
            <tr>
                <td>
                    <div className='medical-document-header-wrapper'>
                        <div className='medical-document-header-content'>
                            {/* Left Section: Main Clinic Logo */}
                            <div className='medical-document-header-main-logo'>
                                {clinic.logoUrl && (
                                    <div className='medical-document-header-logo-wrapper is-main'>
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
                            <div className='medical-document-header-secondary-logo'>
                                {clinic.secondaryLogoUrl && (
                                    <div className='medical-document-header-logo-wrapper'>
                                        <Image
                                            src={clinic.secondaryLogoUrl}
                                            alt='Secondary Logo'
                                            fill
                                            className='object-contain'
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Right Section: Info */}
                            <div className='medical-document-header-info'>
                                {clinic.name && (
                                    <h1 className='medical-document-header-clinic-name'>
                                        {clinic.name}
                                    </h1>
                                )}
                                <h2 className='medical-document-header-doctor-name'>
                                    {clinic.doctorName}
                                </h2>
                                {clinic.specialization && (
                                    <p className='medical-document-header-doctor-specialization'>
                                        {clinic.specialization}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className='medical-document-header-divider-top' />

                        {/* METADATA */}
                        <div className='medical-document-header-metadata-wrapper'>
                            <div className='medical-document-header-metadata-row'>
                                <div className='medical-document-header-metadata-item'>
                                    <FaUser className='medical-document-header-metadata-icon' />
                                    <span className='medical-document-header-metadata-key'>
                                        {t('patientName')}:
                                    </span>
                                    <span className='medical-document-header-metadata-value'>
                                        {patient.name}
                                    </span>
                                </div>

                                {patient.age > 0 && (
                                    <div className='medical-document-header-metadata-item'>
                                        <FaBirthdayCake className='medical-document-header-metadata-icon' />
                                        <span className='medical-document-header-metadata-key'>
                                            {t('age')}:
                                        </span>
                                        <span className='medical-document-header-metadata-value'>
                                            {patient.age} {tAge('years')}
                                        </span>
                                    </div>
                                )}

                                {visit.visitDate && (
                                    <div className='medical-document-header-metadata-item'>
                                        <FaCalendarAlt className='medical-document-header-metadata-icon' />
                                        <span className='medical-document-header-metadata-key'>
                                            {t('visitDate')}:
                                        </span>
                                        <span className='medical-document-header-metadata-value'>
                                            {visit.visitDate}
                                        </span>
                                    </div>
                                )}

                                {visit.nextVisitDate && (
                                    <div className='medical-document-header-metadata-item'>
                                        <FaCalendarPlus className='medical-document-header-metadata-icon' />
                                        <span className='medical-document-header-metadata-key'>
                                            {t('nextVisit')}:
                                        </span>
                                        <span className='medical-document-header-metadata-value'>
                                            {visit.nextVisitDate}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Vitals Row */}
                            {(visit.height !== null ||
                                visit.weight !== null ||
                                visit.bloodPressure !== null ||
                                calculatedBmi !== null) && (
                                <div className='medical-document-header-vitals-row'>
                                    <div className='medical-document-header-vitals-label'>
                                        <FaHeartbeat className='medical-document-header-metadata-icon' />
                                        <span>{t('vitals')}:</span>
                                    </div>

                                    {visit.height !== null && (
                                        <div>
                                            <span className='medical-document-header-metadata-key'>
                                                {t('height')}:{' '}
                                            </span>
                                            <span className='medical-document-header-metadata-value'>
                                                {visit.height} {tUnits('cm')}
                                            </span>
                                        </div>
                                    )}

                                    {visit.weight !== null && (
                                        <div>
                                            <span className='medical-document-header-metadata-key'>
                                                {t('weight')}:{' '}
                                            </span>
                                            <span className='medical-document-header-metadata-value'>
                                                {visit.weight} {tUnits('kg')}
                                            </span>
                                        </div>
                                    )}

                                    {visit.bloodPressure !== null && (
                                        <div>
                                            <span className='medical-document-header-metadata-key'>
                                                {t('bloodPressure')}:{' '}
                                            </span>
                                            <span className='medical-document-header-metadata-value'>
                                                {visit.bloodPressure}{' '}
                                                {tUnits('mmHg')}
                                            </span>
                                        </div>
                                    )}

                                    {calculatedBmi !== null && (
                                        <div>
                                            <span className='medical-document-header-metadata-key'>
                                                {t('bmi')}:{' '}
                                            </span>
                                            <span className='medical-document-header-metadata-value'>
                                                {calculatedBmi} {tUnits('kgm2')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className='medical-document-header-divider-bottom' />
                    </div>
                </td>
            </tr>
        </thead>
    )
}
