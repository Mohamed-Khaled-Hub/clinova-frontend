'use client'

// Core
import { useTranslations } from 'next-intl'
import { FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa'
// Types
import { MedicalDocumentFooterProps } from '@/src/types/props.type'
// Style
import '@/src/styles/components/MedicalDocumentsRelated/MedicalDocumentFooter.css'

export default function MedicalDocumentFooter({
    address,
    phones,
}: MedicalDocumentFooterProps) {
    // Translations
    const t = useTranslations('MedicalDocuments')

    return (
        <tfoot>
            <tr>
                <td>
                    <div className='medical-document-footer-tfoot-spacer' />

                    <div className='medical-document-footer-container'>
                        <div className='medical-document-footer-signature-wrapper'>
                            <div className='medical-document-footer-signature-box'>
                                <span className='medical-document-footer-signature-label'>
                                    {t('doctorSignature')}
                                </span>
                                <div className='medical-document-footer-signature-area'>
                                    <div className='medical-document-footer-signature-line' />
                                </div>
                            </div>
                        </div>

                        <div className='medical-document-footer'>
                            <div className='medical-document-footer-divider-gradient-footer' />
                            <div className='medical-document-footer-info-row'>
                                {address && (
                                    <div className='medical-document-footer-info-item'>
                                        <FaMapMarkerAlt className='medical-document-footer-icon' />
                                        <span className='medical-document-footer-text'>
                                            {address}
                                        </span>
                                    </div>
                                )}
                                {phones && phones.length > 0 && (
                                    <div className='medical-document-footer-info-item is-phone'>
                                        <FaPhoneAlt className='medical-document-footer-icon' />
                                        <span
                                            className='medical-document-footer-text'
                                            dir='ltr'
                                        >
                                            {phones.join(' / ')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </td>
            </tr>
        </tfoot>
    )
}
