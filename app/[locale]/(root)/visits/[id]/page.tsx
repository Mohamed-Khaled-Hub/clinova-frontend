'use client'

// Core
import { use, useEffect, useState, SubmitEvent } from 'react'
import { FaStethoscope } from 'react-icons/fa'
import { FiPlus } from 'react-icons/fi'
import { GiMedicinePills, GiRadioactive } from 'react-icons/gi'
import { RiTestTubeLine } from 'react-icons/ri'
import { useRouter } from '@/src/i18n/routing'
import { useLocale, useTranslations } from 'next-intl'
// Components
import Input from '@/src/components/UiRelated/Input'
import Select from '@/src/components/UiRelated/Select'
import Button from '@/src/components/UiRelated/Button'
import VisitNote from '@/src/components/PagesRelated/VisitNote'
import VisitsNotesViewList from '@/src/components/PagesRelated/VisitsNotesViewList'
import PopupMessage from '@/src/components/UiRelated/PopupMessage'
import ErrorMessages from '@/src/components/UiRelated/ErrorMessages'
import Loading from '@/src/components/UiRelated/Loading'
import ContentSection from '@/src/components/PagesRelated/ContentSection'
import FormBoundaryActions from '@/src/components/PagesRelated/FormBoundaryActions'
import DataDisplayBlock from '@/src/components/PagesRelated/DataDisplayBlock'
import FieldsGrid from '@/src/components/ContainerRelated/FieldsGrid'
import PageContainer from '@/src/components/ContainerRelated/PageContainer'
import PageHeader from '@/src/components/PagesRelated/PageHeader'
// Enums
import { VisitCategoryEnum, NoteCategoryEnum } from '@/src/enums/schemas.enum'
import { PermissionsEnum } from '@/src/enums/roles-permissions.enum'
import { StatusEnum } from '@/src/enums/ui.enum'
// Functions
import { formatTimestamp, hasPermission } from '@/src/utils/functions'
// Hooks
import { useUser } from '@/src/providers/UserProvider'
import { useVisit } from '@/src/providers/VisitProvider'
// Types
import { LocaleType } from '@/src/types/i18n.type'
import { IdPageProps } from '@/src/types/props.type'
import { BackendErrorResponse } from '@/src/types/backend/backend.responses.type'
import { VisitResponse } from '@/src/types/backend/backend.responses.type'
import { VisitNoteSubDocument } from '@/src/types/backend/documents.type'
import { UpdateVisitRequest } from '@/src/types/backend/backend.requests.type'
// Style
import '@/src/styles/pages/(root)/visits/[id]/page.css'

