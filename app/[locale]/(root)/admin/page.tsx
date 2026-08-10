'use client'

// Core
import { useEffect, useState } from 'react'
import { FiPlusCircle, FiShield, FiUser, FiUsers, FiKey } from 'react-icons/fi'
import { RiUserSettingsFill } from 'react-icons/ri'
import { useRouter } from '@/src/i18n/routing'
import { useLocale, useTranslations } from 'next-intl'
// Components
import Button from '@/src/components/UiRelated/Button'
import Loading from '@/src/components/UiRelated/Loading'
import ErrorMessages from '@/src/components/UiRelated/ErrorMessages'
import PageHeader from '@/src/components/PagesRelated/PageHeader'
import PageContainer from '@/src/components/ContainerRelated/PageContainer'
import TableCell from '@/src/components/PagesRelated/TableCell'
import DataTable from '@/src/components/PagesRelated/DataTable'
import Tabs from '@/src/components/PagesRelated/Tabs'
// Enums
import { PermissionsEnum } from '@/src/enums/roles-permissions.enum'
// Functions
import {
    formatTimestamp,
    hasPermission,
    isAdmin,
    isSuperAdmin,
} from '@/src/utils/functions'
// Hooks
import { useUser } from '@/src/providers/UserProvider'
import { useRole } from '@/src/providers/RoleProvider'
import { usePermission } from '@/src/providers/PermissionProvider'
// Types
import { LocaleType } from '@/src/types/i18n.type'
import { TableColumnType, TabKey } from '@/src/types/ui.type'
import {
    BackendErrorResponse,
    UserResponse,
    RoleResponse,
} from '@/src/types/backend/backend.responses.type'
import { PermissionDocument } from '@/src/types/backend/documents.type'
// Variables
import { TAB_CONFIGS } from '@/src/constants/ui.constant'
// Style
import '@/src/styles/pages/(root)/admin/page.css'

