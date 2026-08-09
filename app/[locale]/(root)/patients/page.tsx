'use client'

// Core
import { useRouter } from '@/src/i18n/routing'
import { useState, useEffect, KeyboardEvent } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import {
    FiPhone,
    FiHeart,
    FiAward,
    FiSearch,
    FiCalendar,
    FiPlusCircle,
} from 'react-icons/fi'
import { FaMars, FaUserInjured, FaVenus } from 'react-icons/fa'
// Components
import Input from '@/src/components/UiRelated/Input'
import Button from '@/src/components/UiRelated/Button'
import Loading from '@/src/components/UiRelated/Loading'
import TableCell from '@/src/components/PagesRelated/TableCell'
import DataTable from '@/src/components/PagesRelated/DataTable'
import PageHeader from '@/src/components/PagesRelated/PageHeader'
import PageContainer from '@/src/components/ContainerRelated/PageContainer'
// Enums
import { PermissionsEnum } from '@/src/enums/roles-permissions.enum'
// Functions
import { formatTimestamp, hasPermission } from '@/src/utils/functions'
// Hooks
import { useUser } from '@/src/providers/UserProvider'
import { usePatient } from '@/src/providers/PatientProvider'
// Types
import { LocaleType } from '@/src/types/i18n.type'
import { TableColumnType } from '@/src/types/ui.type'
import { PatientDocument } from '@/src/types/backend/documents.type'
// Style
import '@/src/styles/pages/(root)/patients/page.css'

export default function PatientsPage() {
    // Translations
    const t = useTranslations('PatientsPage')
    const tTech = useTranslations('SystemTechTerms')
    const tPages = useTranslations('Pages')
    const tGender = useTranslations('GenderEnum')
    const tMarital = useTranslations('MaritalStatusEnum')
    const tReferral = useTranslations('ReferralEnum')

    // From Providers
    const router = useRouter()
    const locale = useLocale() as LocaleType
    const { getPatients, searchPatients } = usePatient()
    const { user, isLoadingProfile } = useUser()

    // Page States
    const [patients, setPatients] = useState<PatientDocument[]>([])
    const [isLoadingPatients, setIsLoadingPatients] = useState<boolean>(true)
    const [searchQuery, setSearchQuery] = useState('')

    // Authorization Guard Checks
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

    // Get Patients
    useEffect(() => {
        let isMounted = true

        const fetchInitialPatients = async () => {
            try {
                setIsLoadingPatients(true)
                const data = await getPatients()
                if (isMounted && data) {
                    setPatients(data)
                }
            } catch (error) {
                console.error('Failed to fetch patients:', error)
            } finally {
                if (isMounted) {
                    setIsLoadingPatients(false)
                }
            }
        }

        fetchInitialPatients().then()

        return () => {
            isMounted = false
        }
    }, [getPatients])

    // Early Termination
    if (isLoadingPatients || isLoadingProfile) {
        return <Loading />
    }

    if (!patients || !canReadPatient) {
        return null
    }

    // Event Handlers
    const handleSearch = async () => {
        const value = searchQuery.trim()
        setIsLoadingPatients(true)
        try {
            if (!value) {
                const data = await getPatients()
                if (data) setPatients(data)
            } else {
                const data = await searchPatients(value)
                if (data) setPatients(data)
            }
        } catch (error) {
            console.error('Failed to search patients:', error)
        } finally {
            setIsLoadingPatients(false)
        }
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter') {
            handleSearch().then()
        }
    }

    // Table
    const tableColumns: TableColumnType<PatientDocument>[] = [
        {
            header: t('tableNameCol'),
            renderCell: (patient: PatientDocument) => {
                const isAr = locale === 'ar'
                const primaryName = isAr
                    ? patient.fullNameAr || patient.fullNameEn
                    : patient.fullNameEn || patient.fullNameAr

                const secondaryName = isAr
                    ? patient.fullNameEn
                    : patient.fullNameAr
                const showSecondary = patient.fullNameAr && patient.fullNameEn

                return (
                    <TableCell variant='stacked'>
                        <div>
                            <span>{primaryName}</span>
                        </div>
                        {showSecondary && <span>{secondaryName}</span>}
                    </TableCell>
                )
            },
        },
        {
            header: t('tablePhoneCol'),
            renderCell: (patient: PatientDocument) => (
                <TableCell Icon={FiPhone} variant='subtext'>
                    <div dir='ltr'>{patient.phone}</div>
                </TableCell>
            ),
        },
        {
            header: t('tableDobCol'),
            renderCell: (patient: PatientDocument) => (
                <TableCell
                    variant='subtext'
                    Icon={FiCalendar}
                    value={formatTimestamp(locale, patient.dob, 'dateOnly')}
                />
            ),
        },
        {
            header: t('tableGenderCol'),
            renderCell: (patient: PatientDocument) => (
                <TableCell
                    Icon={patient.gender === 'MALE' ? FaMars : FaVenus}
                    variant='subtext'
                    value={tGender(patient.gender)}
                />
            ),
        },
        {
            header: t('tableMaritalStatusCol'),
            renderCell: (patient: PatientDocument) => (
                <TableCell
                    Icon={FiHeart}
                    variant='subtext'
                    value={tMarital(patient.maritalStatus)}
                />
            ),
        },
        {
            header: t('tableReferralCol'),
            renderCell: (patient: PatientDocument) => (
                <TableCell
                    Icon={FiAward}
                    value={tReferral(patient.referralSource)}
                    variant='subtext'
                />
            ),
        },
        {
            header: t('tableTimestampsCol'),
            renderCell: (patient: PatientDocument) => (
                <TableCell variant='stacked' className='timestamp-stack'>
                    <div>
                        <span>{tTech('createdAt')}: </span>
                        {formatTimestamp(locale, patient.createdAt)}
                    </div>
                    <div>
                        <span>{tTech('updatedAt')}: </span>
                        {formatTimestamp(locale, patient.updatedAt)}
                    </div>
                </TableCell>
            ),
        },
    ]

    return (
        <PageContainer className='!max-w-7xl' id='patients-page'>
            <PageHeader
                title={t('title')}
                subtitle={t('subtitle')}
                action={
                    canWritePatient ? (
                        <Button
                            href='/patients/create'
                            label={tPages('createPatient')}
                            Icon={FiPlusCircle}
                            variant='normal-dark'
                        />
                    ) : undefined
                }
                Icon={FaUserInjured}
                noBorder
            />

            <div className='search-bar' onKeyDown={handleKeyDown}>
                <Input
                    id='patientSearch'
                    Icon={FiSearch}
                    value={searchQuery}
                    onChangeAction={setSearchQuery}
                    placeholder={t('searchPlaceholder')}
                />

                <Button
                    label={t('searchActionButton')}
                    Icon={FiSearch}
                    variant='normal-dark'
                    onClick={handleSearch}
                />
            </div>

            <DataTable
                data={patients}
                columns={tableColumns}
                getRowKeyAction={(patient) => patient._id}
                onRowClickAction={(patient) =>
                    router.push(`/patients/${patient._id}`)
                }
                emptyStateMessage={t('noRecords')}
            />
        </PageContainer>
    )
}
