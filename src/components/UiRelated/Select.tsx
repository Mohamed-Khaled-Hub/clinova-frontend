'use client'

// Core
import { ChangeEvent } from 'react'
import { FiChevronDown } from 'react-icons/fi'
// Functions
import { renderClasses } from '@/src/utils/functions'
// Types
import { SelectProps } from '@/src/types/props.type'
// Style
import '@/src/styles/components/UiRelated/Select.css'

export default function Select({
    label,
    options = [],
    placeholder,
    onChangeAction,
    id,
    ...props
}: SelectProps) {
    const selectId = id || props.name

    const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
        onChangeAction(e.target.value)
        e.target.blur()
    }

    return (
        <div className='select-container'>
            {label && (
                <label htmlFor={selectId} className='select-label'>
                    {label}
                </label>
            )}

            <div className='select-field-wrapper'>
                <select
                    id={selectId}
                    {...props}
                    onChange={handleChange}
                    className={renderClasses('select-box', props.className)}
                >
                    {placeholder && (
                        <option value='' disabled hidden>
                            {placeholder}
                        </option>
                    )}

                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                <div className='select-end-icon-container' aria-hidden='true'>
                    <FiChevronDown className='select-icon' />
                </div>
            </div>
        </div>
    )
}
