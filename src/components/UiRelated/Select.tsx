'use client'

// Core
import { useState, useRef, useEffect } from 'react'
import { FiChevronDown, FiSearch, FiCheck } from 'react-icons/fi'
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
    variant = 'basic',
    onChangeAction,
    id,
    value,
    defaultValue,
    disabled,
    ...props
}: SelectProps) {
    const selectId = id || props.name

    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [internalValue, setInternalValue] = useState<string | number>(
        (defaultValue as string | number) ?? ''
    )
    const dropdownRef = useRef<HTMLDivElement>(null)

    const selectedValue =
        value !== undefined ? (value as string | number) : internalValue

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () =>
            document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleCustomSelect = (optionValue: string | number) => {
        setInternalValue(optionValue)
        onChangeAction(String(optionValue))
        setIsOpen(false)
        setSearchTerm('')
    }

    const filteredOptions = options.filter((option) =>
        variant === 'searchable'
            ? option.label.toLowerCase().includes(searchTerm.toLowerCase())
            : true
    )

    const selectedOption = options.find((opt) => opt.value === selectedValue)

    return (
        <div className='select-container' ref={dropdownRef}>
            {label && (
                <label
                    htmlFor={selectId}
                    className='select-label'
                    onClick={() => !disabled && setIsOpen((prev) => !prev)}
                >
                    {label}
                </label>
            )}

            <div className='select-field-wrapper'>
                <button
                    type='button'
                    id={selectId}
                    disabled={disabled}
                    onClick={() => setIsOpen((prev) => !prev)}
                    className={renderClasses(
                        'select-trigger',
                        isOpen ? 'is-open' : '',
                        props.className
                    )}
                >
                    <span
                        className={renderClasses(
                            'select-trigger-text',
                            !selectedOption ? 'placeholder' : ''
                        )}
                    >
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <FiChevronDown
                        className={renderClasses(
                            'select-icon',
                            isOpen ? 'rotate-180' : ''
                        )}
                    />
                </button>

                {isOpen && !disabled && (
                    <div className='select-dropdown-menu'>
                        {variant === 'searchable' && (
                            <div className='select-search-wrapper'>
                                <FiSearch className='select-search-icon' />
                                <input
                                    type='text'
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className='select-search-input'
                                    autoFocus
                                />
                            </div>
                        )}

                        <ul className='select-options-list' role='listbox'>
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option) => (
                                    <li
                                        key={option.value}
                                        role='option'
                                        aria-selected={
                                            option.value === selectedValue
                                        }
                                        onClick={() =>
                                            handleCustomSelect(option.value)
                                        }
                                        className={renderClasses(
                                            'select-option-item',
                                            option.value === selectedValue
                                                ? 'selected'
                                                : ''
                                        )}
                                    >
                                        <span>{option.label}</span>
                                        {option.value === selectedValue && (
                                            <FiCheck className='select-check-icon' />
                                        )}
                                    </li>
                                ))
                            ) : (
                                <li className='select-no-options'>
                                    No results found
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    )
}
