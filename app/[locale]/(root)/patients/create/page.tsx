'use client'

// Core
import { SubmitEvent, useState } from 'react'
import { FaUserInjured } from 'react-icons/fa'
import { useRouter } from '@/src/i18n/routing'
import { useLocale, useTranslations } from 'next-intl'
// Components
import Input from '@/src/components/UiRelated/Input'
import Select from '@/src/components/UiRelated/Select'
import Loading from '@/src/components/UiRelated/Loading'
import TextArea from '@/src/components/UiRelated/TextArea'
import PageHeader from '@/src/components/PagesRelated/PageHeader'
import PopupMessage from '@/src/components/UiRelated/PopupMessage'
import FormControl from '@/src/components/PagesRelated/FormControl'
import ErrorMessages from '@/src/components/UiRelated/ErrorMessages'
import FormFieldSet from '@/src/components/PagesRelated/FormFieldSet'
import PageContainer from '@/src/components/ContainerRelated/PageContainer'
import FormBoundaryActions from '@/src/components/PagesRelated/FormBoundaryActions'
// Enums
import {
    GenderEnum,
    ReferralEnum,
    MaritalStatusEnum,
} from '@/src/enums/schemas.enum'
import { StatusEnum } from '@/src/enums/ui.enum'
import { PermissionsEnum } from '@/src/enums/roles-permissions.enum'
// Functions
import { capitalizeWords, hasPermission } from '@/src/utils/functions'
// Hooks
import { useUser } from '@/src/providers/UserProvider'
import { usePatient } from '@/src/providers/PatientProvider'
// Types
import { CreatePatientRequest } from '@/src/types/backend/backend.requests.type'
import { BackendErrorResponse } from '@/src/types/backend/backend.responses.type'
// Style
import '@/src/styles/pages/(root)/patients/create/page.css'