export default function VisitDetailsPage({ params }: IdPageProps) {
    // Params
    const { id } = use(params)

    // Translations
    const t = useTranslations('VisitPage')
    const tTech = useTranslations('SystemTechTerms')
    const tCategory = useTranslations('VisitCategoryEnum')

    // From Providers
    const router = useRouter()
    const locale = useLocale() as LocaleType
    const { getVisitById, updateVisit, deleteVisit } = useVisit()
    const { user, isLoadingProfile } = useUser()

    // Page States
    const [isEditing, setIsEditing] = useState<boolean>(false)
    const [isSaving, setIsSaving] = useState<boolean>(false)
    const [isDeleting, setIsDeleting] = useState<boolean>(false)
    const [isScreenLoading, setIsScreenLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | string[] | null>(null)
    const [toast, setToast] = useState<{
        message: string | string[]
        type: StatusEnum
    } | null>(null)
    const [lastNoteCategory, setLastNoteCategory] = useState<NoteCategoryEnum>(
        NoteCategoryEnum.COMPLAINT
    )

    // Visit Form States
    const [visit, setVisit] = useState<VisitResponse | null>(null)
    const [visitDate, setVisitDate] = useState<string>('')
    const [visitType, setVisitType] = useState<VisitCategoryEnum>(
        VisitCategoryEnum.EXAMINATION
    )
    const [visitTypeOtherDescription, setVisitTypeOtherDescription] =
        useState<string>('')
    const [height, setHeight] = useState<string>('')
    const [weight, setWeight] = useState<string>('')
    const [bloodPressure, setBloodPressure] = useState<string>('')
    const [notes, setNotes] = useState<VisitNoteSubDocument[]>([])
    const [nextVisitDate, setNextVisitDate] = useState<string>('')
    const [nextVisitType, setNextVisitType] = useState<VisitCategoryEnum>(
        VisitCategoryEnum.EXAMINATION
    )
    const [nextVisitTypeOtherDescription, setNextVisitTypeOtherDescription] =
        useState<string>('')

    // Get Visit Data
    useEffect(() => {
        const fetchTargetVisit = async () => {
            try {
                setIsScreenLoading(true)
                const data = await getVisitById(id)
                setVisit(data)
                if (data?.notes && data.notes.length > 0)
                    setLastNoteCategory(
                        data.notes[data.notes.length - 1].category
                    )
            } catch (err) {
                const backendErr = err as BackendErrorResponse
                setError(backendErr.message)
            } finally {
                setIsScreenLoading(false)
            }
        }
        fetchTargetVisit().then()
    }, [id, getVisitById])

    // Authorization Guard Check
    const canReadVisit = hasPermission(user, PermissionsEnum.VISIT, 'canRead')
    const canWriteVisit = hasPermission(user, PermissionsEnum.VISIT, 'canWrite')

    // Early Termination
    if (isLoadingProfile || isScreenLoading) {
        return <Loading />
    }

    if (!visit || !canReadVisit) {
        return null
    }

    // Event Handlers
    const handleStartEditing = () => {
        if (!canWriteVisit) return
        setError(null)
        if (visit) {
            setVisitDate(
                visit.visitDate
                    ? new Date(visit.visitDate).toISOString().slice(0, 10)
                    : ''
            )
            setVisitType(visit.visitType)
            setVisitTypeOtherDescription(visit.visitTypeOtherDescription || '')
            setHeight(
                visit.height !== undefined && visit.height !== null
                    ? String(visit.height)
                    : ''
            )
            setWeight(
                visit.weight !== undefined && visit.weight !== null
                    ? String(visit.weight)
                    : ''
            )
            setBloodPressure(visit.bloodPressure || '')

            setNotes(
                visit.notes
                    ? visit.notes.map((n) => ({
                          category: n.category,
                          noteText: n.noteText,
                          contentDate: n.contentDate
                              ? new Date(n.contentDate)
                                    .toISOString()
                                    .slice(0, 10)
                              : null,
                          highlightColor: n.highlightColor,
                      }))
                    : []
            )

            setNextVisitDate(
                visit.nextVisitDate
                    ? new Date(visit.nextVisitDate).toISOString().slice(0, 10)
                    : ''
            )
            setNextVisitType(visit.nextVisitType)
            setNextVisitTypeOtherDescription(
                visit.nextVisitTypeOtherDescription || ''
            )
        }
        setIsEditing(true)
    }

    const handleCancelEditing = () => {
        setIsEditing(false)
        setError(null)
    }

    const handleNoteChange = (
        index: number,
        field: keyof VisitNoteSubDocument,
        value: string | null
    ) => {
        if (field === 'category' && value) {
            setLastNoteCategory(value as NoteCategoryEnum)
        }

        setNotes((prevNotes) =>
            prevNotes.map((note, idx) =>
                idx === index ? { ...note, [field]: value } : note
            )
        )
    }

    const handleAddNoteField = () => {
        setNotes((prevNotes) => [
            ...prevNotes,
            {
                category: lastNoteCategory,
                noteText: '',
                contentDate: null,
                highlightColor: null,
            },
        ])
    }

    const handleRemoveNoteField = (index: number) => {
        setNotes((prevNotes) => prevNotes.filter((_, idx) => idx !== index))
    }

    const handleSaveChanges = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!canWriteVisit) return
        setError(null)
        setIsSaving(true)

        try {
            const processedNotes = notes.flatMap((n) => {
                const lines = n.noteText ? n.noteText.split('\n') : ['']

                return lines
                    .map((line) => line.trim())
                    .filter((line) => line !== '')
                    .map((line) => ({
                        category: n.category,
                        noteText: line,
                        contentDate: n.contentDate
                            ? new Date(n.contentDate).toISOString()
                            : null,
                        highlightColor: n.highlightColor || null,
                    }))
            })

            const updatedPayload: UpdateVisitRequest = {
                visitDate: visitDate
                    ? new Date(visitDate).toISOString()
                    : visit.visitDate,
                visitType,
                visitTypeOtherDescription:
                    visitType === VisitCategoryEnum.OTHER
                        ? visitTypeOtherDescription.trim()
                        : undefined,
                height: height ? Number(height) : undefined,
                weight: weight ? Number(weight) : undefined,
                bloodPressure: bloodPressure.trim() || undefined,

                notes: processedNotes,

                nextVisitDate: nextVisitDate
                    ? new Date(nextVisitDate).toISOString()
                    : visit.nextVisitDate,
                nextVisitType,
                nextVisitTypeOtherDescription:
                    nextVisitType === VisitCategoryEnum.OTHER
                        ? nextVisitTypeOtherDescription.trim()
                        : undefined,
            }

            const refreshedData = await updateVisit(id, updatedPayload)
            setVisit(refreshedData)

            setToast({ message: t('updateSuccess'), type: StatusEnum.SUCCESS })
            setIsEditing(false)
        } catch (err) {
            const backendErr = err as BackendErrorResponse
            setError(backendErr.message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteVisit = async () => {
        if (!canWriteVisit) return
        if (!window.confirm(t('confirmDelete'))) return

        setError(null)
        setIsDeleting(true)
        try {
            await deleteVisit(id)
            router.push('/visits')
        } catch (err) {
            const backendErr = err as BackendErrorResponse
            setError(backendErr.message)
            setIsDeleting(false)
        }
    }

    const localizedPatientName =
        locale === 'ar' ? visit.patient.fullNameAr : visit.patient.fullNameEn
    const localizedDoctorName =
        locale === 'ar' ? visit.doctor.fullNameAr : visit.doctor.fullNameEn

    return (
        <PageContainer id='visit-details-page'>
            <PageHeader
                title={t('sectionTitle')}
                subtitle={`${tTech('id')}: ${visit._id}`}
                Icon={FaStethoscope}
            />

            {error && <ErrorMessages messages={error} />}

            <form onSubmit={handleSaveChanges}>
                <ContentSection>
                    <FormBoundaryActions
                        title={t('sectionTitle')}
                        position='top'
                        isEditing={isEditing}
                        isSaving={isSaving}
                        isDeleting={isDeleting}
                        hideControls={!canWriteVisit}
                        onStartEditAction={handleStartEditing}
                        onCancelEditAction={handleCancelEditing}
                        onDeleteAction={handleDeleteVisit}
                    />

                    {!isEditing && (
                        <div className='visit-custom-actions-zone-top'>
                            <Button
                                href={`/medical-documents/prescription/${id}`}
                                variant='normal-dark'
                                fullWidth
                                Icon={GiMedicinePills}
                                label={t('printPrescription')}
                            />
                            <Button
                                href={`/medical-documents/lab-request/${id}`}
                                variant='normal-dark'
                                fullWidth
                                Icon={RiTestTubeLine}
                                label={t('printLabRequest')}
                            />
                            <Button
                                href={`/medical-documents/radiology-request/${id}`}
                                variant='normal-dark'
                                fullWidth
                                Icon={GiRadioactive}
                                label={t('printRadiologyRequest')}
                            />
                        </div>
                    )}

                    <FieldsGrid>
                        <DataDisplayBlock
                            label={t('patient')}
                            isLocked
                            viewValue={localizedPatientName}
                        />
                        <DataDisplayBlock
                            label={t('doctor')}
                            isLocked
                            viewValue={localizedDoctorName}
                        />

                        {/* Visit Date */}
                        <DataDisplayBlock
                            label={t('visitDate')}
                            isEditing={isEditing}
                            viewValue={formatTimestamp(
                                locale,
                                visit.visitDate,
                                'dateOnly'
                            )}
                            editInput={
                                <Input
                                    value={visitDate}
                                    onChangeAction={(val) => setVisitDate(val)}
                                    placeholder=''
                                    disabled={isSaving}
                                    type='date'
                                />
                            }
                        />

                        {/* Visit Type */}
                        <DataDisplayBlock
                            label={t('visitType')}
                            isEditing={isEditing}
                            viewValue={tCategory(visit.visitType)}
                            editInput={
                                <Select
                                    value={visitType}
                                    onChangeAction={(val) =>
                                        setVisitType(val as VisitCategoryEnum)
                                    }
                                    disabled={isSaving}
                                    options={Object.values(
                                        VisitCategoryEnum
                                    ).map((cat) => ({
                                        value: cat,
                                        label: tCategory(cat),
                                    }))}
                                />
                            }
                        />

                        {/* Conditional Other Description */}
                        {(isEditing
                            ? visitType === VisitCategoryEnum.OTHER
                            : visit.visitType === VisitCategoryEnum.OTHER) && (
                            <DataDisplayBlock
                                label={t('visitTypeOtherDescription')}
                                isEditing={isEditing}
                                viewValue={
                                    visit.visitTypeOtherDescription || ''
                                }
                                editInput={
                                    <Input
                                        value={visitTypeOtherDescription}
                                        onChangeAction={(val) =>
                                            setVisitTypeOtherDescription(val)
                                        }
                                        placeholder={t(
                                            'visitTypeOtherPlaceholder'
                                        )}
                                        disabled={isSaving}
                                        type='text'
                                    />
                                }
                            />
                        )}

                        <DataDisplayBlock
                            label={t('height')}
                            isEditing={isEditing}
                            viewValue={
                                visit.height !== undefined &&
                                visit.height !== null
                                    ? `${visit.height} cm`
                                    : ''
                            }
                            editInput={
                                <Input
                                    value={height}
                                    onChangeAction={(val) => setHeight(val)}
                                    placeholder={t('heightPlaceholder')}
                                    disabled={isSaving}
                                    type='number'
                                />
                            }
                        />

                        <DataDisplayBlock
                            label={t('weight')}
                            isEditing={isEditing}
                            viewValue={
                                visit.weight !== undefined &&
                                visit.weight !== null
                                    ? `${visit.weight} kg`
                                    : ''
                            }
                            editInput={
                                <Input
                                    value={weight}
                                    onChangeAction={(val) => setWeight(val)}
                                    placeholder={t('weightPlaceholder')}
                                    disabled={isSaving}
                                    type='number'
                                />
                            }
                        />

                        <DataDisplayBlock
                            label={t('bloodPressure')}
                            isEditing={isEditing}
                            viewValue={visit.bloodPressure || ''}
                            editInput={
                                <Input
                                    value={bloodPressure}
                                    onChangeAction={(val) =>
                                        setBloodPressure(val)
                                    }
                                    placeholder={t('bloodPressurePlaceholder')}
                                    disabled={isSaving}
                                    type='text'
                                />
                            }
                        />

                        {/* Next Scheduled Visit Date */}
                        <DataDisplayBlock
                            label={t('nextVisitDate')}
                            isEditing={isEditing}
                            viewValue={formatTimestamp(
                                locale,
                                visit.nextVisitDate,
                                'dateOnly'
                            )}
                            editInput={
                                <Input
                                    value={nextVisitDate}
                                    onChangeAction={(val) =>
                                        setNextVisitDate(val)
                                    }
                                    placeholder=''
                                    disabled={isSaving}
                                    type='date'
                                />
                            }
                        />

                        {/* Next Scheduled Visit Type */}
                        <DataDisplayBlock
                            label={t('nextVisitType')}
                            isEditing={isEditing}
                            viewValue={tCategory(visit.nextVisitType)}
                            editInput={
                                <Select
                                    value={nextVisitType}
                                    onChangeAction={(val) =>
                                        setNextVisitType(
                                            val as VisitCategoryEnum
                                        )
                                    }
                                    disabled={isSaving}
                                    options={Object.values(
                                        VisitCategoryEnum
                                    ).map((cat) => ({
                                        value: cat,
                                        label: tCategory(cat),
                                    }))}
                                />
                            }
                        />

                        {/* Conditional Other Description for Next Visit Type */}
                        {(isEditing
                            ? nextVisitType === VisitCategoryEnum.OTHER
                            : visit.nextVisitType ===
                              VisitCategoryEnum.OTHER) && (
                            <DataDisplayBlock
                                label={t('nextVisitTypeOtherDescription')}
                                isEditing={isEditing}
                                viewValue={
                                    visit.nextVisitTypeOtherDescription || ''
                                }
                                editInput={
                                    <Input
                                        value={nextVisitTypeOtherDescription}
                                        onChangeAction={(val) =>
                                            setNextVisitTypeOtherDescription(
                                                val
                                            )
                                        }
                                        placeholder={t(
                                            'nextVisitTypeOtherPlaceholder'
                                        )}
                                        disabled={isSaving}
                                        type='text'
                                    />
                                }
                            />
                        )}

                        <DataDisplayBlock
                            label={t('notesSectionHeader')}
                            isEditing={isEditing}
                            viewValue={
                                <VisitsNotesViewList
                                    visits={visit}
                                    emptyMessage={t('noNotesRecorded')}
                                />
                            }
                            editInput={
                                <>
                                    {notes.map((noteItem, index) => (
                                        <VisitNote
                                            key={index}
                                            index={index}
                                            note={noteItem}
                                            isSubmitting={isSaving}
                                            onNoteChangeAction={
                                                handleNoteChange
                                            }
                                            onRemoveNoteAction={
                                                handleRemoveNoteField
                                            }
                                        />
                                    ))}
                                    <div className='visit-notes-action-container'>
                                        <Button
                                            label={t('addNoteButton')}
                                            type='button'
                                            variant='normal-light'
                                            Icon={FiPlus}
                                            onClick={handleAddNoteField}
                                            disabled={isSaving}
                                        />
                                    </div>
                                </>
                            }
                            fullWidth
                        />

                        <DataDisplayBlock
                            label={tTech('createdAt')}
                            isLocked
                            viewValue={formatTimestamp(locale, visit.createdAt)}
                        />
                        <DataDisplayBlock
                            label={tTech('updatedAt')}
                            isLocked
                            viewValue={formatTimestamp(locale, visit.updatedAt)}
                        />
                    </FieldsGrid>

                    <FormBoundaryActions
                        position='bottom'
                        isEditing={isEditing}
                        isSaving={isSaving}
                        hideControls={!canWriteVisit}
                        onStartEditAction={handleStartEditing}
                        onCancelEditAction={handleCancelEditing}
                    />
                </ContentSection>
            </form>

            {toast && (
                <PopupMessage
                    message={toast.message}
                    type={toast.type}
                    onCloseAction={() => setToast(null)}
                />
            )}
        </PageContainer>
    )
}
