'use client'

// Core
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { SubmitEvent, useState, useRef, ChangeEvent } from 'react'
import { FiLock } from 'react-icons/fi'
import { FaPencil } from 'react-icons/fa6'
// Components
import RoleChip from '@/src/components/UiRelated/RoleChip'
import Button from '@/src/components/UiRelated/Button'
import Input from '@/src/components/UiRelated/Input'
import PopupMessage from '@/src/components/UiRelated/PopupMessage'
import ErrorMessages from '@/src/components/UiRelated/ErrorMessages'
import Loading from '@/src/components/UiRelated/Loading'
import ContentSection from '@/src/components/PagesRelated/ContentSection'
import FormBoundaryActions from '@/src/components/PagesRelated/FormBoundaryActions'
import DataDisplayBlock from '@/src/components/PagesRelated/DataDisplayBlock'
import FieldsGrid from '@/src/components/ContainerRelated/FieldsGrid'
import PageContainer from '@/src/components/ContainerRelated/PageContainer'
// Enums
import { RolesEnum } from '@/src/enums/roles-permissions.enum'
import { StatusEnum } from '@/src/enums/ui.enum'
// Functions
import {
    displayUserFullName,
    formatTimestamp,
    stripHonorifics,
    userFullNameInitials,
} from '@/src/utils/functions'
// Hooks
import { useUser } from '@/src/providers/UserProvider'
// Types
import { LocaleType } from '@/src/types/i18n.type'
import { BackendErrorResponse } from '@/src/types/backend/backend.responses.type'
// Style
import '@/src/styles/pages/(root)/profile/page.css'

