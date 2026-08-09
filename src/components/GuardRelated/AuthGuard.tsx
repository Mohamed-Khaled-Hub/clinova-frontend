'use client'

// Core
import { PropsWithChildren, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/src/i18n/routing'
// Components
import Loading from '@/src/components/UiRelated/Loading'
// Hooks
import { useUser } from '@/src/providers/UserProvider'

export default function AuthGuard({ children }: PropsWithChildren) {
    const locale = useLocale()
    const pathname = usePathname()
    const router = useRouter()
    const { isLoggedIn, isLoadingProfile } = useUser()

    const isAuthPage = pathname.startsWith('/login')

    useEffect(() => {
        if (isLoadingProfile) return

        if (!isLoggedIn && !isAuthPage) {
            router.replace('/login', { locale })
        } else if (isLoggedIn && isAuthPage) {
            router.replace('/dashboard', { locale })
        }
    }, [isLoggedIn, isLoadingProfile, pathname, locale, isAuthPage, router])

    if (isLoadingProfile) {
        return <Loading />
    }

    return <>{children}</>
}
