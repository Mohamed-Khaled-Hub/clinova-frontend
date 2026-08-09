'use client'

// Core
import { SubmitEvent, useState, useEffect } from 'react'
import { FaShieldAlt } from 'react-icons/fa'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import { useRouter } from '@/src/i18n/routing'
import { useTranslations } from 'next-intl'
// Components
import Input from '@/src/components/UiRelated/Input'
import Select from '@/src/components/UiRelated/Select'
import Toggle from '@/src/components/UiRelated/Toggle'
import Loading from '@/src/components/UiRelated/Loading'
import Button from '@/src/components/UiRelated/Button'
import PageHeader from '@/src/components/PagesRelated/PageHeader'
import PopupMessage from '@/src/components/UiRelated/PopupMessage'
import FormControl from '@/src/components/PagesRelated/FormControl'
import ErrorMessages from '@/src/components/UiRelated/ErrorMessages'
import FormFieldSet from '@/src/components/PagesRelated/FormFieldSet'
import PageContainer from '@/src/components/ContainerRelated/PageContainer'
import FormBoundaryActions from '@/src/components/PagesRelated/FormBoundaryActions'
// Enums
import { StatusEnum } from '@/src/enums/ui.enum'
import { PermissionsEnum } from '@/src/enums/roles-permissions.enum'
// Functions
import { hasPermission } from '@/src/utils/functions'
// Hooks
import { useUser } from '@/src/providers/UserProvider'
import { useRole } from '@/src/providers/RoleProvider'
import { usePermission } from '@/src/providers/PermissionProvider'
// Types
import { CreateRoleRequest } from '@/src/types/backend/backend.requests.type'
import { BackendErrorResponse } from '@/src/types/backend/backend.responses.type'
import {
    PermissionDocument,
    RolePermissionSubDocument,
} from '@/src/types/backend/documents.type'
// Style
import '@/src/styles/pages/(root)/admin/roles/create/page.css'

