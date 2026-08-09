'use client'

// Core
import { ChangeEvent } from 'react'
// Components
import ErrorMessages from '@/src/components/UiRelated/ErrorMessages'
// Functions
import { renderClasses } from '@/src/utils/functions'
// Types
import { TextAreaProps } from '@/src/types/props.type'
// Style
import '@/src/styles/components/UiRelated/TextArea.css'

export default function TextArea({
    label,
    error,
    onChangeAction,
    id,
    Icon,
    rows = 4,
    ...props
}: TextAreaProps) {
    const textAreaId = id || props.name

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        onChangeAction(e.target.value)
    }

    return (
        <div className='textarea-container'>
            {label && (
                <label
                    htmlFor={textAreaId}
                    className={renderClasses(
                        'textarea-label',
                        error && 'textarea-label-error'
                    )}
                >
                    {label}
                </label>
            )}

            <div className='textarea-field-wrapper'>
                <textarea
                    id={textAreaId}
                    rows={rows}
                    {...props}
                    onChange={handleChange}
                    className={renderClasses(
                        'textarea-box',
                        Icon && 'textarea-box-with-icon',
                        error && 'textarea-error',
                        props.className
                    )}
                />

                {Icon && (
                    <div
                        className='textarea-end-icon-container pointer-events-none'
                        aria-hidden='true'
                    >
                        <Icon className='textarea-icon' />
                    </div>
                )}
            </div>

            {error && <ErrorMessages messages={error} variant='textOnly' />}
        </div>
    )
}
