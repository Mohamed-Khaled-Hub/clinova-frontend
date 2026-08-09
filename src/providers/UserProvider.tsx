'use client'

// Core
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/src/i18n/routing'
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
import { EndpointsEnum } from '@/src/enums/endpoints.enum'
// Functions
import { catchBackendError } from '@/src/utils/functions'
import { getTokens, clearTokens } from '@/src/utils/tokens'
// Types
import {
    CreateUserRequest,
    UpdateUserRequest,
    UpdateUserRoleRequest,
} from '@/src/types/backend/backend.requests.type'
import { UserContextType } from '@/src/types/contexts.type'
import {
    MessageResponse,
    UserResponse,
} from '@/src/types/backend/backend.responses.type'
// Variables
import { api } from '@/src/utils/api'
import { endpoints } from '@/src/constants/server.constant'

// Context
export const UserContext = createContext<UserContextType>({} as UserContextType)

// Hook
export const useUser = () => {
    const context = useContext(UserContext)
    if (!context) {
        throw new Error('useUser must be used within a UserProvider')
    }
    return context
}

// Provider
export default function UserProvider({ children }: PropsWithChildren) {
    // From Providers
    const locale = useLocale()
    const pathname = usePathname()
    const router = useRouter()

    // States
    const [user, setUser] = useState<UserResponse | null>(null)
    const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true)
    const [isInitialized, setIsInitialized] = useState<boolean>(false)

    const isLoggedIn = !!user

    // GET /users/me
    const getMe = useCallback(async (): Promise<UserResponse> => {
        const { data, error } = await catchBackendError(
            api.get<UserResponse>(endpoints[EndpointsEnum.USER].me)
        )
        if (error) throw error
        return data
    }, [])

    // PATCH /users/me
    const updateMe = useCallback(
        async (updateUserData: UpdateUserRequest): Promise<UserResponse> => {
            const { data, error } = await catchBackendError(
                api.patch<UserResponse>(
                    endpoints[EndpointsEnum.USER].me,
                    updateUserData
                )
            )
            if (error) throw error
            setUser(data)
            return data
        },
        []
    )

    // PATCH /users/me/avatar
    const updateMyAvatar = useCallback(
        async (file: File): Promise<UserResponse> => {
            const formData = new FormData()
            formData.append('file', file)

            const { data, error } = await catchBackendError(
                api.patch<UserResponse>(
                    endpoints[EndpointsEnum.USER].myAvatar,
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                )
            )
            if (error) throw error
            setUser(data)
            return data
        },
        []
    )

    // POST /users
    const createUser = useCallback(
        async (createUserData: CreateUserRequest): Promise<UserResponse> => {
            const { data, error } = await catchBackendError(
                api.post<UserResponse>(
                    endpoints[EndpointsEnum.USER].root,
                    createUserData
                )
            )
            if (error) throw error
            return data
        },
        []
    )

    // GET /users
    const getUsers = useCallback(async (): Promise<UserResponse[]> => {
        const { data, error } = await catchBackendError(
            api.get<UserResponse[]>(endpoints[EndpointsEnum.USER].root)
        )
        if (error) throw error
        return data
    }, [])

    // GET /users/doctors
    const getDoctors = useCallback(async (): Promise<UserResponse[]> => {
        const { data, error } = await catchBackendError(
            api.get<UserResponse[]>(
                `${endpoints[EndpointsEnum.USER].findAllDoctors}`
            )
        )
        if (error) throw error
        return data
    }, [])

    // GET /users/:id
    const getUserById = useCallback(
        async (id: string): Promise<UserResponse> => {
            const { data, error } = await catchBackendError(
                api.get<UserResponse>(endpoints[EndpointsEnum.USER].byId(id))
            )
            if (error) throw error
            return data
        },
        []
    )

    // GET /users/username/:username
    const getUserByUsername = useCallback(
        async (username: string): Promise<UserResponse> => {
            const { data, error } = await catchBackendError(
                api.get<UserResponse>(
                    `${endpoints[EndpointsEnum.USER].findByUsername}/${username}`
                )
            )
            if (error) throw error
            return data
        },
        []
    )

    // PATCH /users/:id
    const updateUser = useCallback(
        async (
            id: string,
            updateUserData: UpdateUserRequest
        ): Promise<UserResponse> => {
            const { data, error } = await catchBackendError(
                api.patch<UserResponse>(
                    endpoints[EndpointsEnum.USER].byId(id),
                    updateUserData
                )
            )
            if (error) throw error

            setUser((prev) => (prev && prev._id === id ? data : prev))
            return data
        },
        []
    )

    // PATCH /users/:id/role
    const updateUserRole = useCallback(
        async (
            id: string,
            updateRoleData: UpdateUserRoleRequest
        ): Promise<UserResponse> => {
            const { data, error } = await catchBackendError(
                api.patch<UserResponse>(
                    endpoints[EndpointsEnum.USER].updateRole(id),
                    updateRoleData
                )
            )
            if (error) throw error

            setUser((prev) => (prev && prev._id === id ? data : prev))
            return data
        },
        []
    )

    // DELETE /users/:id
    const deleteUser = useCallback(
        async (id: string): Promise<MessageResponse> => {
            const { data, error } = await catchBackendError(
                api.delete<MessageResponse>(
                    endpoints[EndpointsEnum.USER].byId(id)
                )
            )
            if (error) throw error
            return data
        },
        []
    )

    // Helpers
    const logout = useCallback(() => {
        clearTokens()
        setUser(null)
        setIsLoadingProfile(false)
        setIsInitialized(true)
        router.replace('/login', { locale })
    }, [router, locale])

    const fetchUser = useCallback(async (): Promise<UserResponse | null> => {
        try {
            const profileData = await getMe()
            setUser(profileData)
            return profileData
        } catch {
            clearTokens()
            setUser(null)
            return null
        }
    }, [getMe])

    // Init User
    useEffect(() => {
        if (isInitialized) return
        let isMounted = true

        const initializeAuthUser = async () => {
            const tokens = getTokens()
            if (tokens) {
                await fetchUser()
            }
            if (isMounted) {
                setIsLoadingProfile(false)
                setIsInitialized(true)
            }
        }

        initializeAuthUser().then()

        return () => {
            isMounted = false
        }
    }, [isInitialized, fetchUser])

    // Redirecting
    useEffect(() => {
        if (isLoadingProfile) return

        const isAuthPage = pathname.includes('/login')

        if (!isLoggedIn && !isAuthPage) {
            router.replace('/login', { locale })
        } else if (isLoggedIn && isAuthPage) {
            router.replace('/dashboard', { locale })
        }
    }, [isLoggedIn, isLoadingProfile, pathname, router, locale])

    // Context Value
    const contextValue = useMemo(
        () => ({
            user,
            isLoggedIn,
            isLoadingProfile,
            getMe,
            updateMe,
            updateMyAvatar,
            createUser,
            getUsers,
            getUserById,
            getUserByUsername,
            getDoctors,
            updateUser,
            updateUserRole,
            deleteUser,
            logout,
            fetchUser,
        }),
        [
            user,
            isLoggedIn,
            isLoadingProfile,
            getMe,
            updateMe,
            updateMyAvatar,
            createUser,
            getUsers,
            getUserById,
            getUserByUsername,
            getDoctors,
            updateUser,
            updateUserRole,
            deleteUser,
            logout,
            fetchUser,
        ]
    )

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    )
}
