'use client'

// Core
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/src/i18n/routing'
import {
    PropsWithChildren,
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
} from 'react'
// Enums
import { LangEnum } from '@/src/enums/schemas.enum'
import { EndpointsEnum } from '@/src/enums/endpoints.enum'
// Functions
import { catchBackendError } from '@/src/utils/functions'
// Hooks
import { useUser } from '@/src/providers/UserProvider'
// Types
import { UpdateSettingsRequest } from '@/src/types/backend/backend.requests.type'
import { SettingsContextType } from '@/src/types/contexts.type'
import { SettingsDocument } from '@/src/types/backend/documents.type'
// Variables
import { api } from '@/src/utils/api'
import { endpoints } from '@/src/constants/server.constant'
import { appLanguageKey } from '@/src/constants/keys.constant'

// Context
export const SettingsContext = createContext<SettingsContextType>(
    {} as SettingsContextType
)

// Hook
export const useSettings = () => {
    const context = useContext(SettingsContext)
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider')
    }
    return context
}

// Provider
export default function SettingsProvider({ children }: PropsWithChildren) {
    // From Providers
    const activeLocale = useLocale()
    const router = useRouter()
    const pathname = usePathname()
    const { isLoggedIn } = useUser()

    // Settings States
    const [settings, setSettings] = useState<SettingsDocument | null>(null)
    const [isLoadingSettings, setIsLoadingSettings] = useState<boolean>(true)

    // Is Initialized ?
    const [isInitialized, setIsInitialized] = useState<boolean>(false)

    // GET /settings
    const getSettings = useCallback(async (): Promise<SettingsDocument> => {
        const { data, error } = await catchBackendError(
            api.get<SettingsDocument>(endpoints[EndpointsEnum.SETTINGS].root)
        )

        if (error) throw error
        return data
    }, [])

    // PATCH /settings
    const updateSettings = useCallback(
        async (
            updateSettingsData: UpdateSettingsRequest
        ): Promise<SettingsDocument> => {
            const { data, error } = await catchBackendError(
                api.patch<SettingsDocument>(
                    endpoints[EndpointsEnum.SETTINGS].root,
                    updateSettingsData
                )
            )

            if (error) throw error
            setSettings(data)

            if (updateSettingsData.primaryLanguage) {
                localStorage.setItem(
                    appLanguageKey,
                    updateSettingsData.primaryLanguage
                )

                if (updateSettingsData.primaryLanguage !== activeLocale) {
                    router.replace(pathname, {
                        locale: updateSettingsData.primaryLanguage,
                    })
                }
            }
            return data
        },
        [activeLocale, pathname, router]
    )

    // PATCH /settings/logo
    const updateLogo = useCallback(
        async (file: File): Promise<SettingsDocument> => {
            const formData = new FormData()
            formData.append('file', file)

            const { data, error } = await catchBackendError(
                api.patch<SettingsDocument>(
                    `${endpoints[EndpointsEnum.SETTINGS].updateLogo}`,
                    formData
                )
            )

            if (error) throw error
            setSettings(data)
            return data
        },
        []
    )

    // PATCH /settings/secondary-logo
    const updateSecondaryLogo = useCallback(
        async (file: File): Promise<SettingsDocument> => {
            const formData = new FormData()
            formData.append('file', file)

            const { data, error } = await catchBackendError(
                api.patch<SettingsDocument>(
                    `${endpoints[EndpointsEnum.SETTINGS].updateSecondaryLogo}`,
                    formData
                )
            )

            if (error) throw error
            setSettings(data)
            return data
        },
        []
    )

    // PATCH /settings/watermark
    const updateWatermark = useCallback(
        async (file: File): Promise<SettingsDocument> => {
            const formData = new FormData()
            formData.append('file', file)

            const { data, error } = await catchBackendError(
                api.patch<SettingsDocument>(
                    `${endpoints[EndpointsEnum.SETTINGS].updateWatermark}`,
                    formData
                )
            )

            if (error) throw error
            setSettings(data)
            return data
        },
        []
    )

    // Init Settings
    useEffect(() => {
        let isMounted = true

        const initializeSettings = async () => {
            const savedLang = localStorage.getItem(appLanguageKey)
            const defaultLang = LangEnum.EN
            const effectiveLocalLang = savedLang || defaultLang

            if (!savedLang) {
                localStorage.setItem(appLanguageKey, defaultLang)
            }

            const isAuthPage = pathname.includes('/login')

            if (!isLoggedIn) {
                if (isMounted) {
                    setSettings(null)
                    setIsInitialized(false)
                    setIsLoadingSettings(false)
                }
                return
            }

            if (isInitialized) return

            try {
                setIsLoadingSettings(true)
                const appSettings = await getSettings()

                if (isMounted && appSettings) {
                    setSettings(appSettings)
                    setIsInitialized(true)

                    const backendLang =
                        appSettings.primaryLanguage || effectiveLocalLang

                    if (savedLang !== backendLang) {
                        localStorage.setItem(appLanguageKey, backendLang)
                    }

                    if (!isAuthPage && activeLocale !== backendLang) {
                        router.replace(pathname, { locale: backendLang })
                    }
                }
            } catch (err) {
                console.error(
                    'Failed to initialize global clinic settings:',
                    err
                )
            } finally {
                if (isMounted) {
                    setIsLoadingSettings(false)
                }
            }
        }

        initializeSettings().then()

        return () => {
            isMounted = false
        }
    }, [getSettings, isLoggedIn, isInitialized, activeLocale, pathname, router])

    // Context Value
    const contextValue = useMemo(
        () => ({
            settings,
            isLoadingSettings,
            getSettings,
            updateSettings,
            updateLogo,
            updateSecondaryLogo,
            updateWatermark,
        }),
        [
            settings,
            isLoadingSettings,
            getSettings,
            updateSettings,
            updateLogo,
            updateSecondaryLogo,
            updateWatermark,
        ]
    )

    return (
        <SettingsContext.Provider value={contextValue}>
            {children}
        </SettingsContext.Provider>
    )
}
