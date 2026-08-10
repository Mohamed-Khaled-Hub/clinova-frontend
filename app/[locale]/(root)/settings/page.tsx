'use client'

// Core
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { SubmitEvent, useState, ChangeEvent } from 'react'
import { FiSettings, FiTrash2 } from 'react-icons/fi'
// Components
import Button from '@/src/components/UiRelated/Button'
import Input from '@/src/components/UiRelated/Input'
import Toggle from '@/src/components/UiRelated/Toggle'
import Loading from '@/src/components/UiRelated/Loading'
import PopupMessage from '@/src/components/UiRelated/PopupMessage'
import ErrorMessages from '@/src/components/UiRelated/ErrorMessages'
import ContentSection from '@/src/components/PagesRelated/ContentSection'
import FormBoundaryActions from '@/src/components/PagesRelated/FormBoundaryActions'
import DataDisplayBlock from '@/src/components/PagesRelated/DataDisplayBlock'
import Select from '@/src/components/UiRelated/Select'
import StatusBadge from '@/src/components/UiRelated/StatusBadge'
import FieldsGrid from '@/src/components/ContainerRelated/FieldsGrid'
import PageContainer from '@/src/components/ContainerRelated/PageContainer'
import PageHeader from '@/src/components/PagesRelated/PageHeader'
// Enums
import { LangEnum } from '@/src/enums/schemas.enum'
import { PermissionsEnum } from '@/src/enums/roles-permissions.enum'
import { StatusEnum } from '@/src/enums/ui.enum'
// Functions
import { formatTimestamp, hasPermission } from '@/src/utils/functions'
// Hooks
import { useUser } from '@/src/providers/UserProvider'
import { useSettings } from '@/src/providers/SettingsProvider'
// Types
import { LocaleType } from '@/src/types/i18n.type'
import { SettingsDocument } from '@/src/types/backend/documents.type'
import { BackendErrorResponse } from '@/src/types/backend/backend.responses.type'
import { UpdateSettingsRequest } from '@/src/types/backend/backend.requests.type'
// Style
import '@/src/styles/pages/(root)/settings/page.css'

