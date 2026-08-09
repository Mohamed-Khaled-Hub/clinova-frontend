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
// Enums
import { PermissionsEnum } from '@/src/enums/roles-permissions.enum'
import { StatusEnum } from '@/src/enums/ui.enum'
// Functions
import { formatTimestamp, hasPermission } from '@/src/utils/functions'
// Hooks
import { useUser } from '@/src/providers/UserProvider'
import { usePermission } from '@/src/providers/PermissionProvider'
// Types
import { LocaleType } from '@/src/types/i18n.type'
import { IdPageProps } from '@/src/types/props.type'
import { BackendErrorResponse } from '@/src/types/backend/backend.responses.type'
import { PermissionDocument } from '@/src/types/backend/documents.type'
import { UpdatePermissionRequest } from '@/src/types/backend/backend.requests.type'
// Style
import '@/src/styles/pages/(root)/admin/permissions/[id]/page.css'

export default function PermissionDetailsPage({ params }: IdPageProps) {
    // Params
    const { id } = use(params)

    // Translations
    const t = useTranslations('PermissionPage')
    const tTech = useTranslations('SystemTechTerms')

    // From Providers
    const router = useRouter()
    const locale = useLocale() as LocaleType
    const { user, isLoadingProfile } = useUser()
    const { getPermissionById, updatePermission, deletePermission } =
        usePermission()

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

    // Permission Form States
    const [targetPermission, setTargetPermission] =
        useState<PermissionDocument | null>(null)
    const [permissionKey, setPermissionKey] = useState<string>('')

    // Get Permission Data
    useEffect(() => {
        const fetchTargetPermission = async () => {
            try {
                setIsScreenLoading(true)
                setError(null)
                const data = await getPermissionById(id)
                setTargetPermission(data)
            } catch (err) {
                const backendErr = err as BackendErrorResponse
                setError(backendErr.message)
            } finally {
                setIsScreenLoading(false)
            }
        }
        fetchTargetPermission().then()
    }, [id, getPermissionById])

    // Authorization Guard Check
    const canReadPermission = hasPermission(
        user,
        PermissionsEnum.PERMISSION,
        'canRead'
    )
    const canWritePermission = hasPermission(
        user,
        PermissionsEnum.PERMISSION,
        'canWrite'
    )

    // Early Termination
    if (isLoadingProfile || isScreenLoading) {
        return <Loading />
    }

    if (!targetPermission || !canReadPermission) {
        return null
    }

    // Event Handlers
    const handleStartEditing = () => {
        if (!canWritePermission) return
        setError(null)
        if (targetPermission) {
            setPermissionKey(targetPermission.permissionKey)
        }
        setIsEditing(true)
    }

    const handleCancelEditing = () => {
        setIsEditing(false)
        setError(null)
    }

    const handleSaveChanges = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!canWritePermission || !targetPermission) return
        setError(null)
        setIsSaving(true)

        try {
            let currentPermissionState = targetPermission

            if (permissionKey.trim() !== targetPermission.permissionKey) {
                const payload: UpdatePermissionRequest = {
                    permissionKey: permissionKey.trim(),
                }
                currentPermissionState = await updatePermission(id, payload)
            }

            setTargetPermission(currentPermissionState)
            setToast({
                message: t('updateSuccess'),
                type: StatusEnum.SUCCESS,
            })
            setIsEditing(false)
        } catch (err) {
            const backendErr = err as BackendErrorResponse
            setError(backendErr.message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeletePermission = async () => {
        if (!canWritePermission) return
        if (!window.confirm(t('confirmDelete'))) return

        setError(null)
        setIsDeleting(true)
        try {
            await deletePermission(id)
            router.push('/admin')
        } catch (err) {
            const backendErr = err as BackendErrorResponse
            setError(backendErr.message)
            setIsDeleting(false)
        }
    }

    return (
        <PageContainer id='permission-details-page'>
            <PageHeader
                title={t('sectionTitle')}
                subtitle={`${tTech('id')}: ${targetPermission._id}`}
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
                        hideControls={!canWritePermission}
                        onStartEditAction={handleStartEditing}
                        onCancelEditAction={handleCancelEditing}
                        onDeleteAction={handleDeletePermission}
                    />

                    <FieldsGrid>
                        {/* Permission Key */}
                        <DataDisplayBlock
                            label={t('permissionKey')}
                            isEditing={isEditing}
                            fullWidth
                            viewValue={targetPermission.permissionKey}
                            editInput={
                                <Input
                                    value={permissionKey}
                                    onChangeAction={(val) =>
                                        setPermissionKey(val)
                                    }
                                    placeholder={t('permissionKeyPlaceholder')}
                                    disabled={isSaving}
                                    type='text'
                                    required
                                />
                            }
                        />

                        {/* System Audits */}
                        <DataDisplayBlock
                            label={tTech('createdAt')}
                            isLocked
                            viewValue={formatTimestamp(
                                locale,
                                targetPermission.createdAt,
                                'full'
                            )}
                        />

                        <DataDisplayBlock
                            label={tTech('updatedAt')}
                            isLocked
                            viewValue={formatTimestamp(
                                locale,
                                targetPermission.updatedAt,
                                'full'
                            )}
                        />
                    </FieldsGrid>

                    <FormBoundaryActions
                        position='bottom'
                        isEditing={isEditing}
                        isSaving={isSaving}
                        hideControls={!canWritePermission}
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
