'use client'

// Core
import { ChangeEvent } from 'react'
import { FiX } from 'react-icons/fi'
// Components
import ErrorMessages from '@/src/components/UiRelated/ErrorMessages'
// Functions
import { renderClasses } from '@/src/utils/functions'
// Types
import { ColorPickerProps } from '@/src/types/props.type'
// Style
import '@/src/styles/components/UiRelated/ColorPicker.css'

export default function ColorPicker({
    label,
    error,
    onChangeAction,
    id,
    value,
    disabled = false,
    ...props
}: ColorPickerProps) {
    const inputId = id || props.name

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChangeAction(e.target.value)
    }

    const handleClear = () => {
        onChangeAction(null)
    }

    return (
        <div className='color-picker-container'>
            {label && (
                <label
                    htmlFor={inputId}
                    className={renderClasses(
                        'color-picker-label',
                        error && 'color-picker-label-error'
                    )}
                >
                    {label}
                </label>
            )}

            <div className='color-picker-field-wrapper'>
                <div
                    className={renderClasses(
                        'color-picker-box',
                        error && 'color-picker-error',
                        disabled && 'color-picker-disabled',
                        props.className
                    )}
                >
                    <input
                        id={inputId}
                        type='color'
                        value={value || '#ffffff'}
                        onChange={handleChange}
                        disabled={disabled}
                        {...props}
                        className='color-picker-input'
                    />
                    <span className='color-picker-value-text'>
                        {value || 'No Color'}
                    </span>
                </div>

                {value && !disabled && (
                    <button
                        type='button'
                        className='color-picker-end-icon-container color-picker-clear-btn'
                        onClick={handleClear}
                        tabIndex={-1}
                        aria-label='Clear color'
                    >
                        <FiX className='color-picker-icon' />
                    </button>
                )}
            </div>

            {error && <ErrorMessages messages={error} variant='textOnly' />}
        </div>
    )
}
