'use client'

// Core
import { useTranslations } from 'next-intl'
// Fonts
import { rxSymbolFont } from '@/src/fonts/fonts'
// Enums
import { NoteCategoryEnum } from '@/src/enums/schemas.enum'
// Types
import { MedicalDocumentBodyProps } from '@/src/types/props.type'
// Style
import '@/src/styles/components/MedicalDocumentsRelated/MedicalDocumentBody.css'

export default function MedicalDocumentBody({
    documentType,
    notes = [],
    emptyMessage,
}: MedicalDocumentBodyProps) {
    // Translations
    const t = useTranslations('MedicalDocuments')
    const tNoteCat = useTranslations('NoteCategoryEnum')

    // Diagnosis
    const diagnosisNotes = notes.filter(
        (note) => note.category === NoteCategoryEnum.DIAGNOSIS
    )
    const diagnosisText = diagnosisNotes.map((n) => n.noteText).join(', ')

    // Helpers
    const getDocumentConfig = () => {
        switch (documentType) {
            case 'PRESCRIPTION':
                return {
                    primaryCategory: NoteCategoryEnum.PRESCRIBED_MEDICATIONS,
                    categories: [NoteCategoryEnum.PRESCRIBED_MEDICATIONS],
                    defaultEmptyText: t('noPrescriptionNotes'),
                }
            case 'LAB_REQUEST':
                return {
                    primaryCategory: NoteCategoryEnum.REQUESTED_LAB_TESTS,
                    categories: [NoteCategoryEnum.REQUESTED_LAB_TESTS],
                    defaultEmptyText: t('noLabNotes'),
                }
            case 'RADIOLOGY_REQUEST':
            default:
                return {
                    primaryCategory: NoteCategoryEnum.REQUESTED_RADIOLOGY,
                    categories: [
                        NoteCategoryEnum.HISTORY,
                        NoteCategoryEnum.COMPLAINT,
                        NoteCategoryEnum.REQUESTED_RADIOLOGY,
                    ],
                    defaultEmptyText: t('noRadiologyNotes'),
                }
        }
    }

    const renderNoteContent = (text: string) => {
        const match = text.match(/^(.*?)\[(.*?)](.*)$/)
        if (!match) return text

        const mainText = `${match[1]}${match[3]}`.trim()
        const sideText = match[2].trim()

        return (
            <span className='medical-doc-note-split-wrapper'>
                <span>{mainText}</span>
                <span>{sideText}</span>
            </span>
        )
    }

    // Variables
    const { primaryCategory, categories, defaultEmptyText } =
        getDocumentConfig()

    const categorySections = categories.map((category) => ({
        category,
        notes: notes.filter((note) => note.category === category),
    }))

    const hasPrimaryNotes = notes.some(
        (note) => note.category === primaryCategory
    )

    return (
        <tbody>
            <tr>
                <td className='medical-doc-table-cell-body'>
                    <div className='medical-doc-body-content'>
                        {/* Diagnosis Block */}
                        {diagnosisText && (
                            <div className='medical-doc-diagnosis-block'>
                                <h3 className='medical-doc-diagnosis-title'>
                                    {tNoteCat('DIAGNOSIS')}:
                                </h3>
                                <p className='medical-doc-diagnosis-text'>
                                    {diagnosisText}
                                </p>
                            </div>
                        )}

                        {/* Rx Symbol Header for Prescriptions */}
                        {documentType === 'PRESCRIPTION' && (
                            <div
                                className={`medical-doc-rx-symbol ${rxSymbolFont.className}`}
                            >
                                Rx /
                            </div>
                        )}

                        {/* Document Section Content */}
                        <div className='medical-doc-notes-container'>
                            {!hasPrimaryNotes ? (
                                <p className='medical-doc-notes-empty'>
                                    {emptyMessage || defaultEmptyText}
                                </p>
                            ) : (
                                categorySections.map(
                                    (sec) =>
                                        sec.notes.length > 0 && (
                                            <div
                                                key={sec.category}
                                                className='medical-doc-section-block'
                                            >
                                                {/* Category title rendered for Lab & Radiology requests */}
                                                {documentType !==
                                                    'PRESCRIPTION' && (
                                                    <h3 className='medical-doc-section-title'>
                                                        {tNoteCat(sec.category)}
                                                        :
                                                    </h3>
                                                )}

                                                <ul className='medical-doc-notes-list'>
                                                    {sec.notes.map(
                                                        (note, idx) => (
                                                            <li
                                                                key={idx}
                                                                className='medical-doc-note-item'
                                                                style={{
                                                                    color:
                                                                        note.highlightColor ||
                                                                        undefined,
                                                                }}
                                                            >
                                                                {renderNoteContent(
                                                                    note.noteText
                                                                )}
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
    )
}
