// Core
import Image from 'next/image'
import { FaPrint } from 'react-icons/fa'
// Components
import Button from '@/src/components/UiRelated/Button'
// Fonts
import { mainFont } from '@/src/fonts/fonts'
// Types
import { MedicalDocumentCardProps } from '@/src/types/props.type'
// Style
import '@/src/styles/components/MedicalDocumentsRelated/MedicalDocumentCard.css'

export default function MedicalDocumentCard({
    children,
    watermarkUrl,
    cardRef,
    onPrintAction,
    locale = 'en',
}: MedicalDocumentCardProps) {
    return (
        <div className='medical-document-card-container'>
            <div className='medical-document-card-print-btn-wrapper'>
                <Button
                    variant='normal-dark'
                    Icon={FaPrint}
                    onClick={onPrintAction}
                />
            </div>

            <div
                className={`medical-document-card ${mainFont.className}`}
                ref={cardRef}
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
            >
                {watermarkUrl && (
                    <div className='medical-document-card-watermark-wrapper'>
                        <div className='medical-document-card-watermark-container'>
                            <Image
                                src={watermarkUrl}
                                alt='Watermark'
                                fill
                                className='object-contain'
                            />
                        </div>
                    </div>
                )}

                {children}
            </div>
        </div>
    )
}