export default function CreatePatientPage() {
    // Translations
    const t = useTranslations('CreatePatientPage')
    const tGender = useTranslations('GenderEnum')
    const tMarital = useTranslations('MaritalStatusEnum')
    const tReferral = useTranslations('ReferralEnum')

    // From Providers
    const router = useRouter()
    const locale = useLocale()
    const { createPatient } = usePatient()
    const { user, isLoadingProfile } = useUser()

    // Page States
    const [isSuccess, setIsSuccess] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | string[] | null>(null)
    const [toast, setToast] = useState<{
        message: string
        type: StatusEnum
    } | null>(null)

    // Patient State
    const [formData, setFormData] = useState<CreatePatientRequest>({
        fullNameEn: '',
        fullNameAr: '',
        dob: '',
        phone: '',
        gender: GenderEnum.MALE,
        nationality: locale === 'ar' ? 'مصري' : 'Egyptian',
        maritalStatus: MaritalStatusEnum.SINGLE,
        referralSource: ReferralEnum.OTHER,
        notes: '',
        customFields: {},
    })

    // Authorization Guard Check
    const canWritePatient = hasPermission(
        user,
        PermissionsEnum.PATIENT,
        'canWrite'
    )

    // Early Termination
    if (isLoadingProfile) {
        return <Loading />
    }

    if (!canWritePatient) {
        return null
    }

    // Event Handlers
    const updateFormField = <K extends keyof CreatePatientRequest>(
        fieldName: K,
        value: CreatePatientRequest[K]
    ) => {
        setFormData((prev) => ({ ...prev, [fieldName]: value }))
    }

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault()
        setError(null)
        setIsSubmitting(true)

        const payload = {
            ...formData,
            fullNameEn: capitalizeWords(formData.fullNameEn),
        }

        const optionalKeys: (keyof CreatePatientRequest)[] = [
            'nationality',
            'maritalStatus',
            'referralSource',
            'notes',
        ]

        optionalKeys.forEach((key) => {
            const value = payload[key]
            if (typeof value === 'string' && !value.trim()) {
                delete payload[key]
            }
        })

        try {
            await createPatient(payload)
            setIsSuccess(true)
            setToast({ message: t('successMessage'), type: StatusEnum.SUCCESS })
        } catch (err) {
            const backendErr = err as BackendErrorResponse
            setError(backendErr.message)
            setIsSubmitting(false)
        }
    }

    const handlePopupClose = () => {
        setToast(null)
        if (isSuccess) router.push('/patients')
    }

    return (
        <PageContainer className='!max-w-5xl' id='create-patient-container'>
            <PageHeader
                title={t('title')}
                subtitle={t('subtitle')}
                Icon={FaUserInjured}
            />

            {error && <ErrorMessages messages={error} />}

            <form onSubmit={handleSubmit} className='patient-form-element'>
                {/* Personal Demographics */}
                <FormFieldSet legend={t('personalDemographics')} columns={2}>
                    <FormControl
                        id='fullNameEn'
                        label={t('fullNameEn')}
                        required
                    >
                        <Input
                            id='fullNameEn'
                            value={formData.fullNameEn}
                            onChangeAction={(val) =>
                                updateFormField('fullNameEn', val)
                            }
                            placeholder={t('fullNameEnPlaceholder')}
                            disabled={isSubmitting}
                            required
                        />
                    </FormControl>

                    <FormControl
                        id='fullNameAr'
                        label={t('fullNameAr')}
                        required
                    >
                        <Input
                            id='fullNameAr'
                            value={formData.fullNameAr}
                            onChangeAction={(val) =>
                                updateFormField('fullNameAr', val)
                            }
                            placeholder={t('fullNameArPlaceholder')}
                            disabled={isSubmitting}
                            required
                        />
                    </FormControl>

                    <FormControl id='dob' label={t('dob')} required>
                        <Input
                            id='dob'
                            type='date'
                            value={formData.dob}
                            onChangeAction={(val) =>
                                updateFormField('dob', val)
                            }
                            disabled={isSubmitting}
                            required
                        />
                    </FormControl>

                    <FormControl id='phone' label={t('phone')} required>
                        <Input
                            id='phone'
                            type='tel'
                            value={formData.phone}
                            onChangeAction={(val) =>
                                updateFormField('phone', val)
                            }
                            placeholder={t('phonePlaceholder')}
                            disabled={isSubmitting}
                            required
                        />
                    </FormControl>
                </FormFieldSet>

                {/* Background Status */}
                <FormFieldSet legend={t('backgroundStatus')} columns={3}>
                    <FormControl id='gender' label={t('gender')} required>
                        <Select
                            id='gender'
                            value={formData.gender}
                            onChangeAction={(val) =>
                                updateFormField('gender', val as GenderEnum)
                            }
                            disabled={isSubmitting}
                            required
                            options={Object.values(GenderEnum).map((g) => ({
                                value: g,
                                label: tGender.has(g) ? tGender(g) : g,
                            }))}
                        />
                    </FormControl>

                    <FormControl id='maritalStatus' label={t('maritalStatus')}>
                        <Select
                            id='maritalStatus'
                            value={formData.maritalStatus}
                            onChangeAction={(val) =>
                                updateFormField(
                                    'maritalStatus',
                                    val as MaritalStatusEnum
                                )
                            }
                            disabled={isSubmitting}
                            options={Object.values(MaritalStatusEnum).map(
                                (status) => ({
                                    value: status,
                                    label: tMarital.has(status)
                                        ? tMarital(status)
                                        : status,
                                })
                            )}
                        />
                    </FormControl>

                    <FormControl
                        id='referralSource'
                        label={t('referralSource')}
                    >
                        <Select
                            id='referralSource'
                            value={formData.referralSource}
                            onChangeAction={(val) =>
                                updateFormField(
                                    'referralSource',
                                    val as ReferralEnum
                                )
                            }
                            disabled={isSubmitting}
                            options={Object.values(ReferralEnum).map((ref) => ({
                                value: ref,
                                label: tReferral.has(ref)
                                    ? tReferral(ref)
                                    : ref.replace('_', ' '),
                            }))}
                        />
                    </FormControl>

                    <FormControl
                        id='nationality'
                        label={t('nationality')}
                        span={3}
                    >
                        <Input
                            id='nationality'
                            value={formData.nationality || ''}
                            onChangeAction={(val) =>
                                updateFormField('nationality', val)
                            }
                            disabled={isSubmitting}
                        />
                    </FormControl>
                </FormFieldSet>

                {/* Notes */}
                <FormFieldSet legend={t('notesSection')} columns={1}>
                    <FormControl id='notes' label={t('notes')}>
                        <TextArea
                            id='notes'
                            value={formData.notes || ''}
                            onChangeAction={(val) =>
                                updateFormField('notes', val)
                            }
                            placeholder={t('notesPlaceholder')}
                            disabled={isSubmitting}
                        />
                    </FormControl>
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
