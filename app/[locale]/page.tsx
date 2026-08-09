// Core
import { useLocale } from 'next-intl'
import { redirect } from '@/src/i18n/routing'

export default function RootPage() {
    // From Providers
    const locale = useLocale()

    redirect({ href: '/dashboard', locale })

    return null
}
