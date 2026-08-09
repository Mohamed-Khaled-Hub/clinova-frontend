'use client'

// Core
import { SubmitEvent, useState, useEffect } from 'react'
import { FaStethoscope } from 'react-icons/fa'
import { FiActivity, FiCalendar, FiPlus } from 'react-icons/fi'
import { useRouter } from '@/src/i18n/routing'
import { useTranslations, useLocale } from 'next-intl'
// Components
import Input from '@/src/components/UiRelated/Input'
import Select from '@/src/components/UiRelated/Select'
import Loading from '@/src/components/UiRelated/Loading'
import Button from '@/src/components/UiRelated/Button'
import PageHeader from '@/src/components/PagesRelated/PageHeader'
import PopupMessage from '@/src/components/UiRelated/PopupMessage'
import FormControl from '@/src/components/PagesRelated/FormControl'
import ErrorMessages from '@/src/components/UiRelated/ErrorMessages'
import FormFieldSet from '@/src/components/PagesRelated/FormFieldSet'
import PageContainer from '@/src/components/ContainerRelated/PageContainer'
import FormBoundaryActions from '@/src/components/PagesRelated/FormBoundaryActions'
import VisitNote from '@/src/components/PagesRelated/VisitNote'
// Enums
import {
    VisitCategoryEnum,
    NoteCategoryEnum,
    PaymentMethodEnum,
    FinancialStatusEnum,
} from '@/src/enums/schemas.enum'
import { StatusEnum } from '@/src/enums/ui.enum'
import { PermissionsEnum } from '@/src/enums/roles-permissions.enum'
// Functions
import { hasPermission, calculateAge } from '@/src/utils/functions'
// Hooks
import { useUser } from '@/src/providers/UserProvider'
import { useVisit } from '@/src/providers/VisitProvider'
import { usePatient } from '@/src/providers/PatientProvider'
// Types
import { CreateVisitRequest } from '@/src/types/backend/backend.requests.type'
import {
    BackendErrorResponse,
    UserResponse,
} from '@/src/types/backend/backend.responses.type'
import {
    VisitNoteSubDocument,
    PatientDocument,
} from '@/src/types/backend/documents.type'
// Style
import '@/src/styles/pages/(root)/visits/create/page.css'

