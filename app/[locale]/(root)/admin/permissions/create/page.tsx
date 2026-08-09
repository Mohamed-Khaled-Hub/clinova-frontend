'use client'

// Core
import { useState } from 'react'
import { SubmitEvent } from 'react'
import { FaShieldAlt } from 'react-icons/fa'
import { useRouter } from '@/src/i18n/routing'
import { useTranslations } from 'next-intl'
// Components
import Input from '@/src/components/UiRelated/Input'
import Loading from '@/src/components/UiRelated/Loading'
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
import { usePermission } from '@/src/providers/PermissionProvider'
// Types
import { CreatePermissionRequest } from '@/src/types/backend/backend.requests.type'
import { BackendErrorResponse } from '@/src/types/backend/backend.responses.type'
// Style
import '@/src/styles/pages/(root)/admin/permissions/create/page.css'

export default function CreatePermissionPage() {
    // Translations
    const t = useTranslations('CreatePermissionPage')

    // From Providers
    const router = useRouter()
    const { createPermission } = usePermission()
    const { user, isLoadingProfile } = useUser()

    // Page States
    const [isSuccess, setIsSuccess] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formError, setFormError] = useState<string | string[] | null>(null)
    const [toast, setToast] = useState<{
        message: string
        type: StatusEnum
    } | null>(null)

    // Permission Form State
    const [formData, setFormData] = useState<CreatePermissionRequest>({
        permissionKey: '',
    })

    // Authorization Guard Check
    const canWritePermission = hasPermission(
        user,
        PermissionsEnum.PERMISSION,
        'canWrite'
    )

    // Early Termination
    if (isLoadingProfile) {
        return <Loading />
    }

    if (!canWritePermission) {
        return null
    }

    // Event Handlers
    const updateFormField = (value: string) => {
        setFormData({ permissionKey: value.trim() })
    }

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault()
        setFormError(null)
        setIsSubmitting(true)

        try {
            await createPermission(formData)
            setIsSuccess(true)
            setToast({
                message:
                    t('successMessage') ||
                    'System permission signature registered successfully.',
                type: StatusEnum.SUCCESS,
            })
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
        <PageContainer className='!max-w-5xl' id='create-permission-container'>
            <PageHeader
                title={t('title')}
                subtitle={t('subtitle')}
                Icon={FaShieldAlt}
            />

            {formError && <ErrorMessages messages={formError} />}

            <form onSubmit={handleSubmit} className='permission-form-element'>
                {/* Authorization Metadata */}
                <FormFieldSet legend={t('authorizationDetails')} columns={1}>
                    <FormControl
                        id='permissionKey'
                        label={t('permissionKey')}
                        required
                    >
                        <Input
                            id='permissionKey'
                            type='text'
                            value={formData.permissionKey}
                            onChangeAction={updateFormField}
                            placeholder={t('permissionKeyPlaceholder')}
                            disabled={isSubmitting}
                            required
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
