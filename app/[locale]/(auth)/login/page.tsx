'use client'

// Core
import { useTranslations } from 'next-intl'
import { useState, SubmitEvent } from 'react'
// Components
import Input from '@/src/components/UiRelated/Input'
import Logo from '@/src/components/UiRelated/Logo'
import Button from '@/src/components/UiRelated/Button'
import AuthLayoutShell from '@/src/components/PagesRelated/AuthLayoutShell'
// Hooks
import { useAuth } from '@/src/providers/AuthProvider'
// Types
import { BackendErrorResponse } from '@/src/types/backend/backend.responses.type'
// Style
import '@/src/styles/pages/(auth)/login/page.css'

export default function LoginPage() {
    // Translations
    const t = useTranslations('LoginPage')

    // From Providers
    const { login } = useAuth()

    // Page States
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | string[] | null>(null)

    // Login States
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    // Event Handlers
    const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        setIsLoading(true)

        try {
            await login({ username, password })
        } catch (err) {
            const backendErr = err as BackendErrorResponse
            setError(backendErr.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AuthLayoutShell
            id='login-page'
            titleNode={
                <>
                    {t('title')} <Logo />
                </>
            }
            subtitle={t('subtitle')}
            error={error}
            onSubmitAction={handleSubmit}
        >
            <Input
                label={t('username')}
                onChangeAction={(val) => setUsername(val)}
                type='text'
                value={username}
                placeholder={t('usernamePlaceholder')}
                required
                disabled={isLoading}
            />

            <Input
                label={t('password')}
                type='password'
                value={password}
                onChangeAction={(val) => setPassword(val)}
                placeholder={t('passwordPlaceholder')}
                required
                disabled={isLoading}
            />

            <Button
                label={isLoading ? t('submitting') : t('submit')}
                variant='normal-dark'
                fullWidth
                type='submit'
                disabled={isLoading}
            />
        </AuthLayoutShell>
    )
}
