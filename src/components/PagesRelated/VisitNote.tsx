'use client'

// Core
import { useState, useEffect, useRef } from 'react'
import { FiTrash2, FiLoader } from 'react-icons/fi'
import { useTranslations, useLocale } from 'next-intl'
// Components
import Input from '@/src/components/UiRelated/Input'
import Select from '@/src/components/UiRelated/Select'
import ColorPicker from '@/src/components/UiRelated/ColorPicker'
import Button from '@/src/components/UiRelated/Button'
import TextArea from '@/src/components/UiRelated/TextArea'
// Enums
import { NoteCategoryEnum } from '@/src/enums/schemas.enum'
// Hooks
import { useVisit } from '@/src/providers/VisitProvider'
// Types
import { VisitNoteProps } from '@/src/types/props.type'
// Style
import '@/src/styles/components/PagesRelated/VisitNote.css'

export default function VisitNote({
    index,
    note,
    isSubmitting,
    onNoteChangeAction,
    onRemoveNoteAction,
}: VisitNoteProps) {
    // Translations
    const t = useTranslations('VisitNoteComponent')
    const tNoteCategory = useTranslations('NoteCategoryEnum')

    // From Providers
    const locale = useLocale()
    const { getNotesSuggestions } = useVisit()

    // Local Autocomplete State
    const [suggestions, setSuggestions] = useState<string[]>([])
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const isUserTypingRef = useRef(false)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () =>
            document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        if (!isUserTypingRef.current) return

        const lines = note.noteText?.split('\n') || []
        const currentLineText = lines[lines.length - 1] || ''
        const queryText = currentLineText.trim()

        const skipCategoryFilter =
            note.category === NoteCategoryEnum.TODO ||
            note.category === NoteCategoryEnum.OTHER

        const currentCategory = skipCategoryFilter ? undefined : note.category

        const delayDebounceFn = setTimeout(async () => {
            if (!queryText) {
                setSuggestions([])
                setShowDropdown(false)
                setIsLoadingSuggestions(false)
                return
            }

            setIsLoadingSuggestions(true)

            try {
                const data = await getNotesSuggestions(
                    queryText,
                    currentCategory
                )
                setSuggestions(data)
                setShowDropdown(data.length > 0)
            } catch (error) {
                console.error('Failed to grab note suggestions:', error)
                setSuggestions([])
                setShowDropdown(false)
            } finally {
                setIsLoadingSuggestions(false)
                isUserTypingRef.current = false
            }
        }, 300)

        return () => clearTimeout(delayDebounceFn)
    }, [note.noteText, note.category, getNotesSuggestions])

    const handleTextChange = (val: string) => {
        isUserTypingRef.current = true
        onNoteChangeAction(index, 'noteText', val)
    }

    const handleSelectSuggestion = (suggestion: string) => {
        isUserTypingRef.current = false

        const lines = note.noteText?.split('\n') || []
        if (lines.length > 0) {
            lines[lines.length - 1] = suggestion
        } else {
            lines.push(suggestion)
        }

        onNoteChangeAction(index, 'noteText', lines.join('\n'))
        setShowDropdown(false)
    }

    return (
        <div className='visit-note-card'>
            <div className='visit-note-controls'>
                <div className='visit-note-controls-left'>
                    <div className='visit-note-select-wrapper'>
                        <Select
                            id={`note-category-${index}`}
                            value={note.category}
                            onChangeAction={(val) =>
                                onNoteChangeAction(index, 'category', val)
                            }
                            disabled={isSubmitting}
                            options={Object.values(NoteCategoryEnum).map(
                                (cat) => ({
                                    value: cat,
                                    label: tNoteCategory.has(cat)
                                        ? tNoteCategory(cat)
                                        : cat,
                                })
                            )}
                        />
                    </div>

                    <Input
                        type='date'
                        id={`note-date-${index}`}
                        value={note.contentDate || ''}
                        onChangeAction={(val) => {
                            onNoteChangeAction(
                                index,
                                'contentDate',
                                val === '' ? null : val
                            )
                        }}
                        disabled={isSubmitting}
                    />

                    <ColorPicker
                        id={`note-color-${index}`}
                        value={note.highlightColor}
                        onChangeAction={(val) =>
                            onNoteChangeAction(index, 'highlightColor', val)
                        }
                        disabled={isSubmitting}
                    />
                </div>

                <Button
                    Icon={FiTrash2}
                    variant='destructive-light'
                    type='button'
                    onClick={() => onRemoveNoteAction(index)}
                    disabled={isSubmitting}
                />
            </div>

            <div className='visit-note-textarea-wrapper' ref={dropdownRef}>
                <TextArea
                    id={`note-text-${index}`}
                    value={note.noteText}
                    onChangeAction={handleTextChange}
                    placeholder={t('noteTextPlaceholder')}
                    disabled={isSubmitting}
                    onFocus={() => {
                        if (suggestions.length > 0) setShowDropdown(true)
                    }}
                />

                {isLoadingSuggestions && (
                    <div className='visit-note-suggestions-loader'>
                        <FiLoader className='animate-spin' />
                    </div>
                )}

                {showDropdown && suggestions.length > 0 && (
                    <div
                        className='visit-note-suggestions-dropdown'
                        dir={locale === 'ar' ? 'rtl' : 'ltr'}
                    >
                        {suggestions.map((suggestion, idx) => (
                            <button
                                key={idx}
                                type='button'
                                className='visit-note-suggestion-item'
                                onClick={() =>
                                    handleSelectSuggestion(suggestion)
                                }
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
