'use client'

// Core
import { FaShieldAlt } from 'react-icons/fa'
import { useRouter } from '@/src/i18n/routing'
import { useLocale, useTranslations } from 'next-intl'
import { SubmitEvent, use, useEffect, useState } from 'react'
// Components
import Input from '@/src/components/UiRelated/Input'
import PopupMessage from '@/src/components/UiRelated/PopupMessage'
import ErrorMessages from '@/src/components/UiRelated/ErrorMessages'
import Loading from '@/src/components/UiRelated/Loading'
import ContentSection from '@/src/components/PagesRelated/ContentSection'
import FormBoundaryActions from '@/src/components/PagesRelated/FormBoundaryActions'
import DataDisplayBlock from '@/src/components/PagesRelated/DataDisplayBlock'
import FieldsGrid from '@/src/components/ContainerRelated/FieldsGrid'
import PageContainer from '@/src/components/ContainerRelated/PageContainer'
import PageHeader from '@/src/components/PagesRelated/PageHeader'
import Toggle from '@/src/components/UiRelated/Toggle'
import StatusBadge from '@/src/components/UiRelated/StatusBadge'
// Enums
import { PermissionsEnum } from '@/src/enums/roles-permissions.enum'
import { StatusEnum } from '@/src/enums/ui.enum'
// Functions
import { formatTimestamp, hasPermission } from '@/src/utils/functions'
// Hooks
import { useUser } from '@/src/providers/UserProvider'
import { useRole } from '@/src/providers/RoleProvider'
// Types
import { LocaleType } from '@/src/types/i18n.type'
import { IdPageProps } from '@/src/types/props.type'
import {
    BackendErrorResponse,
    RoleResponse,
} from '@/src/types/backend/backend.responses.type'
import {
    UpdateRoleRequest,
    AddPermissionsRequest,
    RemovePermissionsRequest,
} from '@/src/types/backend/backend.requests.type'
// Style
import '@/src/styles/pages/(root)/admin/roles/[id]/page.css'

