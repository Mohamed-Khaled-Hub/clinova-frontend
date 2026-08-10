'use client'

// Core
import { FaUserInjured } from 'react-icons/fa'
import { useRouter } from '@/src/i18n/routing'
import { useLocale, useTranslations } from 'next-intl'
import { SubmitEvent, use, useEffect, useState } from 'react'
// Components
import Input from '@/src/components/UiRelated/Input'
import Select from '@/src/components/UiRelated/Select'
import PopupMessage from '@/src/components/UiRelated/PopupMessage'
import ErrorMessages from '@/src/components/UiRelated/ErrorMessages'
import Loading from '@/src/components/UiRelated/Loading'
import ContentSection from '@/src/components/PagesRelated/ContentSection'
import FormBoundaryActions from '@/src/components/PagesRelated/FormBoundaryActions'
import DataDisplayBlock from '@/src/components/PagesRelated/DataDisplayBlock'
import FieldsGrid from '@/src/components/ContainerRelated/FieldsGrid'
import PageContainer from '@/src/components/ContainerRelated/PageContainer'
import PageHeader from '@/src/components/PagesRelated/PageHeader'
import TextArea from '@/src/components/UiRelated/TextArea'
// Enums
import {
    GenderEnum,
    MaritalStatusEnum,
    ReferralEnum,
} from '@/src/enums/schemas.enum'
import { PermissionsEnum } from '@/src/enums/roles-permissions.enum'
import { StatusEnum } from '@/src/enums/ui.enum'
// Functions
import { formatTimestamp, hasPermission } from '@/src/utils/functions'
// Hooks
import { useUser } from '@/src/providers/UserProvider'
import { usePatient } from '@/src/providers/PatientProvider'
import { useVisit } from '@/src/providers/VisitProvider'
// Types
import { LocaleType } from '@/src/types/i18n.type'
import { IdPageProps } from '@/src/types/props.type'
import {
    BackendErrorResponse,
    VisitResponse,
} from '@/src/types/backend/backend.responses.type'
import { PatientDocument } from '@/src/types/backend/documents.type'
// Style
import '@/src/styles/pages/(root)/patients/[id]/page.css'
import VisitsNotesViewList from '@/src/components/PagesRelated/VisitsNotesViewList'