export default function ProfilePage() {
    // Translations
    const t = useTranslations('ProfilePage')
    const tPages = useTranslations('Pages')
    const tRoles = useTranslations('RolesEnum')
    const tTech = useTranslations('SystemTechTerms')

    // From Providers
    const locale = useLocale() as LocaleType
    const { user, isLoadingProfile, updateMe, updateMyAvatar } = useUser()

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Page States
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | string[] | null>(null)
    const [toast, setToast] = useState<{
        message: string | string[]
        type: StatusEnum
    } | null>(null)

    // User States
    const [fullNameEn, setFullNameEn] = useState(user?.fullNameEn || '')
    const [fullNameAr, setFullNameAr] = useState(user?.fullNameAr || '')
    const [username, setUsername] = useState(user?.username || '')
    const [specializationEn, setSpecializationEn] = useState(
        user?.specializationEn || ''
    )
    const [specializationAr, setSpecializationAr] = useState(
        user?.specializationAr || ''
    )

    // Early Termination
    if (isLoadingProfile) {
        return <Loading />
    }

    // Variables
    const displayName = displayUserFullName(user, locale)
    const userInitials = userFullNameInitials(stripHonorifics(displayName))

    // Event Handlers
    const handleStartEditing = () => {
        setError(null)
        if (user) {
            setUsername(user?.username || '')
            setFullNameEn(user?.fullNameEn || '')
            setFullNameAr(user?.fullNameAr || '')
            setSpecializationEn(user?.specializationEn || '')
            setSpecializationAr(user?.specializationAr || '')
        }
        setIsEditing(true)
    }

    const handleCancelEditing = () => {
        setIsEditing(false)
        setError(null)
    }

    const handleAvatarClick = () => {
        if (isSaving) return
        fileInputRef.current?.click()
    }

    const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setError(null)
        setIsSaving(true)

        try {
            if (updateMyAvatar) {
                await updateMyAvatar(file)
                setToast({
                    message: t('updateSuccess'),
                    type: StatusEnum.SUCCESS,
                })
            }
        } catch (err) {
            const backendErr = err as BackendErrorResponse
            setError(backendErr.message)
        } finally {
            setIsSaving(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleSaveChanges = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        setIsSaving(true)

        try {
            if (updateMe) {
                const updatedPayload: Record<string, string> = {}

                if (username.trim()) updatedPayload.username = username.trim()
                if (fullNameEn.trim())
                    updatedPayload.fullNameEn = fullNameEn.trim()
                if (fullNameAr.trim())
                    updatedPayload.fullNameAr = fullNameAr.trim()
                if (specializationEn.trim())
                    updatedPayload.specializationEn = specializationEn.trim()
                if (specializationAr.trim())
                    updatedPayload.specializationAr = specializationAr.trim()

                await updateMe(updatedPayload)
            }

            setToast({ message: t('updateSuccess'), type: StatusEnum.SUCCESS })
            setIsEditing(false)
        } catch (err) {
            const backendErr = err as BackendErrorResponse
            setError(backendErr.message)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <PageContainer id='profile-page'>
            {/* Profile Header */}
            <header className='profile-header-card'>
                <div className='profile-main-identity'>
                    <input
                        type='file'
                        ref={fileInputRef}
                        onChange={handleAvatarChange}
                        accept='image/png, image/jpeg, image/jpg, image/webp'
                        className='hidden'
                        disabled={isSaving}
                    />

                    <div
                        className={`profile-avatar-wrapper group ${isSaving ? 'opacity-70 pointer-events-none' : 'cursor-pointer'}`}
                        onClick={handleAvatarClick}
                    >
                        {user?.imageUrl ? (
                            <Image
                                src={user.imageUrl}
                                alt={displayName}
                                width={160}
                                height={160}
                                className='profile-avatar-img'
                                priority
                            />
                        ) : (
                            <span>{userInitials}</span>
                        )}

                        <div className='profile-avatar-overlay'>
                            <FaPencil className='profile-avatar-overlay-icon' />
                        </div>
                    </div>

                    <div className='profile-identity-details'>
                        <h1 className='profile-name'>{displayName}</h1>
                        {user?.username && (
                            <p className='profile-username'>@{user.username}</p>
                        )}
                        {user?.role?.roleName && (
                            <div className='profile-role-badge-zone'>
                                <RoleChip
                                    role={user.role.roleName as RolesEnum}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {error && <ErrorMessages messages={error} />}

            {/* User Form */}
            <form onSubmit={handleSaveChanges}>
                <ContentSection>
                    <FormBoundaryActions
                        title={t('sectionTitle')}
                        position='top'
                        isEditing={isEditing}
                        isSaving={isSaving}
                        onStartEditAction={handleStartEditing}
                        onCancelEditAction={handleCancelEditing}
                    />

                    <FieldsGrid>
                        <DataDisplayBlock
                            label={t('fullNameEn')}
                            isEditing={isEditing}
                            viewValue={user?.fullNameEn}
                            editInput={
                                <Input
                                    value={fullNameEn}
                                    onChangeAction={(val) => setFullNameEn(val)}
                                    placeholder={t('fullNameEnPlaceholder')}
                                    disabled={isSaving}
                                />
                            }
                        />

                        <DataDisplayBlock
                            label={t('fullNameAr')}
                            isEditing={isEditing}
                            viewValue={user?.fullNameAr}
                            editInput={
                                <Input
                                    value={fullNameAr}
                                    onChangeAction={(val) => setFullNameAr(val)}
                                    placeholder={t('fullNameArPlaceholder')}
                                    disabled={isSaving}
                                />
                            }
                        />

                        <DataDisplayBlock
                            label={t('username')}
                            isEditing={isEditing}
                            viewValue={user?.username}
                            editInput={
                                <Input
                                    value={username}
                                    onChangeAction={(val) => setUsername(val)}
                                    placeholder={t('usernamePlaceholder')}
                                    required
                                    disabled={isSaving}
                                />
                            }
                        />

                        <DataDisplayBlock
                            label={t('specializationEn')}
                            isEditing={isEditing}
                            viewValue={user?.specializationEn}
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
                                />
                            }
                        />

                        <DataDisplayBlock
                            label={t('specializationAr')}
                            isEditing={isEditing}
                            viewValue={user?.specializationAr}
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
                                />
                            }
                        />

                        <DataDisplayBlock
                            label={t('role')}
                            isLocked
                            viewValue={
                                user?.role?.roleName &&
                                tRoles(user?.role?.roleName)
                            }
                        />

                        <DataDisplayBlock
                            label={tTech('createdAt')}
                            isLocked
                            viewValue={formatTimestamp(
                                locale as LocaleType,
                                user?.createdAt
                            )}
                        />

                        <DataDisplayBlock
                            label={tTech('updatedAt')}
                            isLocked
                            viewValue={formatTimestamp(
                                locale as LocaleType,
                                user?.updatedAt
                            )}
                        />
                    </FieldsGrid>

                    <FormBoundaryActions
                        position='bottom'
                        isEditing={isEditing}
                        isSaving={isSaving}
                        onStartEditAction={handleStartEditing}
                        onCancelEditAction={handleCancelEditing}
                    />

                    {!isEditing && (
                        <div className='profile-custom-actions-zone'>
                            <Button
                                href='/change-password'
                                variant='normal-dark'
                                fullWidth
                                Icon={FiLock}
                                label={tPages('changePassword')}
                            />
                        </div>
                    )}
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