export default function SettingsPage() {
    // Translations
    const t = useTranslations('SettingsPage')
    const tLang = useTranslations('LangEnum')
    const tActions = useTranslations('Actions')
    const tTech = useTranslations('SystemTechTerms')

    // From Providers
    const locale = useLocale() as LocaleType
    const { user, isLoadingProfile } = useUser()
    const {
        settings,
        isLoadingSettings,
        updateSettings,
        updateLogo,
        updateSecondaryLogo,
        updateWatermark,
    } = useSettings()

    // Page States
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | string[] | null>(null)
    const [toast, setToast] = useState<{
        message: string | string[]
        type: StatusEnum
    } | null>(null)

    // Settings States
    const [clinicNameEn, setClinicNameEn] = useState(
        settings?.clinicNameEn || ''
    )
    const [clinicNameAr, setClinicNameAr] = useState(
        settings?.clinicNameAr || ''
    )
    const [clinicAddress, setClinicAddress] = useState(
        settings?.clinicAddress || ''
    )
    const [clinicPhones, setClinicPhones] = useState<string[]>(
        settings?.clinicPhones || []
    )
    const [primaryLanguage, setPrimaryLanguage] = useState<LangEnum>(
        settings?.primaryLanguage || LangEnum.AR
    )
    const [aiAssistantEnabled, setAiAssistantEnabled] = useState(
        settings?.aiAssistantEnabled ?? true
    )

    // Core Logo URL and File state
    const [logoUrl, setLogoUrl] = useState<string>(settings?.logoUrl || '')
    const [logoFile, setLogoFile] = useState<File | null>(null)

    // Secondary Logo state
    const [secondaryLogoUrl, setSecondaryLogoUrl] = useState<string>(
        settings?.secondaryLogoUrl || ''
    )
    const [secondaryLogoFile, setSecondaryLogoFile] = useState<File | null>(
        null
    )

    // Watermark state
    const [watermarkUrl, setWatermarkUrl] = useState<string>(
        settings?.watermarkUrl || ''
    )
    const [watermarkFile, setWatermarkFile] = useState<File | null>(null)

    // Authorization Guard Check
    const canReadSettings = hasPermission(
        user,
        PermissionsEnum.SETTINGS,
        'canRead'
    )

    const canWriteSettings = hasPermission(
        user,
        PermissionsEnum.SETTINGS,
        'canWrite'
    )

    // Early Termination
    if (!canReadSettings) {
        return null
    }

    if (isLoadingSettings || isLoadingProfile) {
        return <Loading />
    }

    // Event Handlers
    const handleStartEditing = () => {
        if (!canWriteSettings) return
        setError(null)
        if (settings) {
            setClinicNameEn(settings.clinicNameEn || '')
            setClinicNameAr(settings.clinicNameAr || '')
            setClinicAddress(settings.clinicAddress || '')
            setClinicPhones(settings.clinicPhones || [])
            setPrimaryLanguage(settings.primaryLanguage || LangEnum.AR)
            setAiAssistantEnabled(settings.aiAssistantEnabled ?? true)
            setLogoUrl(settings.logoUrl || '')
            setLogoFile(null)
            setSecondaryLogoUrl(settings.secondaryLogoUrl || '')
            setSecondaryLogoFile(null)
            setWatermarkUrl(settings.watermarkUrl || '')
            setWatermarkFile(null)
        }
        setIsEditing(true)
    }

    const handleCancelEditing = () => {
        setIsEditing(false)
        setError(null)
    }

    const handleSaveChanges = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!canWriteSettings) return
        setError(null)
        setIsSaving(true)

        try {
            const requests: Promise<SettingsDocument>[] = []

            if (updateSettings) {
                const updatedPayload: UpdateSettingsRequest = {
                    primaryLanguage,
                    aiAssistantEnabled,
                    clinicPhones: clinicPhones.filter(
                        (phone) => phone.trim() !== ''
                    ),
                }

                if (clinicNameEn.trim())
                    updatedPayload.clinicNameEn = clinicNameEn.trim()
                if (clinicNameAr.trim())
                    updatedPayload.clinicNameAr = clinicNameAr.trim()
                if (clinicAddress.trim())
                    updatedPayload.clinicAddress = clinicAddress.trim()

                requests.push(updateSettings(updatedPayload))
            }

            if (logoFile && updateLogo) {
                requests.push(updateLogo(logoFile))
            }

            if (secondaryLogoFile && updateSecondaryLogo) {
                requests.push(updateSecondaryLogo(secondaryLogoFile))
            }

            if (watermarkFile && updateWatermark) {
                requests.push(updateWatermark(watermarkFile))
            }

            await Promise.all(requests)

            setToast({ message: t('updateSuccess'), type: StatusEnum.SUCCESS })
            setIsEditing(false)
        } catch (err) {
            const backendErr = err as BackendErrorResponse
            setError(backendErr.message)
        } finally {
            setIsSaving(false)
        }
    }

    const handlePhoneChange = (index: number, value: string) => {
        const updatedPhones = [...clinicPhones]
        updatedPhones[index] = value
        setClinicPhones(updatedPhones)
    }

    const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setLogoFile(file)

            const reader = new FileReader()
            reader.onloadend = () => {
                setLogoUrl(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSecondaryLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSecondaryLogoFile(file)

            const reader = new FileReader()
            reader.onloadend = () => {
                setSecondaryLogoUrl(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleWatermarkChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setWatermarkFile(file)

            const reader = new FileReader()
            reader.onloadend = () => {
                setWatermarkUrl(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const addPhoneField = () => setClinicPhones([...clinicPhones, ''])
    const removePhoneField = (index: number) =>
        setClinicPhones(clinicPhones.filter((_, idx) => idx !== index))

    return (
        <PageContainer id='settings-page'>
            <PageHeader
                title={t('title')}
                subtitle={t('subtitle')}
                Icon={FiSettings}
                noBorder
            />

            {error && <ErrorMessages messages={error} />}

            {/* Settings Form */}
            <form onSubmit={handleSaveChanges}>
                <ContentSection>
                    <FormBoundaryActions
                        title={t('sectionTitle')}
                        position='top'
                        isEditing={isEditing}
                        isSaving={isSaving}
                        hideControls={!canWriteSettings}
                        onStartEditAction={handleStartEditing}
                        onCancelEditAction={handleCancelEditing}
                    />

                    <FieldsGrid>
                        {/* Primary Logo */}
                        <DataDisplayBlock
                            label={t('logoUrl')}
                            isEditing={isEditing}
                            viewValue={
                                settings?.logoUrl && (
                                    <div className='settings-image-preview-container'>
                                        <Image
                                            src={settings.logoUrl}
                                            alt={t('logoUrl')}
                                            className='settings-image-preview'
                                            width={100}
                                            height={100}
                                        />
                                    </div>
                                )
                            }
                            editInput={
                                <div className='settings-image-edit-container'>
                                    {logoUrl && (
                                        <div className='settings-image-preview-container mb-2'>
                                            <Image
                                                src={logoUrl}
                                                alt='Preview'
                                                className='settings-image-preview'
                                                width={100}
                                                height={100}
                                            />
                                        </div>
                                    )}
                                    <input
                                        type='file'
                                        accept='image/*'
                                        onChange={handleLogoChange}
                                        disabled={isSaving}
                                        className='text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200 cursor-pointer'
                                    />
                                </div>
                            }
                        />

                        {/* Secondary Logo */}
                        <DataDisplayBlock
                            label={t('secondaryLogoUrl')}
                            isEditing={isEditing}
                            viewValue={
                                settings?.secondaryLogoUrl && (
                                    <div className='settings-image-preview-container'>
                                        <Image
                                            src={settings.secondaryLogoUrl}
                                            alt={t('secondaryLogoUrl')}
                                            className='settings-image-preview'
                                            width={100}
                                            height={100}
                                        />
                                    </div>
                                )
                            }
                            editInput={
                                <div className='settings-image-edit-container'>
                                    {secondaryLogoUrl && (
                                        <div className='settings-image-preview-container mb-2'>
                                            <Image
                                                src={secondaryLogoUrl}
                                                alt='Preview'
                                                className='settings-image-preview'
                                                width={100}
                                                height={100}
                                            />
                                        </div>
                                    )}
                                    <input
                                        type='file'
                                        accept='image/*'
                                        onChange={handleSecondaryLogoChange}
                                        disabled={isSaving}
                                        className='text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200 cursor-pointer'
                                    />
                                </div>
                            }
                        />

                        {/* Watermark Logo */}
                        <DataDisplayBlock
                            label={t('watermarkUrl')}
                            isEditing={isEditing}
                            fullWidth
                            viewValue={
                                settings?.watermarkUrl && (
                                    <div className='settings-image-preview-container'>
                                        <Image
                                            src={settings.watermarkUrl}
                                            alt={t('watermarkUrl')}
                                            className='settings-image-preview'
                                            width={100}
                                            height={100}
                                        />
                                    </div>
                                )
                            }
                            editInput={
                                <div className='settings-image-edit-container'>
                                    {watermarkUrl && (
                                        <div className='settings-image-preview-container mb-2'>
                                            <Image
                                                src={watermarkUrl}
                                                alt='Preview'
                                                className='settings-image-preview'
                                                width={100}
                                                height={100}
                                            />
                                        </div>
                                    )}
                                    <input
                                        type='file'
                                        accept='image/*'
                                        onChange={handleWatermarkChange}
                                        disabled={isSaving}
                                        className='text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200 cursor-pointer'
                                    />
                                </div>
                            }
                        />

                        <DataDisplayBlock
                            label={t('clinicNameEn')}
                            isEditing={isEditing}
                            viewValue={settings?.clinicNameEn}
                            editInput={
                                <Input
                                    value={clinicNameEn}
                                    onChangeAction={(val) =>
                                        setClinicNameEn(val)
                                    }
                                    placeholder={t('clinicNameEnPlaceholder')}
                                    disabled={isSaving}
                                />
                            }
                        />

                        <DataDisplayBlock
                            label={t('clinicNameAr')}
                            isEditing={isEditing}
                            viewValue={settings?.clinicNameAr}
                            editInput={
                                <Input
                                    value={clinicNameAr}
                                    onChangeAction={(val) =>
                                        setClinicNameAr(val)
                                    }
                                    placeholder={t('clinicNameArPlaceholder')}
                                    disabled={isSaving}
                                />
                            }
                        />

                        <DataDisplayBlock
                            label={t('clinicAddress')}
                            isEditing={isEditing}
                            viewValue={settings?.clinicAddress}
                            editInput={
                                <Input
                                    value={clinicAddress}
                                    onChangeAction={(val) =>
                                        setClinicAddress(val)
                                    }
                                    placeholder={t('clinicAddressPlaceholder')}
                                    disabled={isSaving}
                                />
                            }
                        />

                        <DataDisplayBlock
                            label={t('primaryLanguage')}
                            isEditing={isEditing}
                            viewValue={
                                settings?.primaryLanguage === LangEnum.EN
                                    ? tLang(LangEnum.EN)
                                    : tLang(LangEnum.AR)
                            }
                            editInput={
                                <Select
                                    value={primaryLanguage}
                                    onChangeAction={(val) =>
                                        setPrimaryLanguage(val as LangEnum)
                                    }
                                    disabled={isSaving}
                                    options={[
                                        {
                                            value: LangEnum.AR,
                                            label: tLang(LangEnum.AR),
                                        },
                                        {
                                            value: LangEnum.EN,
                                            label: tLang(LangEnum.EN),
                                        },
                                    ]}
                                />
                            }
                        />

                        <DataDisplayBlock
                            label={t('aiAssistant')}
                            isEditing={isEditing}
                            fullWidth
                            viewValue={
                                <StatusBadge
                                    text={
                                        (settings?.aiAssistantEnabled ?? true)
                                            ? tActions('enabled')
                                            : tActions('disabled')
                                    }
                                    variant={
                                        (settings?.aiAssistantEnabled ?? true)
                                            ? StatusEnum.SUCCESS
                                            : StatusEnum.ERROR
                                    }
                                />
                            }
                            editInput={
                                <Toggle
                                    id='aiAssistantToggle'
                                    checked={aiAssistantEnabled}
                                    onChangeAction={(val) =>
                                        setAiAssistantEnabled(val)
                                    }
                                    disabled={isSaving}
                                />
                            }
                        />

                        <DataDisplayBlock
                            label={t('clinicPhones')}
                            isEditing={isEditing}
                            fullWidth
                            viewValue={
                                settings?.clinicPhones &&
                                settings.clinicPhones.length > 0 ? (
                                    <div
                                        className='settings-phones-viewing-row'
                                        dir='ltr'
                                    >
                                        {settings.clinicPhones.map(
                                            (phone, idx) => (
                                                <span
                                                    key={idx}
                                                    className='settings-phone-pill'
                                                >
                                                    {phone}
                                                </span>
                                            )
                                        )}
                                    </div>
                                ) : (
                                    ''
                                )
                            }
                            editInput={
                                <div
                                    className='settings-phones-editing-stack'
                                    dir='ltr'
                                >
                                    {clinicPhones.map((phone, idx) => (
                                        <div
                                            key={idx}
                                            className='settings-phone-row-input'
                                        >
                                            <Input
                                                value={phone}
                                                onChangeAction={(val) =>
                                                    handlePhoneChange(idx, val)
                                                }
                                                placeholder={t(
                                                    'phonePlaceholder'
                                                )}
                                                disabled={isSaving}
                                                className='text-left'
                                            />
                                            <Button
                                                Icon={FiTrash2}
                                                variant='destructive-light'
                                                type='button'
                                                onClick={() =>
                                                    removePhoneField(idx)
                                                }
                                                disabled={isSaving}
                                            />
                                        </div>
                                    ))}
                                    <Button
                                        label={t('addPhone')}
                                        variant='normal-light'
                                        type='button'
                                        onClick={addPhoneField}
                                        disabled={isSaving}
                                        className='w-fit mt-1'
                                    />
                                </div>
                            }
                        />

                        <DataDisplayBlock
                            label={tTech('createdAt')}
                            isLocked
                            viewValue={formatTimestamp(
                                locale,
                                settings?.createdAt,
                                'relative'
                            )}
                        />

                        <DataDisplayBlock
                            label={tTech('updatedAt')}
                            isLocked
                            viewValue={formatTimestamp(
                                locale,
                                settings?.updatedAt,
                                'relative'
                            )}
                        />
                    </FieldsGrid>

                    <FormBoundaryActions
                        position='bottom'
                        isEditing={isEditing}
                        isSaving={isSaving}
                        hideControls={!canWriteSettings}
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