export default function PatientDetailsPage({ params }: IdPageProps) {
    // Params
    const { id } = use(params)

    // Translations
    const t = useTranslations('PatientPage')
    const tTech = useTranslations('SystemTechTerms')
    const tGender = useTranslations('GenderEnum')
    const tMarital = useTranslations('MaritalStatusEnum')
    const tReferral = useTranslations('ReferralEnum')

    // From Providers
    const router = useRouter()
    const locale = useLocale() as LocaleType
    const { updatePatient, deletePatient, getPatientById } = usePatient()
    const { user, isLoadingProfile } = useUser()
    const { getVisitsByPatientId } = useVisit()

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

    // Patient Form States
    const [patient, setPatient] = useState<PatientDocument | null>(null)
    const [fullNameEn, setFullNameEn] = useState<string>('')
    const [fullNameAr, setFullNameAr] = useState<string>('')
    const [dob, setDob] = useState<string>('')
    const [phone, setPhone] = useState<string>('')
    const [gender, setGender] = useState<GenderEnum>(GenderEnum.MALE)
    const [nationality, setNationality] = useState<string>('')
    const [maritalStatus, setMaritalStatus] = useState<MaritalStatusEnum>(
        MaritalStatusEnum.SINGLE
    )
    const [referralSource, setReferralSource] = useState<ReferralEnum>(
        ReferralEnum.OTHER
    )
    const [notes, setNotes] = useState<string>('')
    const [visits, setVisits] = useState<VisitResponse[]>([])

    // Get Patient
    useEffect(() => {
        const fetchTargetPatient = async () => {
            try {
                setIsScreenLoading(true)
                const data = await getPatientById(id)
                setPatient(data)
                const visitsData = await getVisitsByPatientId(id)
                setVisits(visitsData)
            } catch (err) {
                const backendErr = err as BackendErrorResponse
                setError(backendErr.message)
            } finally {
                setIsScreenLoading(false)
            }
        }
        fetchTargetPatient().then()
    }, [id, getPatientById, getVisitsByPatientId])

    // Authorization Guard Check
    const canReadPatient = hasPermission(
        user,
        PermissionsEnum.PATIENT,
        'canRead'
    )

    const canWritePatient = hasPermission(
        user,
        PermissionsEnum.PATIENT,
        'canWrite'
    )

    // Early Termination
    if (isLoadingProfile || isScreenLoading) {
        return <Loading />
    }

    if (!patient || !canReadPatient) {
        return null
    }

    // Event Handlers
    const handleStartEditing = () => {
        if (!canWritePatient) return
        setError(null)
        if (patient) {
            setFullNameEn(patient.fullNameEn)
            setFullNameAr(patient.fullNameAr)
            setDob(
                patient.dob
                    ? new Date(patient.dob).toISOString().slice(0, 10)
                    : ''
            )
            setPhone(patient.phone)
            setGender(patient.gender)
            setNationality(patient.nationality)
            setMaritalStatus(patient.maritalStatus)
            setReferralSource(patient.referralSource)
            setNotes(patient.notes || '')
        }
        setIsEditing(true)
    }

    const handleCancelEditing = () => {
        setIsEditing(false)
        setError(null)
    }

    const handleSaveChanges = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!canWritePatient) return
        setError(null)
        setIsSaving(true)

        try {
            const updatedPayload = {
                fullNameEn: fullNameEn.trim(),
                fullNameAr: fullNameAr.trim(),
                dob: dob ? new Date(dob).toISOString() : patient.dob,
                phone: phone.trim(),
                gender,
                nationality: nationality.trim(),
                maritalStatus,
                referralSource,
                notes: notes.trim() || undefined,
            }

            const refreshedData = await updatePatient(id, updatedPayload)
            setPatient(refreshedData)

            setToast({ message: t('updateSuccess'), type: StatusEnum.SUCCESS })
            setIsEditing(false)
        } catch (err) {
            const backendErr = err as BackendErrorResponse
            setError(backendErr.message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeletePatient = async () => {
        if (!canWritePatient) return
        if (!window.confirm(t('confirmDelete'))) return

        setError(null)
        setIsDeleting(true)
        try {
            await deletePatient(id)
            router.push('/patients')
        } catch (err) {
            const backendErr = err as BackendErrorResponse
            setError(backendErr.message)
            setIsDeleting(false)
        }
    }

    return (
        <PageContainer id='patient-details-page'>
            <PageHeader
                title={t('sectionTitle')}
                subtitle={`${tTech('id')}: ${patient._id}`}
                Icon={FaUserInjured}
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
                        hideControls={!canWritePatient}
                        onStartEditAction={handleStartEditing}
                        onCancelEditAction={handleCancelEditing}
                        onDeleteAction={handleDeletePatient}
                    />

                    <FieldsGrid>
                        {/* Full Name (English) */}
                        <DataDisplayBlock
                            label={t('fullNameEn')}
                            isEditing={isEditing}
                            viewValue={patient.fullNameEn}
                            editInput={
                                <Input
                                    value={fullNameEn}
                                    onChangeAction={(val) => setFullNameEn(val)}
                                    placeholder={t('fullNameEnPlaceholder')}
                                    disabled={isSaving}
                                    type='text'
                                />
                            }
                        />

                        {/* Full Name (Arabic) */}
                        <DataDisplayBlock
                            label={t('fullNameAr')}
                            isEditing={isEditing}
                            viewValue={patient.fullNameAr}
                            editInput={
                                <Input
                                    value={fullNameAr}
                                    onChangeAction={(val) => setFullNameAr(val)}
                                    placeholder={t('fullNameArPlaceholder')}
                                    disabled={isSaving}
                                    type='text'
                                />
                            }
                        />

                        {/* Phone Number */}
                        <DataDisplayBlock
                            label={t('phone')}
                            isEditing={isEditing}
                            viewValue={patient.phone}
                            editInput={
                                <Input
                                    value={phone}
                                    onChangeAction={(val) => setPhone(val)}
                                    placeholder={t('phonePlaceholder')}
                                    disabled={isSaving}
                                    type='tel'
                                />
                            }
                        />

                        {/* Date of Birth */}
                        <DataDisplayBlock
                            label={t('dob')}
                            isEditing={isEditing}
                            viewValue={formatTimestamp(
                                locale,
                                patient.dob,
                                'dateOnly'
                            )}
                            editInput={
                                <Input
                                    value={dob}
                                    onChangeAction={(val) => setDob(val)}
                                    placeholder=''
                                    disabled={isSaving}
                                    type='date'
                                />
                            }
                        />

                        {/* Gender Select */}
                        <DataDisplayBlock
                            label={t('gender')}
                            isEditing={isEditing}
                            viewValue={tGender(patient.gender)}
                            editInput={
                                <Select
                                    value={gender}
                                    onChangeAction={(val) =>
                                        setGender(val as GenderEnum)
                                    }
                                    disabled={isSaving}
                                    options={Object.values(GenderEnum).map(
                                        (g) => ({
                                            value: g,
                                            label: tGender(g),
                                        })
                                    )}
                                />
                            }
                        />

                        {/* Nationality */}
                        <DataDisplayBlock
                            label={t('nationality')}
                            isEditing={isEditing}
                            viewValue={patient.nationality}
                            editInput={
                                <Input
                                    value={nationality}
                                    onChangeAction={(val) =>
                                        setNationality(val)
                                    }
                                    placeholder={t('nationalityPlaceholder')}
                                    disabled={isSaving}
                                    type='text'
                                />
                            }
                        />

                        {/* Marital Status */}
                        <DataDisplayBlock
                            label={t('maritalStatus')}
                            isEditing={isEditing}
                            viewValue={tMarital(patient.maritalStatus)}
                            editInput={
                                <Select
                                    value={maritalStatus}
                                    onChangeAction={(val) =>
                                        setMaritalStatus(
                                            val as MaritalStatusEnum
                                        )
                                    }
                                    disabled={isSaving}
                                    options={Object.values(
                                        MaritalStatusEnum
                                    ).map((m) => ({
                                        value: m,
                                        label: tMarital(m),
                                    }))}
                                />
                            }
                        />

                        {/* Referral Source */}
                        <DataDisplayBlock
                            label={t('referralSource')}
                            isEditing={isEditing}
                            viewValue={tReferral(patient.referralSource)}
                            editInput={
                                <Select
                                    value={referralSource}
                                    onChangeAction={(val) =>
                                        setReferralSource(val as ReferralEnum)
                                    }
                                    disabled={isSaving}
                                    options={Object.values(ReferralEnum).map(
                                        (r) => ({
                                            value: r,
                                            label: tReferral(r),
                                        })
                                    )}
                                />
                            }
                        />

                        {/* Notes Field */}
                        <DataDisplayBlock
                            label={t('notes')}
                            isEditing={isEditing}
                            fullWidth
                            viewValue={patient.notes}
                            editInput={
                                <TextArea
                                    value={notes}
                                    onChangeAction={(val) => setNotes(val)}
                                    placeholder={t('notesPlaceholder')}
                                    disabled={isSaving}
                                />
                            }
                        />

                        {/* Visits Field */}
                        <DataDisplayBlock
                            label={'Visits'}
                            isLocked
                            fullWidth
                            viewValue={
                                <VisitsNotesViewList
                                    visits={visits}
                                    emptyMessage={t('noNotesRecorded')}
                                />
                            }
                        />

                        {/* Meta Audit Fields */}
                        <DataDisplayBlock
                            label={tTech('createdAt')}
                            isLocked
                            viewValue={formatTimestamp(
                                locale,
                                patient.createdAt,
                                'relative'
                            )}
                        />

                        <DataDisplayBlock
                            label={tTech('updatedAt')}
                            isLocked
                            viewValue={formatTimestamp(
                                locale,
                                patient.updatedAt,
                                'relative'
                            )}
                        />
                    </FieldsGrid>

                    <FormBoundaryActions
                        position='bottom'
                        isEditing={isEditing}
                        isSaving={isSaving}
                        hideControls={!canWritePatient}
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