export default function CreateVisitPage() {
    // Translations
    const t = useTranslations('CreateVisitPage')
    const tAge = useTranslations('Age')
    const tCategory = useTranslations('VisitCategoryEnum')
    const tPaymentMethod = useTranslations('PaymentMethodEnum')
    const tFinancialStatus = useTranslations('FinancialStatusEnum')

    // From Providers
    const locale = useLocale()
    const router = useRouter()
    const { createVisit } = useVisit()
    const { user, getDoctors, isLoadingProfile } = useUser()
    const { getPatients } = usePatient()

    // Page States
    const [patients, setPatients] = useState<PatientDocument[]>([])
    const [isLoadingPatients, setIsLoadingPatients] = useState<boolean>(true)
    const [doctors, setDoctors] = useState<UserResponse[]>([])
    const [isLoadingDoctors, setIsLoadingDoctors] = useState(true)
    const [isSuccess, setIsSuccess] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formError, setFormError] = useState<string | string[] | null>(null)
    const [toast, setToast] = useState<{
        message: string
        type: StatusEnum
    } | null>(null)
    const [lastNoteCategory, setLastNoteCategory] = useState<NoteCategoryEnum>(
        NoteCategoryEnum.COMPLAINT
    )

    // Variables
    const now = new Date()
    const offsetMinutes = now.getTimezoneOffset()

    const localNow = new Date(now.getTime() - offsetMinutes * 60 * 1000)
    const initialVisitDateStr = localNow.toISOString().slice(0, 16)

    const followUpDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const localFollowUp = new Date(
        followUpDate.getTime() - offsetMinutes * 60 * 1000
    )
    const initialFollowUpDateStr = localFollowUp.toISOString().slice(0, 16)

    // Form Initialization Payload
    const [formData, setFormData] = useState<CreateVisitRequest>({
        patientId: '',
        doctorId: user?._id || '',
        visitDate: initialVisitDateStr,
        visitType: VisitCategoryEnum.EXAMINATION,
        visitTypeOtherDescription: '',
        height: undefined,
        weight: undefined,
        bloodPressure: '',
        nextVisitDate: initialFollowUpDateStr,
        nextVisitType: VisitCategoryEnum.CONSULTATION,
        nextVisitTypeOtherDescription: '',
        notes: [],
        customFields: {},
        revenueDetails: {
            transactionAmount: undefined,
            discountAmount: undefined,
            paymentMethod: PaymentMethodEnum.CASH,
            status: FinancialStatusEnum.PAID,
            notes: '',
        },
    })

    // Get Patients
    useEffect(() => {
        let isPatientsMounted = true

        const fetchPatients = async () => {
            try {
                setIsLoadingPatients(true)
                const data = await getPatients()
                if (isPatientsMounted && data) {
                    setPatients(data)
                }
            } catch (error) {
                console.error('Failed to fetch patients:', error)
            } finally {
                if (isPatientsMounted) {
                    setIsLoadingPatients(false)
                }
            }
        }

        fetchPatients().then()

        return () => {
            isPatientsMounted = false
        }
    }, [getPatients])

    // Get Doctors
    useEffect(() => {
        let isDoctorsMounted = true

        const fetchDoctors = async () => {
            try {
                setIsLoadingDoctors(true)
                const data = await getDoctors()
                if (isDoctorsMounted && data) {
                    setDoctors(data)
                }
            } catch (err) {
                console.error('Failed to load doctors data:', err)
            } finally {
                if (isDoctorsMounted) {
                    setIsLoadingDoctors(false)
                }
            }
        }

        fetchDoctors().then()

        return () => {
            isDoctorsMounted = false
        }
    }, [getDoctors])

    // Authorization Guard Check
    const canWriteVisit = hasPermission(user, PermissionsEnum.VISIT, 'canWrite')

    // Early Termination
    if (isLoadingProfile || isLoadingPatients || isLoadingDoctors) {
        return <Loading />
    }

    if (!canWriteVisit) {
        return null
    }

    // Event Handlers
    const patientOptions = (patients || []).map((patient: PatientDocument) => {
        const displayName =
            locale === 'ar' ? patient.fullNameAr : patient.fullNameEn
        const age = calculateAge(patient.dob)
        const ageSuffix = age !== null ? ` (${age} ${tAge('years')})` : ''

        return {
            value: patient._id,
            label: `${displayName}${ageSuffix}`,
        }
    })

    const doctorOptions = doctors.map((doc: UserResponse) => {
        const localizedName = locale === 'ar' ? doc.fullNameAr : doc.fullNameEn
        const displayName =
            localizedName ||
            doc.fullNameEn ||
            doc.fullNameAr ||
            doc.username ||
            ''

        return {
            value: doc._id,
            label: displayName,
        }
    })

    const updateFormField = <K extends keyof CreateVisitRequest>(
        fieldName: K,
        value: CreateVisitRequest[K]
    ) => {
        setFormData((prev) => ({ ...prev, [fieldName]: value }))
    }

    const updateRevenueField = <
        K extends keyof NonNullable<CreateVisitRequest['revenueDetails']>,
    >(
        fieldName: K,
        value: NonNullable<CreateVisitRequest['revenueDetails']>[K]
    ) => {
        setFormData((prev) => ({
            ...prev,
            revenueDetails: {
                ...prev.revenueDetails,
                [fieldName]: value,
            },
        }))
    }

    const handleNoteChange = (
        index: number,
        key: keyof VisitNoteSubDocument,
        value: string | null
    ) => {
        if (key === 'category' && value) {
            setLastNoteCategory(value as NoteCategoryEnum)
        }

        const updatedNotes = [...(formData.notes || [])]
        updatedNotes[index] = {
            ...updatedNotes[index],
            [key]: value,
        }

        updateFormField('notes', updatedNotes)
    }

    const addNoteField = () => {
        const newNote: VisitNoteSubDocument = {
            category: lastNoteCategory,
            noteText: '',
            contentDate: null,
            highlightColor: null,
        }
        updateFormField('notes', [...(formData.notes || []), newNote])
    }

    const removeNoteField = (index: number) => {
        const filteredNotes = (formData.notes || []).filter(
            (_, idx) => idx !== index
        )
        updateFormField('notes', filteredNotes)
    }

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault()
        setFormError(null)
        setIsSubmitting(true)

        const payload = { ...formData }
        const optionalKeys: (keyof CreateVisitRequest)[] = [
            'visitTypeOtherDescription',
            'bloodPressure',
            'nextVisitTypeOtherDescription',
        ]

        optionalKeys.forEach((key) => {
            const value = payload[key]
            if (typeof value === 'string' && !value.trim()) {
                delete payload[key]
            }
        })

        if (payload.height === null || payload.height === 0)
            delete payload.height
        if (payload.weight === null || payload.weight === 0)
            delete payload.weight

        if (payload.notes) {
            payload.notes = payload.notes.flatMap((note) => {
                if (!note.noteText.trim()) return []

                const lines = note.noteText
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean)

                return lines.map((line) => ({
                    ...note,
                    noteText: line,
                }))
            })
        }

        try {
            await createVisit(payload)
            setIsSuccess(true)
            setToast({ message: t('successMessage'), type: StatusEnum.SUCCESS })
        } catch (err) {
            const backendErr = err as BackendErrorResponse
            setFormError(backendErr.message)
            setIsSubmitting(false)
        }
    }

    const handlePopupClose = () => {
        setToast(null)
        if (isSuccess) router.push('/visits')
    }

    return (
        <PageContainer className='!max-w-5xl' id='create-visit-container'>
            <PageHeader
                title={t('title')}
                subtitle={t('subtitle')}
                Icon={FaStethoscope}
            />

            {formError && <ErrorMessages messages={formError} />}

            <form onSubmit={handleSubmit} className='visit-form-element'>
                {/* Entities Link Matrix */}
                <FormFieldSet legend={t('encounterContext')} columns={2}>
                    <FormControl id='patientId' label={t('patient')} required>
                        <Select
                            id='patientId'
                            value={formData.patientId}
                            onChangeAction={(val) =>
                                updateFormField('patientId', val)
                            }
                            disabled={isSubmitting}
                            required
                            options={[
                                {
                                    value: '',
                                    label: t('selectPatientPlaceholder'),
                                },
                                ...patientOptions,
                            ]}
                        />
                    </FormControl>

                    <FormControl id='doctorId' label={t('doctor')} required>
                        <Select
                            id='doctorId'
                            value={formData.doctorId}
                            onChangeAction={(val) =>
                                updateFormField('doctorId', val)
                            }
                            disabled={isSubmitting}
                            required
                            options={[
                                {
                                    value: '',
                                    label: t('selectDoctorPlaceholder'),
                                },
                                ...doctorOptions,
                            ]}
                        />
                    </FormControl>
                </FormFieldSet>

                {/* Primary Encounter Details */}
                <FormFieldSet legend={t('visitDetails')} columns={2}>
                    <FormControl id='visitType' label={t('visitType')} required>
                        <Select
                            id='visitType'
                            value={formData.visitType}
                            onChangeAction={(val) =>
                                updateFormField(
                                    'visitType',
                                    val as VisitCategoryEnum
                                )
                            }
                            disabled={isSubmitting}
                            required
                            options={Object.values(VisitCategoryEnum).map(
                                (cat) => ({
                                    value: cat,
                                    label: tCategory.has(cat)
                                        ? tCategory(cat)
                                        : cat,
                                })
                            )}
                        />
                    </FormControl>

                    <FormControl id='visitDate' label={t('visitDate')} required>
                        <Input
                            id='visitDate'
                            type='datetime-local'
                            value={formData.visitDate || ''}
                            onChangeAction={(val) =>
                                updateFormField('visitDate', val)
                            }
                            disabled={isSubmitting}
                            required
                        />
                    </FormControl>

                    {formData.visitType === VisitCategoryEnum.OTHER && (
                        <div className='col-span-2'>
                            <FormControl
                                id='visitTypeOtherDescription'
                                label={t('otherDescription')}
                                required
                            >
                                <Input
                                    id='visitTypeOtherDescription'
                                    type='text'
                                    value={
                                        formData.visitTypeOtherDescription || ''
                                    }
                                    onChangeAction={(val) =>
                                        updateFormField(
                                            'visitTypeOtherDescription',
                                            val
                                        )
                                    }
                                    placeholder={t(
                                        'otherDescriptionPlaceholder'
                                    )}
                                    disabled={isSubmitting}
                                    required
                                />
                            </FormControl>
                        </div>
                    )}
                </FormFieldSet>

                {/* Patient Vitals Matrix Section */}
                <FormFieldSet legend={t('vitalsSection')} columns={3}>
                    <FormControl id='bloodPressure' label={t('bloodPressure')}>
                        <Input
                            id='bloodPressure'
                            type='text'
                            Icon={FiActivity}
                            value={formData.bloodPressure || ''}
                            onChangeAction={(val) =>
                                updateFormField('bloodPressure', val)
                            }
                            placeholder='120/80'
                            disabled={isSubmitting}
                        />
                    </FormControl>

                    <FormControl id='weight' label={t('weight')}>
                        <Input
                            id='weight'
                            type='number'
                            value={formData.weight || ''}
                            onChangeAction={(val) =>
                                updateFormField(
                                    'weight',
                                    val ? Number(val) : undefined
                                )
                            }
                            placeholder='kg'
                            min={0}
                            step='any'
                            disabled={isSubmitting}
                        />
                    </FormControl>

                    <FormControl id='height' label={t('height')}>
                        <Input
                            id='height'
                            type='number'
                            value={formData.height || ''}
                            onChangeAction={(val) =>
                                updateFormField(
                                    'height',
                                    val ? Number(val) : undefined
                                )
                            }
                            placeholder='cm'
                            min={0}
                            step='any'
                            disabled={isSubmitting}
                        />
                    </FormControl>
                </FormFieldSet>

                {/* Follow Up Continuity Matrix */}
                <FormFieldSet legend={t('followUpScheduling')} columns={2}>
                    <FormControl id='nextVisitType' label={t('nextVisitType')}>
                        <Select
                            id='nextVisitType'
                            value={formData.nextVisitType}
                            onChangeAction={(val) =>
                                updateFormField(
                                    'nextVisitType',
                                    val as VisitCategoryEnum
                                )
                            }
                            disabled={isSubmitting}
                            options={Object.values(VisitCategoryEnum).map(
                                (cat) => ({
                                    value: cat,
                                    label: tCategory.has(cat)
                                        ? tCategory(cat)
                                        : cat,
                                })
                            )}
                        />
                    </FormControl>

                    <FormControl id='nextVisitDate' label={t('nextVisitDate')}>
                        <Input
                            id='nextVisitDate'
                            type='datetime-local'
                            Icon={FiCalendar}
                            value={formData.nextVisitDate || ''}
                            onChangeAction={(val) =>
                                updateFormField('nextVisitDate', val)
                            }
                            disabled={isSubmitting}
                        />
                    </FormControl>

                    {formData.nextVisitType === VisitCategoryEnum.OTHER && (
                        <div className='col-span-2'>
                            <FormControl
                                id='nextVisitTypeOtherDescription'
                                label={t('nextOtherDescription')}
                                required
                            >
                                <Input
                                    id='nextVisitTypeOtherDescription'
                                    type='text'
                                    value={
                                        formData.nextVisitTypeOtherDescription ||
                                        ''
                                    }
                                    onChangeAction={(val) =>
                                        updateFormField(
                                            'nextVisitTypeOtherDescription',
                                            val
                                        )
                                    }
                                    placeholder={t(
                                        'otherDescriptionPlaceholder'
                                    )}
                                    disabled={isSubmitting}
                                    required
                                />
                            </FormControl>
                        </div>
                    )}
                </FormFieldSet>

                {/* Revenue & Billing Alignment Matrix */}
                <FormFieldSet legend={t('billingSection')} columns={2}>
                    <FormControl
                        id='transactionAmount'
                        label={t('transactionAmount')}
                    >
                        <Input
                            id='transactionAmount'
                            type='number'
                            value={
                                formData.revenueDetails?.transactionAmount ?? ''
                            }
                            onChangeAction={(val) =>
                                updateRevenueField(
                                    'transactionAmount',
                                    val ? Number(val) : undefined
                                )
                            }
                            placeholder='0.00'
                            min={0}
                            step='any'
                            disabled={isSubmitting}
                        />
                    </FormControl>

                    <FormControl
                        id='discountAmount'
                        label={t('discountAmount')}
                    >
                        <Input
                            id='discountAmount'
                            type='number'
                            value={
                                formData.revenueDetails?.discountAmount ?? ''
                            }
                            onChangeAction={(val) =>
                                updateRevenueField(
                                    'discountAmount',
                                    val ? Number(val) : undefined
                                )
                            }
                            placeholder='0.00'
                            min={0}
                            step='any'
                            disabled={isSubmitting}
                        />
                    </FormControl>

                    <FormControl id='paymentMethod' label={t('paymentMethod')}>
                        <Select
                            id='paymentMethod'
                            value={formData.revenueDetails?.paymentMethod || ''}
                            onChangeAction={(val) =>
                                updateRevenueField(
                                    'paymentMethod',
                                    val as PaymentMethodEnum
                                )
                            }
                            disabled={isSubmitting}
                            options={Object.values(PaymentMethodEnum).map(
                                (method) => ({
                                    value: method,
                                    label: tPaymentMethod.has(method)
                                        ? tPaymentMethod(method)
                                        : method,
                                })
                            )}
                        />
                    </FormControl>

                    <FormControl id='status' label={t('financialStatus')}>
                        <Select
                            id='status'
                            value={formData.revenueDetails?.status || ''}
                            onChangeAction={(val) =>
                                updateRevenueField(
                                    'status',
                                    val as FinancialStatusEnum
                                )
                            }
                            disabled={isSubmitting}
                            options={Object.values(FinancialStatusEnum).map(
                                (stat) => ({
                                    value: stat,
                                    label: tFinancialStatus.has(stat)
                                        ? tFinancialStatus(stat)
                                        : stat,
                                })
                            )}
                        />
                    </FormControl>

                    <div className='col-span-2'>
                        <FormControl
                            id='revenueNotes'
                            label={t('billingNotes')}
                        >
                            <Input
                                id='revenueNotes'
                                type='text'
                                value={formData.revenueDetails?.notes || ''}
                                onChangeAction={(val) =>
                                    updateRevenueField('notes', val)
                                }
                                placeholder={t('notesPlaceholder')}
                                disabled={isSubmitting}
                            />
                        </FormControl>
                    </div>
                </FormFieldSet>

                {/* Notes Section */}
                <FormFieldSet legend={t('clinicalNotesSection')} columns={1}>
                    <div className='visit-notes-editing-stack'>
                        {formData.notes?.map((note, idx) => (
                            <VisitNote
                                key={idx}
                                index={idx}
                                note={note}
                                isSubmitting={isSubmitting}
                                onNoteChangeAction={handleNoteChange}
                                onRemoveNoteAction={removeNoteField}
                            />
                        ))}
                        <Button
                            label={t('addNoteField')}
                            Icon={FiPlus}
                            variant='normal-light'
                            type='button'
                            onClick={addNoteField}
                            disabled={isSubmitting}
                            className='visit-add-note-btn-wrapper'
                        />
                    </div>
                </FormFieldSet>

                <FormBoundaryActions
                    position='bottom'
                    mode='create'
                    isSaving={isSubmitting}
                    onCreateCancelAction={() => router.back()}
                />
            </form>

            {toast && (
                <PopupMessage
                    message={toast.message}
                    type={toast.type}
                    onCloseAction={handlePopupClose}
                />
            )}
        </PageContainer>
    )
}