export default function AdminPage() {
    // Translations
    const t = useTranslations('AdminPage')
    const tPages = useTranslations('Pages')
    const tTech = useTranslations('SystemTechTerms')

    // From Providers
    const router = useRouter()
    const locale = useLocale() as LocaleType
    const { user, getUsers, isLoadingProfile } = useUser()
    const { getRoles } = useRole()
    const { getPermissions } = usePermission()

    // Roles States
    const [roles, setRoles] = useState<RoleResponse[]>([])
    const [isLoadingRoles, setIsLoadingRoles] = useState<boolean>(true)

    // Page States
    const [error, setError] = useState<string | string[] | null>(null)
    const [activeTab, setActiveTab] = useState<TabKey>('users')

    // Users States
    const [users, setUsers] = useState<UserResponse[] | null>(null)
    const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true)

    // Permissions States
    const [permissions, setPermissions] = useState<PermissionDocument[]>([])
    const [isLoadingPermissions, setIsLoadingPermissions] =
        useState<boolean>(true)

    // Authorization Guard Check
    const canReadUsers = hasPermission(user, PermissionsEnum.USER, 'canRead')
    const canWriteUsers = hasPermission(user, PermissionsEnum.USER, 'canWrite')

    // Roles Access Guard
    const canReadRoles =
        hasPermission(user, PermissionsEnum.ROLE, 'canRead') ||
        isAdmin(user) ||
        isSuperAdmin(user)
    const canWriteRoles = hasPermission(user, PermissionsEnum.ROLE, 'canWrite')

    // Permissions Access Guard
    const canReadPermissions = hasPermission(
        user,
        PermissionsEnum.PERMISSION,
        'canRead'
    )
    const canWritePermissions = hasPermission(
        user,
        PermissionsEnum.PERMISSION,
        'canWrite'
    )

    const hasAdminAccess = canReadUsers || isAdmin(user) || isSuperAdmin(user)

    // Get Roles
    useEffect(() => {
        if (!canReadRoles) return

        let isRolesMounted = true

        const fetchAllRoles = async () => {
            try {
                setIsLoadingRoles(true)
                const data = await getRoles()
                if (isRolesMounted && data) {
                    setRoles(data)
                }
            } catch (err) {
                const backendErr = err as BackendErrorResponse
                if (isRolesMounted) {
                    setError(backendErr.message)
                }
            } finally {
                if (isRolesMounted) {
                    setIsLoadingRoles(false)
                }
            }
        }

        fetchAllRoles().then()

        return () => {
            isRolesMounted = false
        }
    }, [getRoles, canReadRoles])

    // Get permissions
    useEffect(() => {
        if (!canReadPermissions) return

        let isPermissionsMounted = true

        const fetchAllPermissions = async () => {
            try {
                setIsLoadingPermissions(true)
                const data = await getPermissions()
                if (isPermissionsMounted && data) {
                    setPermissions(data)
                }
            } catch (err) {
                const backendErr = err as BackendErrorResponse
                if (isPermissionsMounted) {
                    setError(backendErr.message)
                }
            } finally {
                if (isPermissionsMounted) {
                    setIsLoadingPermissions(false)
                }
            }
        }

        fetchAllPermissions().then()

        return () => {
            isPermissionsMounted = false
        }
    }, [getPermissions, canReadPermissions])

    // Variables
    const mappedTabs = TAB_CONFIGS.map((tab) => ({
        key: tab.key,
        label: t(tab.translationKey),
        Icon: tab.Icon,
    }))

    // Get users
    useEffect(() => {
        if (!hasAdminAccess) return

        const fetchAllUsers = async () => {
            try {
                setIsLoadingUsers(true)
                setError(null)
                const data = await getUsers()
                setUsers(data)
            } catch (err) {
                const backendErr = err as BackendErrorResponse
                setError(backendErr.message)
            } finally {
                setIsLoadingUsers(false)
            }
        }

        fetchAllUsers().then()
    }, [getUsers, hasAdminAccess])

    // Early Termination
    const isPageLoading =
        isLoadingProfile ||
        (isLoadingUsers && hasAdminAccess) ||
        (isLoadingRoles && canReadRoles && activeTab === 'roles') ||
        (isLoadingPermissions &&
            canReadPermissions &&
            activeTab === 'permissions')

    if (isPageLoading) {
        return <Loading />
    }

    if (!hasAdminAccess) {
        return null
    }

    // Table Columns Configuration: Users
    const usersTableColumns: TableColumnType<UserResponse>[] = [
        {
            header: t('tableFullNameCol'),
            renderCell: (sysUser: UserResponse) => {
                const localizedName =
                    locale === 'ar'
                        ? sysUser.fullNameAr || sysUser.fullNameEn
                        : sysUser.fullNameEn || sysUser.fullNameAr

                return (
                    <TableCell
                        Icon={FiUser}
                        value={localizedName || sysUser.username}
                    />
                )
            },
        },
        {
            header: t('tableUsernameCol'),
            renderCell: (sysUser: UserResponse) => (
                <TableCell variant='subtext'>{sysUser.username}</TableCell>
            ),
        },
        {
            header: t('tableUserRoleCol'),
            renderCell: (sysUser: UserResponse) => (
                <TableCell Icon={FiShield} variant='subtext'>
                    {sysUser.role.roleName}
                </TableCell>
            ),
        },
        {
            header: t('tableSpecializationCol'),
            renderCell: (sysUser: UserResponse) => {
                const localizedSpecialization =
                    locale === 'ar'
                        ? sysUser.specializationAr || sysUser.specializationEn
                        : sysUser.specializationEn || sysUser.specializationAr

                return (
                    <TableCell variant='subtext'>
                        {localizedSpecialization || '—'}
                    </TableCell>
                )
            },
        },
        {
            header: t('tableTimestampsCol'),
            renderCell: (sysUser: UserResponse) => (
                <TableCell variant='stacked'>
                    <div>
                        <span>{tTech('createdAt')}: </span>
                        {formatTimestamp(locale, sysUser.createdAt, 'relative')}
                    </div>
                    <div>
                        <span>{tTech('updatedAt')}: </span>
                        {formatTimestamp(locale, sysUser.updatedAt, 'relative')}
                    </div>
                </TableCell>
            ),
        },
    ]

    // Roles Table
    const rolesTableColumns: TableColumnType<RoleResponse>[] = [
        {
            header: t('tableRoleNameCol') || 'Role Name',
            renderCell: (sysRole: RoleResponse) => {
                return <TableCell Icon={FiShield} value={sysRole.roleName} />
            },
        },
        {
            header: t('tableTimestampsCol'),
            renderCell: (sysRole: RoleResponse) => (
                <TableCell variant='stacked'>
                    <div>
                        <span>{tTech('createdAt')}: </span>
                        {formatTimestamp(locale, sysRole.createdAt, 'relative')}
                    </div>
                    <div>
                        <span>{tTech('updatedAt')}: </span>
                        {formatTimestamp(locale, sysRole.updatedAt, 'relative')}
                    </div>
                </TableCell>
            ),
        },
    ]

    // Permissions Table
    const permissionsTableColumns: TableColumnType<PermissionDocument>[] = [
        {
            header: t('tablePermissionKeyCol') || 'Permission Key',
            renderCell: (sysPerm: PermissionDocument) => {
                return (
                    <TableCell Icon={FiShield} value={sysPerm.permissionKey} />
                )
            },
        },
        {
            header: t('tableTimestampsCol'),
            renderCell: (sysPerm: PermissionDocument) => (
                <TableCell variant='stacked'>
                    <div>
                        <span>{tTech('createdAt')}: </span>
                        {formatTimestamp(locale, sysPerm.createdAt, 'relative')}
                    </div>
                    <div>
                        <span>{tTech('updatedAt')}: </span>
                        {formatTimestamp(locale, sysPerm.updatedAt, 'relative')}
                    </div>
                </TableCell>
            ),
        },
    ]

    return (
        <PageContainer className='!max-w-7xl' id='admin-page'>
            <PageHeader
                title={t('title')}
                subtitle={t('subtitle')}
                Icon={RiUserSettingsFill}
                noBorder
            />

            <Tabs
                tabs={mappedTabs}
                activeTab={activeTab}
                onChangeAction={(key) => setActiveTab(key)}
            />

            {error && <ErrorMessages messages={error} />}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <>
                    <PageHeader
                        title={t('usersTabTitle')}
                        subtitle={t('usersTabSubtitle')}
                        action={
                            canWriteUsers ? (
                                <Button
                                    href='/admin/users/create'
                                    label={tPages('createUser')}
                                    Icon={FiPlusCircle}
                                    variant='normal-dark'
                                />
                            ) : undefined
                        }
                        Icon={FiUsers}
                    />

                    <DataTable
                        data={users || []}
                        columns={usersTableColumns}
                        getRowKeyAction={(sysUser) => sysUser._id}
                        onRowClickAction={(sysUser) =>
                            router.push(`/admin/users/${sysUser._id}`)
                        }
                        emptyStateMessage={t('noUserRecords')}
                    />
                </>
            )}

            {/* Roles Tab */}
            {activeTab === 'roles' && (
                <>
                    <PageHeader
                        title={t('rolesTabTitle')}
                        subtitle={t('rolesTabSubtitle')}
                        action={
                            canWriteRoles ? (
                                <Button
                                    href='/admin/roles/create'
                                    label={tPages('createRole')}
                                    Icon={FiPlusCircle}
                                    variant='normal-dark'
                                />
                            ) : undefined
                        }
                        Icon={FiKey}
                    />

                    <DataTable
                        data={roles || []}
                        columns={rolesTableColumns}
                        getRowKeyAction={(sysRole) => sysRole._id}
                        onRowClickAction={(sysRole) =>
                            router.push(`/admin/roles/${sysRole._id}`)
                        }
                        emptyStateMessage={
                            t('noRoleRecords') || 'No role definitions found.'
                        }
                    />
                </>
            )}

            {/* Permissions Tab */}
            {activeTab === 'permissions' && canReadPermissions && (
                <>
                    <PageHeader
                        title={t('permissionsTabTitle')}
                        subtitle={t('permissionsTabSubtitle')}
                        action={
                            canWritePermissions ? (
                                <Button
                                    href='/admin/permissions/create'
                                    label={tPages('createPermission')}
                                    Icon={FiPlusCircle}
                                    variant='normal-dark'
                                />
                            ) : undefined
                        }
                        Icon={FiShield}
                    />

                    <DataTable
                        data={permissions || []}
                        columns={permissionsTableColumns}
                        getRowKeyAction={(sysPerm) => sysPerm._id}
                        onRowClickAction={(sysPerm) =>
                            router.push(`/admin/permissions/${sysPerm._id}`)
                        }
                        emptyStateMessage={t('noPermissionRecords')}
                    />
                </>
            )}
        </PageContainer>
    )
}