export default function CreateRolePage() {
    // Translations
    const t = useTranslations('CreateRolePage')

    // From Providers
    const router = useRouter()
    const { createRole } = useRole()
    const { getPermissions } = usePermission()
    const { user, isLoadingProfile } = useUser()

    // Page States
    const [systemPermissions, setSystemPermissions] = useState<
        PermissionDocument[]
    >([])
    const [isLoadingPermissions, setIsLoadingPermissions] = useState(true)
    const [isSuccess, setIsSuccess] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formError, setFormError] = useState<string | string[] | null>(null)
    const [toast, setToast] = useState<{
        message: string
        type: StatusEnum
    } | null>(null)

    // Form Initialization Payload
    const [formData, setFormData] = useState<CreateRoleRequest>({
        roleName: '',
        permissions: [],
    })

    // Fetch System Permissions
    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                setIsLoadingPermissions(true)
                const data = await getPermissions()
                setSystemPermissions(data || [])
            } catch (err) {
                console.error('Failed to load system permissions:', err)
            } finally {
                setIsLoadingPermissions(false)
            }
        }

        fetchPermissions().then()
    }, [getPermissions])

    // Authorization Guard Check
    const canWriteRoles = hasPermission(user, PermissionsEnum.ROLE, 'canWrite')

    // Early Termination
    if (isLoadingProfile || isLoadingPermissions) {
        return <Loading />
    }

    if (!canWriteRoles) {
        return null
    }

    // Event Handlers
    const permissionOptions = systemPermissions.map(
        (perm: PermissionDocument) => ({
            value: perm._id,
            label: perm.permissionKey,
        })
    )

    const updateRoleField = <K extends keyof CreateRoleRequest>(
        fieldName: K,
        value: CreateRoleRequest[K]
    ) => {
        setFormData((prev) => ({ ...prev, [fieldName]: value }))
    }

    const addPermissionRow = () => {
        const assignedIds = formData.permissions.map((p) => p.permissionId)
        const availableOpt = systemPermissions.find(
            (p) => !assignedIds.includes(p._id)
        )

        const newPermission: RolePermissionSubDocument = {
            permissionId: availableOpt ? availableOpt._id : '',
            canRead: false,
            canWrite: false,
        }
        updateRoleField('permissions', [...formData.permissions, newPermission])
    }

    const updatePermissionRow = (
        index: number,
        key: keyof RolePermissionSubDocument,
        value: string | boolean
    ) => {
        const updatedPermissions = [...formData.permissions]
        updatedPermissions[index] = {
            ...updatedPermissions[index],
            [key]: value,
        }
        updateRoleField('permissions', updatedPermissions)
    }

    const removePermissionRow = (index: number) => {
        const filtered = formData.permissions.filter((_, idx) => idx !== index)
        updateRoleField('permissions', filtered)
    }

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault()
        setFormError(null)
        setIsSubmitting(true)

        const cleanPermissions = formData.permissions.filter(
            (p) => p.permissionId !== ''
        )
        const payload: CreateRoleRequest = {
            ...formData,
            permissions: cleanPermissions,
        }

        try {
            await createRole(payload)
            setIsSuccess(true)
            setToast({ message: t('successMessage'), type: StatusEnum.SUCCESS })
        } catch (err) {
            const backendErr = err as BackendErrorResponse
            setFormError(backendErr.message)
            setIsSubmitting(false)
        }
    }

    const handlePopupClose = () => {
        setToast(null)
        if (isSuccess) router.push('/admin')
    }

    return (
        <PageContainer className='!max-w-4xl' id='create-role-container'>
            <PageHeader
                title={t('title')}
                subtitle={t('subtitle')}
                Icon={FaShieldAlt}
            />

            {formError && <ErrorMessages messages={formError} />}

            <form onSubmit={handleSubmit} className='role-form-element'>
                {/* Meta Settings */}
                <FormFieldSet legend={t('roleIdentity')} columns={1}>
                    <FormControl id='roleName' label={t('roleName')} required>
                        <Input
                            id='roleName'
                            type='text'
                            value={formData.roleName}
                            onChangeAction={(val) =>
                                updateRoleField('roleName', val)
                            }
                            placeholder={t('roleNamePlaceholder')}
                            disabled={isSubmitting}
                            required
                        />
                    </FormControl>
                </FormFieldSet>

                {/* Authorization Keys Configuration Stack */}
                <FormFieldSet legend={t('permissionsAssignment')} columns={1}>
                    <div className='role-permissions-configuration-stack'>
                        {formData.permissions.length > 0 && (
                            <div className='permissions-table-header'>
                                <span>{t('permissionIdentifier')}</span>
                                <span className='text-center'>
                                    {t('readAccess')}
                                </span>
                                <span className='text-center'>
                                    {t('writeAccess')}
                                </span>
                                <span className='text-center'>
                                    {t('actions')}
                                </span>
                            </div>
                        )}

                        {formData.permissions.map((row, idx) => (
                            <div key={idx} className='permission-row-item'>
                                <div className='w-full'>
                                    <Select
                                        id={`perm-select-${idx}`}
                                        value={row.permissionId}
                                        onChangeAction={(val) =>
                                            updatePermissionRow(
                                                idx,
                                                'permissionId',
                                                val
                                            )
                                        }
                                        disabled={isSubmitting}
                                        required
                                        options={[
                                            {
                                                value: '',
                                                label: t(
                                                    'selectPermissionPlaceholder'
                                                ),
                                            },
                                            ...permissionOptions,
                                        ]}
                                    />
                                </div>

                                <div className='flex justify-center items-center'>
                                    <Toggle
                                        id={`perm-read-${idx}`}
                                        checked={row.canRead}
                                        onChangeAction={(checked) =>
                                            updatePermissionRow(
                                                idx,
                                                'canRead',
                                                checked
                                            )
                                        }
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className='flex justify-center items-center'>
                                    <Toggle
                                        id={`perm-write-${idx}`}
                                        checked={row.canWrite}
                                        onChangeAction={(checked) =>
                                            updatePermissionRow(
                                                idx,
                                                'canWrite',
                                                checked
                                            )
                                        }
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div className='flex justify-center items-center'>
                                    <Button
                                        variant='destructive-light'
                                        onClick={() => removePermissionRow(idx)}
                                        disabled={isSubmitting}
                                        title={t('removePermission')}
                                        Icon={FiTrash2}
                                    />
                                </div>
                            </div>
                        ))}

                        <Button
                            label={t('addPermissionAction')}
                            Icon={FiPlus}
                            variant='normal-light'
                            type='button'
                            onClick={addPermissionRow}
                            disabled={isSubmitting}
                            className='role-add-permission-btn-wrapper'
                        />
                    </div>
                </FormFieldSet>

                <FormBoundaryActions
                    position='bottom'
                    mode='create'
                    isSaving={isSubmitting}
                    onCreateCancelAction={() => router.back()}
                />
            </form>

            {toast && (
                <PopupMessage
                    message={toast.message}
                    type={toast.type}
                    onCloseAction={handlePopupClose}
                />
            )}
        </PageContainer>
    )
}
