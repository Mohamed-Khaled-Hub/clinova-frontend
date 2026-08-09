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
    CreateRoleRequest,
    UpdateRoleRequest,
    AddPermissionsRequest,
    RemovePermissionsRequest,
} from '@/src/types/backend/backend.requests.type'
import { RoleResponse } from '@/src/types/backend/backend.responses.type'
import { RoleContextType } from '@/src/types/contexts.type'
// Variables
import { api } from '@/src/utils/api'
import { endpoints } from '@/src/constants/server.constant'

// Context
export const RoleContext = createContext<RoleContextType>({} as RoleContextType)

// Hook
export const useRole = () => {
    const context = useContext(RoleContext)
    if (!context) {
        throw new Error('useRole must be used within a RoleProvider')
    }
    return context
}

// Provider
export default function RoleProvider({ children }: PropsWithChildren) {
    // GET /roles
    const getRoles = useCallback(async (): Promise<RoleResponse[]> => {
        const { data, error } = await catchBackendError(
            api.get<RoleResponse[]>(endpoints[EndpointsEnum.ROLE].root)
        )

        if (error) throw error
        return data
    }, [])

    // POST /roles
    const createRole = useCallback(
        async (createRoleData: CreateRoleRequest): Promise<RoleResponse> => {
            const { data, error } = await catchBackendError(
                api.post<RoleResponse>(
                    endpoints[EndpointsEnum.ROLE].root,
                    createRoleData
                )
            )

            if (error) throw error
            return data
        },
        []
    )

    // GET /roles/:id
    const getRoleById = useCallback(
        async (id: string): Promise<RoleResponse> => {
            const { data, error } = await catchBackendError(
                api.get<RoleResponse>(endpoints[EndpointsEnum.ROLE].byId(id))
            )

            if (error) throw error
            return data
        },
        []
    )

    // PATCH /roles/:id
    const updateRole = useCallback(
        async (
            id: string,
            updateRoleData: UpdateRoleRequest
        ): Promise<RoleResponse> => {
            const { data, error } = await catchBackendError(
                api.patch<RoleResponse>(
                    endpoints[EndpointsEnum.ROLE].byId(id),
                    updateRoleData
                )
            )

            if (error) throw error
            return data
        },
        []
    )

    // PATCH /roles/:id/permissions/add
    const addPermissions = useCallback(
        async (
            id: string,
            addPermissionsData: AddPermissionsRequest
        ): Promise<RoleResponse> => {
            const { data, error } = await catchBackendError(
                api.patch<RoleResponse>(
                    endpoints[EndpointsEnum.ROLE].addPermissions(id),
                    addPermissionsData
                )
            )

            if (error) throw error
            return data
        },
        []
    )

    // PATCH /roles/:id/permissions/remove
    const removePermissions = useCallback(
        async (
            id: string,
            removePermissionsData: RemovePermissionsRequest
        ): Promise<RoleResponse> => {
            const { data, error } = await catchBackendError(
                api.patch<RoleResponse>(
                    endpoints[EndpointsEnum.ROLE].removePermissions(id),
                    removePermissionsData
                )
            )

            if (error) throw error
            return data
        },
        []
    )

    // DELETE /roles/:id
    const deleteRole = useCallback(async (id: string): Promise<void> => {
        const { error } = await catchBackendError(
            api.delete(endpoints[EndpointsEnum.ROLE].byId(id))
        )

        if (error) throw error
    }, [])

    // Context Value
    const contextValue = useMemo(
        () => ({
            getRoles,
            createRole,
            getRoleById,
            updateRole,
            addPermissions,
            removePermissions,
            deleteRole,
        }),
        [
            getRoles,
            createRole,
            getRoleById,
            updateRole,
            addPermissions,
            removePermissions,
            deleteRole,
        ]
    )

    return (
        <RoleContext.Provider value={contextValue}>
            {children}
        </RoleContext.Provider>
    )
}
