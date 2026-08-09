'use client'

// Core
import { useState } from 'react'
import { Link } from '@/src/i18n/routing'
import { FiChevronDown } from 'react-icons/fi'
import { useLocale, useTranslations } from 'next-intl'
// Enums
import { NoteCategoryEnum } from '@/src/enums/schemas.enum'
// Functions
import { formatTimestamp } from '@/src/utils/functions'
// Types
import { LocaleType } from '@/src/types/i18n.type'
import { VisitsNotesViewListProps } from '@/src/types/props.type'
import { VisitResponse } from '@/src/types/backend/backend.responses.type'
// Style
import '@/src/styles/components/PagesRelated/VisitsNotesViewList.css'

export default function VisitsNotesViewList({
    visits,
    emptyMessage,
}: VisitsNotesViewListProps) {
    // Translations
    const t = useTranslations('VisitsNotesViewListComponent')
    const tNoteCategory = useTranslations('NoteCategoryEnum')

    // From Providers
    const locale = useLocale() as LocaleType

    // State to track expanded status per visit + category combo
    const [expandedGroups, setExpandedGroups] = useState<
        Record<string, boolean>
    >({})

    // Ensure we handle single objects if accidentally passed, normalize to array, and sort descending by date
    const visitsArray = (Array.isArray(visits) ? [...visits] : [visits]).sort(
        (a, b) => {
            const dateA = a.visitDate ? new Date(a.visitDate).getTime() : 0
            const dateB = b.visitDate ? new Date(b.visitDate).getTime() : 0
            return dateB - dateA
        }
    )

    // Calculate global notes count across all provided records
    const totalNotesCount = visitsArray.reduce(
        (acc, visitItem) => acc + (visitItem?.notes?.length || 0),
        0
    )

    if (visitsArray.length === 0 || totalNotesCount === 0) {
        return <p className='visit-notes-empty-msg'>{emptyMessage}</p>
    }

    const isSingleVisit = visitsArray.length === 1

    const toggleGroup = (visitKey: string, categoryKey: string) => {
        const compositeKey = `${visitKey}-${categoryKey}`
        setExpandedGroups((prev) => ({
            ...prev,
            [compositeKey]: !prev[compositeKey],
        }))
    }

    // Sub-render method for isolating category block maps
    const renderVisitContent = (visit: VisitResponse, visitIndex: number) => {
        const visitKey = visit._id || String(visitIndex)

        if (!visit.notes || visit.notes.length === 0) {
            return <p className='visit-notes-empty-msg'>{emptyMessage}</p>
        }

        return (
            <div className='visit-notes-view-list-inner'>
                {Object.values(NoteCategoryEnum).map((categoryKey) => {
                    const filteredNotes = (visit.notes || []).filter(
                        (noteItem) => noteItem.category === categoryKey
                    )

                    if (filteredNotes.length === 0) return null

                    const compositeKey = `${visitKey}-${categoryKey}`
                    // Defaulting to true so it stays expanded initially, change to false if you want them closed by default
                    const isExpanded = expandedGroups[compositeKey]

                    return (
                        <section
                            key={categoryKey}
                            className='visit-note-category-group'
                        >
                            <div
                                className='visit-note-category-header'
                                onClick={() =>
                                    toggleGroup(visitKey, categoryKey)
                                }
                            >
                                <h3 className='visit-note-category-title'>
                                    {tNoteCategory.has(categoryKey)
                                        ? tNoteCategory(categoryKey)
                                        : categoryKey}
                                </h3>
                                <button
                                    className={`visit-note-category-toggle-btn ${isExpanded ? 'is-active' : ''}`}
                                    aria-expanded={isExpanded}
                                    title={isExpanded ? 'Collapse' : 'Expand'}
                                >
                                    <FiChevronDown
                                        className='visit-note-toggle-icon'
                                        size={16}
                                    />
                                </button>
                            </div>

                            {isExpanded && (
                                <div className='visit-note-category-items'>
                                    {filteredNotes.map((noteItem, index) => (
                                        <div
                                            key={index}
                                            className='visit-note-row-item'
                                        >
                                            <div
                                                className='visit-note-row-indicator'
                                                style={
                                                    noteItem.highlightColor
                                                        ? {
                                                              backgroundColor:
                                                                  noteItem.highlightColor,
                                                          }
                                                        : {}
                                                }
                                            />

                                            <span
                                                className='visit-note-row-number'
                                                style={
                                                    noteItem.highlightColor
                                                        ? {
                                                              color: noteItem.highlightColor,
                                                          }
                                                        : {}
                                                }
                                            >
                                                {index + 1}.
                                            </span>

                                            <div className='visit-note-row-body'>
                                                <p
                                                    className='visit-note-row-text'
                                                    style={
                                                        noteItem.highlightColor
                                                            ? {
                                                                  color: noteItem.highlightColor,
                                                              }
                                                            : {}
                                                    }
                                                >
                                                    {noteItem.noteText}
                                                </p>

                                                {noteItem.contentDate && (
                                                    <span className='visit-note-row-date-wrapper'>
                                                        <span className='visit-note-row-date-label'>
                                                            {t(
                                                                'contentDateLabel'
                                                            )}
                                                            :
                                                        </span>{' '}
                                                        <span className='visit-note-row-date-value'>
                                                            {formatTimestamp(
                                                                locale,
                                                                noteItem.contentDate,
                                                                'dateOnly'
                                                            )}
                                                        </span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    )
                })}
            </div>
        )
    }

    // Render single visit natively without extra split containers
    if (isSingleVisit) {
        return (
            <div className='visit-notes-view-list'>
                {renderVisitContent(visitsArray[0], 0)}
            </div>
        )
    }

    // Multi-visit structural layout implementation
    return (
        <div className='visit-notes-view-list multi-visit-scroll-container'>
            {visitsArray.map((visitItem, index) => {
                const visitTitle = visitItem.visitDate
                    ? formatTimestamp(locale, visitItem.visitDate, 'dateOnly')
                    : `${t('visitLabel') || 'Visit'} #${index + 1}`

                return (
                    <div
                        key={visitItem._id || index}
                        className='multi-visit-column'
                    >
                        <Link
                            href={`/visits/${visitItem._id}`}
                            className='multi-visit-column-header-link group'
                        >
                            <h2 className='multi-visit-column-title'>
                                {t('visit')} #{visitsArray.length - index}
                            </h2>
                            <span className='multi-visit-column-subtitle'>
                                {visitTitle}
                            </span>
                        </Link>
                        {renderVisitContent(visitItem, index)}
                    </div>
                )
            })}
        </div>
    )
}
