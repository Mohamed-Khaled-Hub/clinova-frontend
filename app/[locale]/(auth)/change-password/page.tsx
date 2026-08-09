'use client'

// Core
import { useTranslations } from 'next-intl'
import { useState, SubmitEvent } from 'react'
import { useRouter } from '@/src/i18n/routing'
// Enums
import { StatusEnum } from '@/src/enums/ui.enum'
// Components
import Input from '@/src/components/UiRelated/Input'
import Button from '@/src/components/UiRelated/Button'
import PopupMessage from '@/src/components/UiRelated/PopupMessage'
import AuthLayoutShell from '@/src/components/PagesRelated/AuthLayoutShell'
// Hooks
import { useAuth } from '@/src/providers/AuthProvider'
// Types
import { BackendErrorResponse } from '@/src/types/backend/backend.responses.type'
// Style
import '@/src/styles/pages/(auth)/change-password/page.css'

export default function ChangePasswordPage() {
    // Translations
    const t = useTranslations('ChangePasswordPage')

    // From Providers
    const router = useRouter()
    const { changePassword } = useAuth()

    // Page States
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState<string | string[] | null>(null)
    const [toast, setToast] = useState<{
        message: string | string[]
        type: StatusEnum
    } | null>(null)

    // Change Password States
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    // Variables
    const isFormDisabled = isLoading || isSuccess

    // Event Handlers
    const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)

        if (newPassword !== confirmPassword) {
            setError(t('matchError'))
            return
        }

        setIsLoading(true)
        try {
            await changePassword({ oldPassword: currentPassword, newPassword })
            setIsSuccess(true)
            setToast({
                message: t('successMessage'),
                type: StatusEnum.SUCCESS,
            })
        } catch (err) {
            const backendErr = err as BackendErrorResponse
            setError(backendErr.message)
            setIsLoading(false)
        }
    }

    const handlePopupClose = () => {
        setToast(null)
        if (isSuccess) {
            router.push('/profile')
        }
    }

    return (
        <>
            <AuthLayoutShell
                id='change-password-page'
                titleNode={t('title')}
                subtitle={t('subtitle')}
                error={error}
                onSubmitAction={handleSubmit}
            >
                <Input
                    label={t('currentPassword')}
                    type='password'
                    value={currentPassword}
                    onChangeAction={(val) => setCurrentPassword(val)}
                    placeholder={t('currentPasswordPlaceholder')}
                    required
                    disabled={isFormDisabled}
                />

                <Input
                    label={t('newPassword')}
                    type='password'
                    value={newPassword}
                    onChangeAction={(val) => setNewPassword(val)}
                    placeholder={t('newPasswordPlaceholder')}
                    required
                    disabled={isFormDisabled}
                />

                <Input
                    label={t('confirmPassword')}
                    type='password'
                    value={confirmPassword}
                    onChangeAction={(val) => setConfirmPassword(val)}
                    placeholder={t('confirmPasswordPlaceholder')}
                    required
                    disabled={isFormDisabled}
                />

                <Button
                    label={isLoading ? t('submitting') : t('submit')}
                    variant='normal-dark'
                    fullWidth
                    type='submit'
                    disabled={isFormDisabled}
                />
            </AuthLayoutShell>

            {toast && (
                <PopupMessage
                    message={toast.message}
                    type={toast.type}
                    onCloseAction={handlePopupClose}
                />
            )}
        </>
    )
}
