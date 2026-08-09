'use client'

// Components
import PageContainer from '@/src/components/ContainerRelated/PageContainer'
import ErrorMessages from '@/src/components/UiRelated/ErrorMessages'
// Types
import { AuthLayoutShellProps } from '@/src/types/props.type'
// Style
import '@/src/styles/components/PagesRelated/AuthLayoutShell.css'

export default function AuthLayoutShell({
    id,
    titleNode,
    subtitle,
    error,
    onSubmitAction,
    children,
}: AuthLayoutShellProps) {
    return (
        <PageContainer fullHeight centerContent id={id}>
            <div className='auth-card-container'>
                <header className='auth-card-header'>
                    <h1 className='auth-card-title'>{titleNode}</h1>
                    <p className='auth-card-subtitle'>{subtitle}</p>
                </header>

                <form onSubmit={onSubmitAction} className='auth-card-form'>
                    {error && <ErrorMessages messages={error} />}
                    {children}
                </form>
            </div>
        </PageContainer>
    )
}
