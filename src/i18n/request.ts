// Core
import { getRequestConfig } from 'next-intl/server'
// I18n
import { routing } from '@/src/i18n/routing'
// Types
import { LocaleType } from '@/src/types/i18n.type'

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale

    if (!locale || !routing.locales.includes(locale as LocaleType)) {
        locale = routing.defaultLocale
    }

    return {
        locale,
        messages: (await import(`./messages/${locale}.json`)).default,
    }
})
