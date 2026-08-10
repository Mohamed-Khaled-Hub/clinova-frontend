'use client'

// Core
import { FaUserCircle } from 'react-icons/fa'
import { useRouter } from '@/src/i18n/routing'
import { useLocale, useTranslations } from 'next-intl'
import { SubmitEvent, use, useEffect, useState } from 'react'
// Components
import Input from '@/src/components/UiRelated/Input'
import Select from '@/src/components/UiRelated/Select'
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
import { useRole } from '@/src/providers/RoleProvider'
// Types
import { LocaleType } from '@/src/types/i18n.type'
import { IdPageProps } from '@/src/types/props.type'
import {
    BackendErrorResponse,
    UserResponse,
    RoleResponse,
} from '@/src/types/backend/backend.responses.type'
import { UpdateUserRequest } from '@/src/types/backend/backend.requests.type'
// Style
import '@/src/styles/pages/(root)/admin/users/[id]/page.css'

export default function UserDetailsPage({ params }: IdPageProps) {
    // Params
    const { id } = use(params)

    // Translations
    const t = useTranslations('UserPage')
    const tTech = useTranslations('SystemTechTerms')

    // From Providers
    const router = useRouter()
    const locale = useLocale() as LocaleType
    const {
        user,
        getUserById,
        updateUser,
        updateUserRole,
        deleteUser,
        isLoadingProfile,
    } = useUser()
    const { getRoles } = useRole()

    // Roles States
    const [roles, setRoles] = useState<RoleResponse[]>([])

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

    // User Form States
    const [targetUser, setTargetUser] = useState<UserResponse | null>(null)
    const [username, setUsername] = useState<string>('')
    const [roleId, setRoleId] = useState<string>('')
    const [fullNameEn, setFullNameEn] = useState<string>('')
    const [fullNameAr, setFullNameAr] = useState<string>('')
    const [specializationEn, setSpecializationEn] = useState<string>('')
    const [specializationAr, setSpecializationAr] = useState<string>('')
    const [imageUrl, setImageUrl] = useState<string>('')

    // Get User & Roles
    useEffect(() => {
        let isMounted = true

        const fetchData = async () => {
            try {
                setIsScreenLoading(true)

                const [userData, rolesData] = await Promise.all([
                    getUserById(id),
                    getRoles(),
                ])

                if (isMounted) {
                    setTargetUser(userData)
                    setRoles(rolesData)
                }
            } catch (err) {
                if (isMounted) {
                    const backendErr = err as BackendErrorResponse
                    setError(backendErr.message)
                }
            } finally {
                if (isMounted) {
                    setIsScreenLoading(false)
                }
            }
        }

        fetchData().then()

        return () => {
            isMounted = false
        }
    }, [id, getUserById, getRoles])

    // Authorization Guard Check
    const canReadUser = hasPermission(user, PermissionsEnum.USER, 'canRead')
    const canWriteUser = hasPermission(user, PermissionsEnum.USER, 'canWrite')

    // Early Termination
    if (isLoadingProfile || isScreenLoading) {
        return <Loading />
    }

    if (!targetUser || !canReadUser) {
        return null
    }

    // Event Handlers
    const handleStartEditing = () => {
        if (!canWriteUser) return
        setError(null)
        if (targetUser) {
            setUsername(targetUser.username)
            setRoleId(targetUser.role?._id || '')
            setFullNameEn(targetUser.fullNameEn || '')
            setFullNameAr(targetUser.fullNameAr || '')
            setSpecializationEn(targetUser.specializationEn || '')
            setSpecializationAr(targetUser.specializationAr || '')
            setImageUrl(targetUser.imageUrl || '')
        }
        setIsEditing(true)
    }

    const handleCancelEditing = () => {
        setIsEditing(false)
        setError(null)
    }

    const handleSaveChanges = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!canWriteUser) return
        setError(null)
        setIsSaving(true)

        try {
            const updatedPayload: UpdateUserRequest = {
                username: username.trim(),
                fullNameEn: fullNameEn.trim() || undefined,
                fullNameAr: fullNameAr.trim() || undefined,
                specializationEn: specializationEn.trim() || undefined,
                specializationAr: specializationAr.trim() || undefined,
                imageUrl: imageUrl.trim() || undefined,
            }

            let refreshedData = await updateUser(id, updatedPayload)

            if (roleId && roleId !== targetUser.role?._id) {
                if (updateUserRole) {
                    refreshedData = await updateUserRole(id, { roleId })
                }
            }

            setTargetUser(refreshedData)
            setToast({ message: t('updateSuccess'), type: StatusEnum.SUCCESS })
            setIsEditing(false)
        } catch (err) {
            const backendErr = err as BackendErrorResponse
            setError(backendErr.message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteUser = async () => {
        if (!canWriteUser) return
        if (!window.confirm(t('confirmDelete'))) return

        setError(null)
        setIsDeleting(true)
        try {
            await deleteUser(id)
            router.push('/admin')
        } catch (err) {
            const backendErr = err as BackendErrorResponse
            setError(backendErr.message)
            setIsDeleting(false)
        }
    }

    return (
        <PageContainer id='user-details-page'>
            <PageHeader
                title={t('sectionTitle')}
                subtitle={`${tTech('id')}: ${targetUser._id}`}
                Icon={FaUserCircle}
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
                        hideControls={!canWriteUser}
                        onStartEditAction={handleStartEditing}
                        onCancelEditAction={handleCancelEditing}
                        onDeleteAction={handleDeleteUser}
                    />

                    <FieldsGrid>
                        {/* Username */}
                        <DataDisplayBlock
                            label={t('username')}
                            isEditing={isEditing}
                            viewValue={targetUser.username}
                            editInput={
                                <Input
                                    value={username}
                                    onChangeAction={(val) => setUsername(val)}
                                    placeholder={t('usernamePlaceholder')}
                                    disabled={isSaving}
                                    type='text'
                                />
                            }
                        />

                        {/* Assigned Role */}
                        <DataDisplayBlock
                            label={t('role')}
                            isEditing={isEditing}
                            viewValue={targetUser.role?.roleName}
                            editInput={
                                <Select
                                    id='roleId'
                                    value={roleId}
                                    onChangeAction={(val) => setRoleId(val)}
                                    disabled={isSaving}
                                    required
                                    options={roles.map((role) => ({
                                        value: role._id,
                                        label: role.roleName,
                                    }))}
                                />
                            }
                        />

                        {/* Full Name (English) */}
                        <DataDisplayBlock
                            label={t('fullNameEn')}
                            isEditing={isEditing}
                            viewValue={targetUser.fullNameEn}
                            editInput={
                                <Input
                                    value={fullNameEn}
                                    onChangeAction={(val) => setFullNameEn(val)}
                                    placeholder={t('fullNameEnPlaceholder')}
                                    disabled={isSaving}
                                    type='text'
                                />
                            }
                        />

                        {/* Full Name (Arabic) */}
                        <DataDisplayBlock
                            label={t('fullNameAr')}
                            isEditing={isEditing}
                            viewValue={targetUser.fullNameAr}
                            editInput={
                                <Input
                                    value={fullNameAr}
                                    onChangeAction={(val) => setFullNameAr(val)}
                                    placeholder={t('fullNameArPlaceholder')}
                                    disabled={isSaving}
                                    type='text'
                                />
                            }
                        />

                        {/* Specialization (English) */}
                        <DataDisplayBlock
                            label={t('specializationEn')}
                            isEditing={isEditing}
                            viewValue={targetUser.specializationEn}
                            editInput={
                                <Input
                                    value={specializationEn}
                                    onChangeAction={(val) =>
                                        setSpecializationEn(val)
                                    }
                                    placeholder={t(
                                        'specializationEnPlaceholder'
                                    )}
                                    disabled={isSaving}
                                    type='text'
                                />
                            }
                        />

                        {/* Specialization (Arabic) */}
                        <DataDisplayBlock
                            label={t('specializationAr')}
                            isEditing={isEditing}
                            viewValue={targetUser.specializationAr}
                            editInput={
                                <Input
                                    value={specializationAr}
                                    onChangeAction={(val) =>
                                        setSpecializationAr(val)
                                    }
                                    placeholder={t(
                                        'specializationArPlaceholder'
                                    )}
                                    disabled={isSaving}
                                    type='text'
                                />
                            }
                        />

                        {/* Profile Image URL */}
                        <DataDisplayBlock
                            label={t('imageUrl')}
                            isEditing={isEditing}
                            fullWidth
                            viewValue={targetUser.imageUrl}
                            editInput={
                                <Input
                                    value={imageUrl}
                                    onChangeAction={(val) => setImageUrl(val)}
                                    placeholder={t('imageUrlPlaceholder')}
                                    disabled={isSaving}
                                    type='text'
                                />
                            }
                        />

                        {/* System Audits */}
                        <DataDisplayBlock
                            label={tTech('createdAt')}
                            isLocked
                            viewValue={formatTimestamp(
                                locale,
                                targetUser.createdAt,
                                'relative'
                            )}
                        />

                        <DataDisplayBlock
                            label={tTech('updatedAt')}
                            isLocked
                            viewValue={formatTimestamp(
                                locale,
                                targetUser.updatedAt,
                                'relative'
                            )}
                        />
                    </FieldsGrid>

                    <FormBoundaryActions
                        position='bottom'
                        isEditing={isEditing}
                        isSaving={isSaving}
                        hideControls={!canWriteUser}
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