export default function RoleDetailsPage({ params }: IdPageProps) {
    // Params
    const { id } = use(params)

    // Translations
    const t = useTranslations('RolePage')
    const tTech = useTranslations('SystemTechTerms')

    // From Providers
    const router = useRouter()
    const locale = useLocale() as LocaleType
    const { user, isLoadingProfile } = useUser()
    const {
        getRoleById,
        updateRole,
        addPermissions,
        removePermissions,
        deleteRole,
    } = useRole()

    // Page States
    const [isEditing, setIsEditing] = useState<boolean>(false)
    const [isSaving, setIsSaving] = useState<boolean>(false)
    const [isDeleting, setIsDeleting] = useState<boolean>(false)
    const [isScreenLoading, setIsScreenLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | string[] | null>(null)
    const [toast, setToast] = useState<{
        message: string | string[]
        type: StatusEnum
    } | null>(null)

    // Role Form States
    const [targetRole, setTargetRole] = useState<RoleResponse | null>(null)
    const [roleName, setRoleName] = useState<string>('')
    const [permissions, setPermissions] = useState<RoleResponse['permissions']>(
        []
    )

    // Get Role Data
    useEffect(() => {
        const fetchTargetRole = async () => {
            try {
                setIsScreenLoading(true)
                setError(null)
                const data = await getRoleById(id)
                setTargetRole(data)
            } catch (err) {
                const backendErr = err as BackendErrorResponse
                setError(backendErr.message)
            } finally {
                setIsScreenLoading(false)
            }
        }
        fetchTargetRole().then()
    }, [id, getRoleById])

    // Authorization Guard Check
    const canReadRole = hasPermission(user, PermissionsEnum.ROLE, 'canRead')
    const canWriteRole = hasPermission(user, PermissionsEnum.ROLE, 'canWrite')

    // Early Termination
    if (isLoadingProfile || isScreenLoading) {
        return <Loading />
    }

    if (!targetRole || !canReadRole) {
        return null
    }

    // Event Handlers
    const handleStartEditing = () => {
        if (!canWriteRole) return
        setError(null)
        if (targetRole) {
            setRoleName(targetRole.roleName)
            setPermissions(
                targetRole.permissions.map((p) => ({
                    ...p,
                    permission: { ...p.permission },
                }))
            )
        }
        setIsEditing(true)
    }

    const handleCancelEditing = () => {
        setIsEditing(false)
        setError(null)
    }

    const handleTogglePermissionField = (
        permissionId: string,
        type: 'canRead' | 'canWrite'
    ) => {
        setPermissions((prev) =>
            prev.map((p) =>
                p.permission._id === permissionId
                    ? { ...p, [type]: !p[type] }
                    : p
            )
        )
    }

    const handleSaveChanges = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!canWriteRole || !targetRole) return
        setError(null)
        setIsSaving(true)

        try {
            let currentRoleState = targetRole

            if (roleName.trim() !== targetRole.roleName) {
                const namePayload: UpdateRoleRequest = {
                    roleName: roleName.trim(),
                }
                currentRoleState = await updateRole(id, namePayload)
            }

            const removedIds: string[] = []
            const addedOrUpdatedPermissions: AddPermissionsRequest['permissions'] =
                []

            permissions.forEach((updatedPerm) => {
                const originalPerm = targetRole.permissions.find(
                    (op) => op.permission._id === updatedPerm.permission._id
                )

                const hasReadOrWrite =
                    updatedPerm.canRead || updatedPerm.canWrite

                if (!hasReadOrWrite) {
                    if (originalPerm) {
                        removedIds.push(updatedPerm.permission._id)
                    }
                } else {
                    if (
                        !originalPerm ||
                        originalPerm.canRead !== updatedPerm.canRead ||
                        originalPerm.canWrite !== updatedPerm.canWrite
                    ) {
                        addedOrUpdatedPermissions.push({
                            permissionId: updatedPerm.permission._id,
                            canRead: updatedPerm.canRead,
                            canWrite: updatedPerm.canWrite,
                        })
                    }
                }
            })

            if (removedIds.length > 0) {
                const removalPayload: RemovePermissionsRequest = {
                    permissionIds: removedIds,
                }
                currentRoleState = await removePermissions(id, removalPayload)
            }

            if (addedOrUpdatedPermissions.length > 0) {
                const addPayload: AddPermissionsRequest = {
                    permissions: addedOrUpdatedPermissions,
                }
                currentRoleState = await addPermissions(id, addPayload)
            }

            setTargetRole(currentRoleState)
            setToast({ message: t('updateSuccess'), type: StatusEnum.SUCCESS })
            setIsEditing(false)
        } catch (err) {
            const backendErr = err as BackendErrorResponse
            setError(backendErr.message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteRole = async () => {
        if (!canWriteRole) return
        if (!window.confirm(t('confirmDelete'))) return

        setError(null)
        setIsDeleting(true)
        try {
            await deleteRole(id)
            router.push('/admin')
        } catch (err) {
            const backendErr = err as BackendErrorResponse
            setError(backendErr.message)
            setIsDeleting(false)
        }
    }

    return (
        <PageContainer id='role-details-page'>
            <PageHeader
                title={t('sectionTitle')}
                subtitle={`${tTech('id')}: ${targetRole._id}`}
                Icon={FaShieldAlt}
            />

            {error && <ErrorMessages messages={error} />}

            <form onSubmit={handleSaveChanges}>
                <ContentSection>
                    <FormBoundaryActions
                        title={t('sectionTitle')}
                        position='top'
                        isEditing={isEditing}
                        isSaving={isSaving}
                        isDeleting={isDeleting}
                        hideControls={!canWriteRole}
                        onStartEditAction={handleStartEditing}
                        onCancelEditAction={handleCancelEditing}
                        onDeleteAction={handleDeleteRole}
                    />

                    <FieldsGrid>
                        {/* Role Name */}
                        <DataDisplayBlock
                            label={t('roleName')}
                            isEditing={isEditing}
                            fullWidth
                            viewValue={targetRole.roleName}
                            editInput={
                                <Input
                                    value={roleName}
                                    onChangeAction={(val) => setRoleName(val)}
                                    placeholder={t('roleNamePlaceholder')}
                                    disabled={isSaving}
                                    type='text'
                                    required
                                />
                            }
                        />

                        {/* Permissions Grid Header Wrapper */}
                        <div className='roles-header-divider'>
                            <h3 className='roles-header-title'>
                                {t('permissionsMatrixTitle') ||
                                    'System Permissions'}
                            </h3>
                        </div>

                        {/* Rendering Matrix */}
                        {(isEditing ? permissions : targetRole.permissions).map(
                            (permWrapper) => {
                                const { permission, canRead, canWrite } =
                                    permWrapper

                                return (
                                    <DataDisplayBlock
                                        key={permission._id}
                                        label={permission.permissionKey}
                                        isEditing={isEditing}
                                        viewValue={
                                            <div className='roles-badge-container'>
                                                <StatusBadge
                                                    text={
                                                        t('readLabel') || 'Read'
                                                    }
                                                    variant={
                                                        canRead
                                                            ? StatusEnum.SUCCESS
                                                            : StatusEnum.ERROR
                                                    }
                                                />
                                                <StatusBadge
                                                    text={
                                                        t('writeLabel') ||
                                                        'Write'
                                                    }
                                                    variant={
                                                        canWrite
                                                            ? StatusEnum.SUCCESS
                                                            : StatusEnum.ERROR
                                                    }
                                                />
                                            </div>
                                        }
                                        editInput={
                                            <div className='roles-toggle-wrapper'>
                                                <label className='roles-toggle-label'>
                                                    <Toggle
                                                        id={`canReadToggle-${permission._id}`}
                                                        checked={canRead}
                                                        disabled={isSaving}
                                                        onChangeAction={() =>
                                                            handleTogglePermissionField(
                                                                permission._id,
                                                                'canRead'
                                                            )
                                                        }
                                                    />
                                                    {t('readLabel') || 'Read'}
                                                </label>

                                                <label className='roles-toggle-label'>
                                                    <Toggle
                                                        id={`canWriteToggle-${permission._id}`}
                                                        checked={canWrite}
                                                        disabled={isSaving}
                                                        onChangeAction={() =>
                                                            handleTogglePermissionField(
                                                                permission._id,
                                                                'canWrite'
                                                            )
                                                        }
                                                    />
                                                    {t('writeLabel') || 'Write'}
                                                </label>
                                            </div>
                                        }
                                    />
                                )
                            }
                        )}

                        {/* System Audits */}
                        <DataDisplayBlock
                            label={tTech('createdAt')}
                            isLocked
                            viewValue={formatTimestamp(
                                locale,
                                targetRole.createdAt,
                                'relative'
                            )}
                        />

                        <DataDisplayBlock
                            label={tTech('updatedAt')}
                            isLocked
                            viewValue={formatTimestamp(
                                locale,
                                targetRole.updatedAt,
                                'relative'
                            )}
                        />
                    </FieldsGrid>

                    <FormBoundaryActions
                        position='bottom'
                        isEditing={isEditing}
                        isSaving={isSaving}
                        hideControls={!canWriteRole}
                        onStartEditAction={handleStartEditing}
                        onCancelEditAction={handleCancelEditing}
                    />
                </ContentSection>
            </form>

            {toast && (
                <PopupMessage
                    message={toast.message}
                    type={toast.type}
                    onCloseAction={() => setToast(null)}
                />
            )}
        </PageContainer>
    )
}
