'use client'

// Core
import Lottie from 'lottie-react'
import { useTranslations } from 'next-intl'
// Animation
import loaderAnimation from '@/public/lottie/loader.json'
// Style
import '@/src/styles/components/UiRelated/Loading.css'

export default function Loading() {
    // Translations
    const t = useTranslations('LoadingComponent')

    return (
        <div className='loading'>
            <div className='loading-lottie-wrapper'>
                <Lottie
                    animationData={loaderAnimation}
                    loop={true}
                    className='loading-lottie'
                />
            </div>
            <span className='loading-text'>{t('loading')}</span>
        </div>
    )
}
