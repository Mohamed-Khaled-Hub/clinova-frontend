'use client'

// Core
import {
    PropsWithChildren,
    createContext,
    useContext,
    useCallback,
    useMemo,
} from 'react'
// Enums
import { EndpointsEnum } from '@/src/enums/endpoints.enum'
// Functions
import { catchBackendError } from '@/src/utils/functions'
// Types
import {
    CreatePermissionRequest,
    UpdatePermissionRequest,
} from '@/src/types/backend/backend.requests.type'
import { PermissionDocument } from '@/src/types/backend/documents.type'
import { PermissionContextType } from '@/src/types/contexts.type'
// Variables
import { api } from '@/src/utils/api'
import { endpoints } from '@/src/constants/server.constant'

// Context
export const PermissionContext = createContext<PermissionContextType>(
    {} as PermissionContextType
)

// Hook
export const usePermission = () => {
    const context = useContext(PermissionContext)
    if (!context) {
        throw new Error(
            'usePermission must be used within a PermissionProvider'
        )
    }
    return context
}

// Provider
export default function PermissionProvider({ children }: PropsWithChildren) {
    // GET /permissions
    const getPermissions = useCallback(async (): Promise<
        PermissionDocument[]
    > => {
        const { data, error } = await catchBackendError(
            api.get<PermissionDocument[]>(
                endpoints[EndpointsEnum.PERMISSION].root
            )
        )

        if (error) throw error
        return data
    }, [])

    // POST /permissions
    const createPermission = useCallback(
        async (
            createPermissionData: CreatePermissionRequest
        ): Promise<PermissionDocument> => {
            const { data, error } = await catchBackendError(
                api.post<PermissionDocument>(
                    endpoints[EndpointsEnum.PERMISSION].root,
                    createPermissionData
                )
            )

            if (error) throw error
            return data
        },
        []
    )

    // GET /permissions/:id
    const getPermissionById = useCallback(
        async (id: string): Promise<PermissionDocument> => {
            const { data, error } = await catchBackendError(
                api.get<PermissionDocument>(
                    endpoints[EndpointsEnum.PERMISSION].byId(id)
                )
            )

            if (error) throw error
            return data
        },
        []
    )

    // PATCH /permissions/:id
    const updatePermission = useCallback(
        async (
            id: string,
            updatePermissionData: UpdatePermissionRequest
        ): Promise<PermissionDocument> => {
            const { data, error } = await catchBackendError(
                api.patch<PermissionDocument>(
                    endpoints[EndpointsEnum.PERMISSION].byId(id),
                    updatePermissionData
                )
            )

            if (error) throw error
            return data
        },
        []
    )

    // DELETE /permissions/:id
    const deletePermission = useCallback(async (id: string): Promise<void> => {
        const { error } = await catchBackendError(
            api.delete(endpoints[EndpointsEnum.PERMISSION].byId(id))
        )

        if (error) throw error
    }, [])

    // Context Value
    const contextValue = useMemo(
        () => ({
            getPermissions,
            createPermission,
            getPermissionById,
            updatePermission,
            deletePermission,
        }),
        [
            getPermissions,
            createPermission,
            getPermissionById,
            updatePermission,
            deletePermission,
        ]
    )

    return (
        <PermissionContext.Provider value={contextValue}>
            {children}
        </PermissionContext.Provider>
    )
}
