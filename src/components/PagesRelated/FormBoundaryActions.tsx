'use client'

// Core
import { useTranslations } from 'next-intl'
import { FiCheck, FiEdit2, FiX, FiTrash2 } from 'react-icons/fi'
// Components
import Button from '@/src/components/UiRelated/Button'
// Types
import { FormBoundaryActionsProps } from '@/src/types/props.type'
// Style
import '@/src/styles/components/PagesRelated/FormBoundaryActions.css'

export default function FormBoundaryActions({
    title,
    position,
    mode = 'edit',
    isEditing,
    isSaving,
    isDeleting = false,
    hideControls = false,
    onStartEditAction,
    onCancelEditAction,
    onCreateCancelAction,
    onDeleteAction,
}: FormBoundaryActionsProps) {
    const tActions = useTranslations('Actions')

    if (position === 'top') {
        return (
            <div className='form-top-trigger-row'>
                {title && <h2 className='form-section-heading'>{title}</h2>}

                {mode === 'edit' && !isEditing && !hideControls && (
                    <div className='form-top-actions-cluster'>
                        {onDeleteAction && (
                            <Button
                                label={tActions('delete')}
                                variant='destructive-light'
                                Icon={FiTrash2}
                                type='button'
                                onClick={onDeleteAction}
                                disabled={isDeleting}
                            />
                        )}
                        {onStartEditAction && (
                            <Button
                                label={tActions('edit')}
                                variant='normal-light'
                                Icon={FiEdit2}
                                type='button'
                                onClick={onStartEditAction}
                                disabled={isDeleting}
                            />
                        )}
                    </div>
                )}
            </div>
        )
    }

    if (mode === 'create') {
        return (
            <div className='form-actions-row'>
                <div className='form-actions-cluster'>
                    <Button
                        label={isSaving ? tActions('saving') : tActions('save')}
                        variant='normal-dark'
                        Icon={FiCheck}
                        type='submit'
                        disabled={isSaving}
                    />

                    {onCreateCancelAction && (
                        <Button
                            label={tActions('cancel')}
                            variant='normal-light'
                            Icon={FiX}
                            type='button'
                            onClick={onCreateCancelAction}
                            disabled={isSaving}
                        />
                    )}
                </div>
            </div>
        )
    }

    if (!isEditing || hideControls) return null

    return (
        <div className='form-actions-row'>
            <div className='form-actions-cluster'>
                <Button
                    label={isSaving ? tActions('saving') : tActions('save')}
                    variant='normal-dark'
                    Icon={FiCheck}
                    type='submit'
                    disabled={isSaving}
                />
                {onCancelEditAction && (
                    <Button
                        label={tActions('cancel')}
                        variant='normal-light'
                        Icon={FiX}
                        type='button'
                        onClick={onCancelEditAction}
                        disabled={isSaving}
                    />
                )}
            </div>
        </div>
    )
}
