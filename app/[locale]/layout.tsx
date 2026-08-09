// Core
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
// Fonts
import { mainFont } from '@/src/fonts/fonts'
// Providers
import AllProviders from '@/src/providers/AllProviders'
// Types
import { LocaleAndChildrenProps } from '@/src/types/props.type'
// Styles
import '@/src/styles/layouts/layout.css'

export default async function MainLayout({
    children,
    params,
}: LocaleAndChildrenProps) {
    // Params
    const { locale } = await params

    // Variables
    const supportedLocales = ['en', 'ar']
    const direction = locale === 'ar' ? 'rtl' : 'ltr'

    // Early Termination
    if (!supportedLocales.includes(locale)) {
        notFound()
    }

    return (
        <html lang={locale} dir={direction} className={`${mainFont.className}`}>
            <body>
                <NextIntlClientProvider locale={locale}>
                    <AllProviders>{children}</AllProviders>
                </NextIntlClientProvider>
            </body>
        </html>
    )
}
