// Core
import axios, { AxiosError } from 'axios'
// Enums
import { RolesEnum, PermissionsEnum } from '@/src/enums/roles-permissions.enum'
// Types
import {
    UserResponse,
    AsyncResponse,
    BackendErrorResponse,
} from '@/src/types/backend/backend.responses.type'
import { AccessType } from '@/src/types/common.type'
import { LocaleType } from '@/src/types/i18n.type'
import { DateFormatType } from '@/src/types/ui.type'

export function capitalizeWords(text: string): string {
    return text
        .trim()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

export function renderClasses(
    ...classes: (string | false | undefined | null)[]
): string {
    return classes.filter(Boolean).join(' ')
}

export async function catchBackendError<T>(
    promise: Promise<{ data: T }> | Promise<T>
): Promise<AsyncResponse<T>> {
    try {
        const response = await promise

        const data =
            response && typeof response === 'object' && 'data' in response
                ? (response.data as T)
                : (response as T)

        return { data, error: null }
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<BackendErrorResponse>

            const errorPayload: BackendErrorResponse = {
                message:
                    axiosError.response?.data?.message ||
                    axiosError.message ||
                    'Network request failed',
                path:
                    axiosError.response?.data?.path ||
                    axiosError.config?.url ||
                    'unknown-route',
                statusCode:
                    axiosError.response?.data?.statusCode ||
                    axiosError.response?.status ||
                    500,
                timestamp: axiosError.response?.data?.timestamp
                    ? new Date(axiosError.response.data.timestamp)
                    : new Date(),
            }

            return { data: null, error: errorPayload }
        }

        const fallbackError: BackendErrorResponse = {
            message:
                error instanceof Error
                    ? error.message
                    : 'An unexpected execution exception occurred',
            path: 'client-side-runtime',
            statusCode: 500,
            timestamp: new Date(),
        }

        return { data: null, error: fallbackError }
    }
}

export function hasPermission(
    user: UserResponse | null,
    requiredPermission: PermissionsEnum,
    accessType: AccessType
): boolean {
    if (!user || !user.role) return false

    if (user.role.roleName === RolesEnum.SUPER_ADMIN) return true

    const assignment = user.role.permissions?.find(
        (node) => node.permission?.permissionKey === requiredPermission
    )

    return !!assignment?.[accessType]
}

export function isSuperAdmin(user: UserResponse | null) {
    if (!user || !user.role) return false

    return user.role.roleName === RolesEnum.SUPER_ADMIN
}

export function isAdmin(user: UserResponse | null) {
    if (!user || !user.role) return false

    return user.role.roleName === RolesEnum.ADMIN
}

export function displayUserFullName(
    user: UserResponse | null,
    locale: LocaleType
): string {
    return user?.fullNameEn && user?.fullNameAr
        ? locale === 'en'
            ? user.fullNameEn
            : user.fullNameAr
        : user?.username || ''
}

export function userFullNameInitials(displayName: string): string {
    return displayName ? capitalizeWords(displayName).charAt(0) : 'U'
}

export function formatTimestamp(
    locale: LocaleType,
    dateString?: string,
    format: DateFormatType = 'full'
): string {
    if (!dateString) return '—'

    const date = new Date(dateString)

    if (isNaN(date.getTime())) return '—'

    const config: Intl.DateTimeFormatOptions = {}

    if (format === 'full' || format === 'dateOnly') {
        config.year = 'numeric'
        config.month = 'long'
        config.day = 'numeric'
    }

    if (format === 'full' || format === 'timeOnly') {
        config.hour = '2-digit'
        config.minute = '2-digit'
    }

    return date.toLocaleString(locale, config)
}

export function stripHonorifics(name: string): string {
    if (!name) return ''

    const words = name.trim().split(/\s+/)
    if (words.length <= 1) return name

    const firstWord = words[0]

    if (firstWord.includes('.')) {
        return words.slice(1).join(' ')
    }

    const cleanFirstWord = firstWord.toLowerCase()
    const standaloneHonorifics = [
        'dr',
        'mr',
        'ms',
        'mrs',
        'prof',
        'eng',
        'nurse',
        'coach',
        'دكتور',
        'أستاذ',
        'استاذ',
        'مهندس',
        'حكيم',
        'ممرض',
        'ممرضة',
        'كابتن',
    ]

    if (standaloneHonorifics.includes(cleanFirstWord)) {
        return words.slice(1).join(' ')
    }

    return name
}

export function calculateAge(
    dobString: string | Date | undefined
): number | null {
    if (!dobString) return null
    const today = new Date()
    const birthDate = new Date(dobString)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
        age--
    }
    return age >= 0 ? age : 0
}
