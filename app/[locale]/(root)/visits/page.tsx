'use client'

// Core
import { useEffect, useState } from 'react'
import { FiPlusCircle, FiCalendar, FiUser } from 'react-icons/fi'
import { FaStethoscope } from 'react-icons/fa'
import { useRouter } from '@/src/i18n/routing'
import { useTranslations, useLocale } from 'next-intl'
// Components
import Button from '@/src/components/UiRelated/Button'
import Loading from '@/src/components/UiRelated/Loading'
import PageHeader from '@/src/components/PagesRelated/PageHeader'
import PageContainer from '@/src/components/ContainerRelated/PageContainer'
import TableCell from '@/src/components/PagesRelated/TableCell'
import DataTable from '@/src/components/PagesRelated/DataTable'
// Enums
import { PermissionsEnum } from '@/src/enums/roles-permissions.enum'
// Functions
import { formatTimestamp, hasPermission } from '@/src/utils/functions'
// Hooks
import { useUser } from '@/src/providers/UserProvider'
import { useVisit } from '@/src/providers/VisitProvider'
// Types
import { LocaleType } from '@/src/types/i18n.type'
import { TableColumnType } from '@/src/types/ui.type'
import { VisitResponse } from '@/src/types/backend/backend.responses.type'
// Style
import '@/src/styles/pages/(root)/visits/page.css'

export default function VisitsPage() {
    // Translations
    const t = useTranslations('VisitsPage')
    const tPages = useTranslations('Pages')
    const tTech = useTranslations('SystemTechTerms')
    const tCategory = useTranslations('VisitCategoryEnum')

    // From Providers
    const router = useRouter()
    const locale = useLocale() as LocaleType
    const { getVisits } = useVisit()
    const { user, isLoadingProfile } = useUser()

    // Visits States
    const [visits, setVisits] = useState<VisitResponse[] | null>(null)
    const [isLoadingVisits, setIsLoadingVisits] = useState<boolean>(true)

    // Authorization Guard Check
    const canReadVisit = hasPermission(user, PermissionsEnum.VISIT, 'canRead')

    const canWriteVisit = hasPermission(user, PermissionsEnum.VISIT, 'canWrite')

    // Get Visits
    useEffect(() => {
        if (!canReadVisit) return

        let isMounted = true

        const fetchAllVisits = async () => {
            try {
                setIsLoadingVisits(true)
                const data = await getVisits()
                if (isMounted && data) {
                    setVisits(data)
                }
            } catch (err) {
                console.error('Failed to fetch visits:', err)
            } finally {
                if (isMounted) {
                    setIsLoadingVisits(false)
                }
            }
        }

        fetchAllVisits().then()

        return () => {
            isMounted = false
        }
    }, [getVisits, canReadVisit])

    // Early Termination
    if (isLoadingVisits || isLoadingProfile) {
        return <Loading />
    }

    if (!visits || !canReadVisit) {
        return null
    }

    // Table Column Config Matrix
    const tableColumns: TableColumnType<VisitResponse>[] = [
        {
            header: t('tablePatientCol'),
            renderCell: (visit: VisitResponse) => {
                const localizedPatientName =
                    locale === 'ar'
                        ? visit.patient.fullNameAr || visit.patient.fullNameEn
                        : visit.patient.fullNameEn || visit.patient.fullNameAr

                return <TableCell Icon={FiUser} value={localizedPatientName} />
            },
        },
        {
            header: t('tableCategoryCol'),
            renderCell: (visit: VisitResponse) => (
                <TableCell
                    Icon={FaStethoscope}
                    value={tCategory(visit.visitType)}
                />
            ),
        },
        {
            header: t('tableDoctorCol'),
            renderCell: (visit: VisitResponse) => {
                const localizedDoctorName =
                    locale === 'ar'
                        ? visit.doctor.fullNameAr || visit.doctor.fullNameEn
                        : visit.doctor.fullNameEn || visit.doctor.fullNameAr

                return (
                    <TableCell variant='subtext'>
                        {localizedDoctorName || visit.doctor.username}
                    </TableCell>
                )
            },
        },
        {
            header: t('tableDateCol'),
            renderCell: (visit: VisitResponse) => (
                <TableCell Icon={FiCalendar} variant='subtext'>
                    {formatTimestamp(locale, visit.visitDate, 'full')}
                </TableCell>
            ),
        },
        {
            header: t('tableTimestampsCol'),
            renderCell: (visit: VisitResponse) => (
                <TableCell variant='stacked'>
                    <div>
                        <span>{tTech('createdAt')}: </span>
                        {formatTimestamp(locale, visit.createdAt, 'relative')}
                    </div>
                    <div>
                        <span>{tTech('updatedAt')}: </span>
                        {formatTimestamp(locale, visit.updatedAt, 'relative')}
                    </div>
                </TableCell>
            ),
        },
    ]

    return (
        <PageContainer className='!max-w-7xl' id='visits-page'>
            <PageHeader
                title={t('title')}
                subtitle={t('subtitle')}
                action={
                    canWriteVisit ? (
                        <Button
                            href='/visits/create'
                            label={tPages('createVisit')}
                            Icon={FiPlusCircle}
                            variant='normal-dark'
                        />
                    ) : undefined
                }
                Icon={FaStethoscope}
                noBorder
            />

            <DataTable
                data={visits}
                columns={tableColumns}
                getRowKeyAction={(visit) => visit._id}
                onRowClickAction={(visit) =>
                    router.push(`/visits/${visit._id}`)
                }
                emptyStateMessage={t('noRecords')}
            />
        </PageContainer>
    )
}
