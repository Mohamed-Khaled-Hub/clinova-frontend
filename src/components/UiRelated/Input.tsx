'use client'

// Core
import { useState, ChangeEvent } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
// Components
import ErrorMessages from '@/src/components/UiRelated/ErrorMessages'
// Functions
import { renderClasses } from '@/src/utils/functions'
// Types
import { InputProps } from '@/src/types/props.type'
// Style
import '@/src/styles/components/UiRelated/Input.css'

export default function Input({
    label,
    error,
    onChangeAction,
    id,
    type = 'text',
    Icon,
    ...props
}: InputProps) {
    const [showPassword, setShowPassword] = useState(false)
    const inputId = id || props.name

    const isPasswordType = type === 'password'
    const resolvedType = isPasswordType && showPassword ? 'text' : type

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChangeAction(e.target.value)
    }

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev)
    }

    return (
        <div className='input-container'>
            {label && (
                <label
                    htmlFor={inputId}
                    className={renderClasses(
                        'input-label',
                        error && 'input-label-error'
                    )}
                >
                    {label}
                </label>
            )}

            <div className='input-field-wrapper'>
                <input
                    id={inputId}
                    {...props}
                    type={resolvedType}
                    onChange={handleChange}
                    className={renderClasses(
                        'input-box',
                        (isPasswordType || !!Icon) && 'input-box-with-icon',
                        error && 'input-error',
                        props.className
                    )}
                />

                {isPasswordType && (
                    <button
                        type='button'
                        className='input-end-icon-container'
                        onClick={togglePasswordVisibility}
                        tabIndex={-1}
                        aria-label={
                            showPassword ? 'Hide password' : 'Show password'
                        }
                    >
                        {showPassword ? (
                            <FiEyeOff className='input-icon' />
                        ) : (
                            <FiEye className='input-icon' />
                        )}
                    </button>
                )}

                {!isPasswordType && Icon && (
                    <button
                        type='button'
                        className='input-end-icon-container pointer-events-none'
                        tabIndex={-1}
                        aria-hidden='true'
                    >
                        <Icon className='input-icon' />
                    </button>
                )}
            </div>

            {error && <ErrorMessages messages={error} variant='textOnly' />}
        </div>
    )
}
