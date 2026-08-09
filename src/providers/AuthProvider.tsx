'use client'

// Core
import {
    PropsWithChildren,
    createContext,
    useContext,
    useCallback,
    useMemo,
} from 'react'
import { useLocale } from 'next-intl'
import { useRouter } from '@/src/i18n/routing'
// Enums
import { EndpointsEnum } from '@/src/enums/endpoints.enum'
// Functions
import { catchBackendError } from '@/src/utils/functions'
import { saveTokens } from '@/src/utils/tokens'
// Hooks
import { useUser } from '@/src/providers/UserProvider'
// Types
import {
    ChangePasswordRequest,
    LoginRequest,
    RefreshRequest,
} from '@/src/types/backend/backend.requests.type'
import { AuthContextType } from '@/src/types/contexts.type'
import {
    MessageResponse,
    TokensResponse,
} from '@/src/types/backend/backend.responses.type'
// Variables
import { api } from '@/src/utils/api'
import { endpoints } from '@/src/constants/server.constant'

// Context
export const AuthContext = createContext<AuthContextType>({} as AuthContextType)

// Hook
export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within a UserProvider')
    }
    return context
}

// Provider
export default function AuthProvider({ children }: PropsWithChildren) {
    // From Providers
    const router = useRouter()
    const locale = useLocale()
    const { fetchUser } = useUser()

    // POST /auth/login
    const login = useCallback(
        async (loginData: LoginRequest) => {
            const { data, error } = await catchBackendError(
                api.post<TokensResponse>(
                    endpoints[EndpointsEnum.AUTH].login,
                    loginData
                )
            )

            if (error) throw error
            saveTokens(JSON.stringify(data))

            const userProfile = await fetchUser()
            if (userProfile) {
                router.replace('/dashboard', { locale })
            }
        },
        [fetchUser, router, locale]
    )

    // POST /auth/refresh
    const refreshToken = useCallback(async (refreshData: RefreshRequest) => {
        const { data, error } = await catchBackendError(
            api.post<TokensResponse>(
                endpoints[EndpointsEnum.AUTH].refresh,
                refreshData
            )
        )

        if (error) throw error
        saveTokens(JSON.stringify(data))
    }, [])

    // POST /auth/change-password
    const changePassword = useCallback(
        async (
            changePasswordData: ChangePasswordRequest
        ): Promise<MessageResponse> => {
            const { data, error } = await catchBackendError(
                api.post<MessageResponse>(
                    endpoints[EndpointsEnum.AUTH].changePassword,
                    changePasswordData
                )
            )

            if (error) throw error
            return data
        },
        []
    )

    // Context Value
    const contextValue = useMemo(
        () => ({
            login,
            refreshToken,
            changePassword,
        }),
        [login, refreshToken, changePassword]
    )

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    )
}
