'use client'

// Core
import { useState, useEffect, SubmitEvent } from 'react'
import { FaUserPlus } from 'react-icons/fa'
import { useRouter } from '@/src/i18n/routing'
import { useTranslations } from 'next-intl'
// Components
import Input from '@/src/components/UiRelated/Input'
import Select from '@/src/components/UiRelated/Select'
import Loading from '@/src/components/UiRelated/Loading'
import PageHeader from '@/src/components/PagesRelated/PageHeader'
import PopupMessage from '@/src/components/UiRelated/PopupMessage'
import FormControl from '@/src/components/PagesRelated/FormControl'
import ErrorMessages from '@/src/components/UiRelated/ErrorMessages'
import FormFieldSet from '@/src/components/PagesRelated/FormFieldSet'
import PageContainer from '@/src/components/ContainerRelated/PageContainer'
import FormBoundaryActions from '@/src/components/PagesRelated/FormBoundaryActions'
// Enums
import { PermissionsEnum } from '@/src/enums/roles-permissions.enum'
import { StatusEnum } from '@/src/enums/ui.enum'
// Functions
import { hasPermission } from '@/src/utils/functions'
// Hooks
import { useUser } from '@/src/providers/UserProvider'
import { useRole } from '@/src/providers/RoleProvider'
// Types
import { CreateUserRequest } from '@/src/types/backend/backend.requests.type'
import {
    RoleResponse,
    BackendErrorResponse,
} from '@/src/types/backend/backend.responses.type'
// Style
import '@/src/styles/pages/(root)/admin/users/create/page.css'

export default function CreateUserPage() {
    // Translations
    const t = useTranslations('CreateUserPage')

    // From Providers
    const router = useRouter()
    const { createUser, user, isLoadingProfile } = useUser()
    const { getRoles } = useRole()

    // Roles States
    const [roles, setRoles] = useState<RoleResponse[]>([])
    const [isLoadingRoles, setIsLoadingRoles] = useState<boolean>(true)

    // Page States
    const [isSuccess, setIsSuccess] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formError, setFormError] = useState<string | string[] | null>(null)
    const [toast, setToast] = useState<{
        message: string
        type: StatusEnum
    } | null>(null)

    // User State
    const [formData, setFormData] = useState<CreateUserRequest>({
        username: '',
        password: '',
        roleId:
            !isLoadingRoles && roles && roles.length > 0 ? roles[0]._id : '',
        fullNameEn: '',
        fullNameAr: '',
        specializationEn: '',
        specializationAr: '',
        customFields: {},
    })

    // Authorization Guard Check
    const canWriteUser = hasPermission(user, PermissionsEnum.USER, 'canWrite')

    // Get Roles
    useEffect(() => {
        let isMounted = true

        const fetchRolesData = async () => {
            try {
                setIsLoadingRoles(true)
                const data = await getRoles()
                if (isMounted && data) {
                    setRoles(data)
                    if (data.length > 0) {
                        setFormData((prev) => ({
                            ...prev,
                            roleId: prev.roleId || data[0]._id,
                        }))
                    }
                }
            } catch (err) {
                const backendErr = err as BackendErrorResponse
                if (isMounted) {
                    setFormError(backendErr.message)
                }
            } finally {
                if (isMounted) {
                    setIsLoadingRoles(false)
                }
            }
        }

        fetchRolesData().then()

        return () => {
            isMounted = false
        }
    }, [getRoles])

    // Early Termination
    if (isLoadingProfile || isLoadingRoles) {
        return <Loading />
    }

    if (!canWriteUser) {
        return null
    }

    // Event Handlers
    const updateFormField = <K extends keyof CreateUserRequest>(
        fieldName: K,
        value: CreateUserRequest[K]
    ) => {
        setFormData((prev) => ({ ...prev, [fieldName]: value }))
    }

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault()
        setFormError(null)
        setIsSubmitting(true)

        const payload = { ...formData }

        const optionalKeys: (keyof CreateUserRequest)[] = [
            'fullNameEn',
            'fullNameAr',
            'specializationEn',
            'specializationAr',
        ]

        optionalKeys.forEach((key) => {
            const value = payload[key]
            if (typeof value === 'string' && !value.trim()) {
                delete payload[key]
            }
        })

        try {
            await createUser(payload)
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
        <PageContainer className='!max-w-5xl' id='create-user-container'>
            <PageHeader
                title={t('title')}
                subtitle={t('subtitle')}
                Icon={FaUserPlus}
            />

            {formError && <ErrorMessages messages={formError} />}

            <form onSubmit={handleSubmit} className='user-form-element'>
                <FormFieldSet legend={t('accountCredentials')} columns={3}>
                    <FormControl id='username' label={t('username')} required>
                        <Input
                            id='username'
                            type='text'
                            value={formData.username}
                            onChangeAction={(val) =>
                                updateFormField('username', val)
                            }
                            placeholder={t('usernamePlaceholder')}
                            disabled={isSubmitting}
                            required
                        />
                    </FormControl>

                    <FormControl id='password' label={t('password')} required>
                        <Input
                            id='password'
                            type='password'
                            value={formData.password}
                            onChangeAction={(val) =>
                                updateFormField('password', val)
                            }
                            placeholder={t('passwordPlaceholder')}
                            disabled={isSubmitting}
                            required
                        />
                    </FormControl>

                    <FormControl id='roleId' label={t('role')} required>
                        <Select
                            id='roleId'
                            value={formData.roleId}
                            onChangeAction={(val) =>
                                updateFormField('roleId', val)
                            }
                            disabled={isSubmitting}
                            required
                            options={(roles || []).map((role) => ({
                                value: role._id,
                                label: role.roleName,
                            }))}
                        />
                    </FormControl>
                </FormFieldSet>

                <FormFieldSet legend={t('profileIdentity')} columns={2}>
                    <FormControl id='fullNameEn' label={t('fullNameEn')}>
                        <Input
                            id='fullNameEn'
                            type='text'
                            value={formData.fullNameEn || ''}
                            onChangeAction={(val) =>
                                updateFormField('fullNameEn', val)
                            }
                            placeholder={t('fullNameEnPlaceholder')}
                            disabled={isSubmitting}
                        />
                    </FormControl>

                    <FormControl id='fullNameAr' label={t('fullNameAr')}>
                        <Input
                            id='fullNameAr'
                            type='text'
                            value={formData.fullNameAr || ''}
                            onChangeAction={(val) =>
                                updateFormField('fullNameAr', val)
                            }
                            placeholder={t('fullNameArPlaceholder')}
                            disabled={isSubmitting}
                        />
                    </FormControl>
                </FormFieldSet>

                <FormFieldSet legend={t('clinicalSpecialization')} columns={2}>
                    <FormControl
                        id='specializationEn'
                        label={t('specializationEn')}
                    >
                        <Input
                            id='specializationEn'
                            type='text'
                            value={formData.specializationEn || ''}
                            onChangeAction={(val) =>
                                updateFormField('specializationEn', val)
                            }
                            placeholder={t('specializationEnPlaceholder')}
                            disabled={isSubmitting}
                        />
                    </FormControl>

                    <FormControl
                        id='specializationAr'
                        label={t('specializationAr')}
                    >
                        <Input
                            id='specializationAr'
                            type='text'
                            value={formData.specializationAr || ''}
                            onChangeAction={(val) =>
                                updateFormField('specializationAr', val)
                            }
                            placeholder={t('specializationArPlaceholder')}
                            disabled={isSubmitting}
                        />
                    </FormControl>
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
