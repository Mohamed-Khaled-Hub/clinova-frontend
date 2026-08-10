'use client'

// Core
import { useTranslations } from 'next-intl'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { FiCheck, FiDollarSign, FiEdit, FiX } from 'react-icons/fi'
// Components
import Button from '@/src/components/UiRelated/Button'
import Input from '@/src/components/UiRelated/Input'
import Toggle from '@/src/components/UiRelated/Toggle'
import PopupMessage from '@/src/components/UiRelated/PopupMessage'
import ErrorMessages from '@/src/components/UiRelated/ErrorMessages'
import Loading from '@/src/components/UiRelated/Loading'
import PageContainer from '@/src/components/ContainerRelated/PageContainer'
import TableCell from '@/src/components/PagesRelated/TableCell'
import DataTable from '@/src/components/PagesRelated/DataTable'
import StatusBadge from '@/src/components/UiRelated/StatusBadge'
import PageHeader from '@/src/components/PagesRelated/PageHeader'
import DataDisplayBlock from '@/src/components/PagesRelated/DataDisplayBlock'
// Enums
import { StatusEnum } from '@/src/enums/ui.enum'
import { PermissionsEnum } from '@/src/enums/roles-permissions.enum'
// Functions
import { hasPermission } from '@/src/utils/functions'
// Hooks
import { useUser } from '@/src/providers/UserProvider'
import { usePriceCatalog } from '@/src/providers/PriceCatalogProvider'
// Types
import { TableColumnType } from '@/src/types/ui.type'
import { PriceCatalogDocument } from '@/src/types/backend/documents.type'
import { BackendErrorResponse } from '@/src/types/backend/backend.responses.type'
import { UpdatePriceCatalogRequest } from '@/src/types/backend/backend.requests.type'
// Style
import '@/src/styles/pages/(root)/price-catalog/page.css'

export default function PriceCatalogPage() {
    // Translations
    const t = useTranslations('PriceCatalogPage')
    const tActions = useTranslations('Actions')
    const tCurrency = useTranslations('Currency')
    const tVisitTypes = useTranslations('VisitCategoryEnum')

    // From Providers
    const { getCatalog, updateCatalog } = usePriceCatalog()
    const { user, isLoadingProfile } = useUser()

    // Page States
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState<boolean>(false)
    const [error, setError] = useState<string | string[] | null>(null)
    const [toast, setToast] = useState<{
        message: string
        type: StatusEnum
    } | null>(null)

    // Catalog States
    const [catalog, setCatalog] = useState<PriceCatalogDocument[] | null>(null)
    const [isLoadingCatalog, setIsLoadingCatalog] = useState<boolean>(true)

    // Price Catalog Edit States
    const [basePrice, setBasePrice] = useState<string>('0')
    const [isPriceFlexible, setIsPriceFlexible] = useState<boolean>(false)

    // Authorization Guard Check
    const canReadCatalog = hasPermission(
        user,
        PermissionsEnum.PRICE_CATALOG,
        'canRead'
    )

    const canWriteCatalog = hasPermission(
        user,
        PermissionsEnum.PRICE_CATALOG,
        'canWrite'
    )

    // Fetch Catalog Effect
    useEffect(() => {
        if (!canReadCatalog) return

        let isMounted = true

        const fetchCatalogData = async () => {
            try {
                setIsLoadingCatalog(true)
                const data = await getCatalog()
                if (isMounted && data) {
                    setCatalog(data)
                }
            } catch (err) {
                const backendErr = err as BackendErrorResponse
                if (isMounted) {
                    setError(backendErr.message)
                }
            } finally {
                if (isMounted) {
                    setIsLoadingCatalog(false)
                }
            }
        }

        fetchCatalogData().then()

        return () => {
            isMounted = false
        }
    }, [getCatalog, canReadCatalog])

    // Event Handlers
    const handleStartEditing = useCallback(
        (id: string, basePrice: number, isPriceFlexible: boolean) => {
            if (!canWriteCatalog) return
            setError(null)
            setEditingId(id)
            setBasePrice(basePrice.toString())
            setIsPriceFlexible(isPriceFlexible)
        },
        [canWriteCatalog]
    )

    const handleCancelEditing = useCallback(() => {
        setEditingId(null)
        setError(null)
    }, [])

    const handleSaveChanges = useCallback(
        async (id: string) => {
            if (!canWriteCatalog) return

            const parsedPrice = parseFloat(basePrice)
            if (isNaN(parsedPrice) || parsedPrice < 0) {
                setError(t('invalidPrice'))
                return
            }

            setError(null)
            setIsSaving(true)

            try {
                const payload: UpdatePriceCatalogRequest = {
                    basePrice: parsedPrice,
                    isPriceFlexible,
                }

                const updatedItem = await updateCatalog(id, payload)

                setCatalog((prev) =>
                    prev
                        ? prev.map((item) =>
                              item._id === id
                                  ? {
                                        ...item,
                                        ...payload,
                                        ...(updatedItem || {}),
                                    }
                                  : item
                          )
                        : null
                )

                setToast({
                    message: t('updateSuccess'),
                    type: StatusEnum.SUCCESS,
                })
                setEditingId(null)
            } catch (err) {
                const backendErr = err as BackendErrorResponse
                setError(backendErr.message)
            } finally {
                setIsSaving(false)
            }
        },
        [basePrice, canWriteCatalog, isPriceFlexible, t, updateCatalog]
    )

    // Table Columns Definition
    const tableColumns = useMemo<
        TableColumnType<PriceCatalogDocument>[]
    >(() => {
        const columns: TableColumnType<PriceCatalogDocument>[] = [
            {
                header: t('thCategory'),
                renderCell: (item: PriceCatalogDocument) => {
                    const translatedVisitType = tVisitTypes.has(item.visitType)
                        ? tVisitTypes(item.visitType)
                        : item.visitType

                    return <TableCell>{translatedVisitType}</TableCell>
                },
            },
            {
                header: t('thPrice'),
                renderCell: (item: PriceCatalogDocument) => {
                    const isCurrentRowEditing = editingId === item._id
                    return (
                        <TableCell>
                            <DataDisplayBlock
                                plain
                                isEditing={isCurrentRowEditing}
                                isLocked={isSaving}
                                editInput={
                                    <div
                                        className='catalog-flex-center'
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Input
                                            value={basePrice}
                                            type='number'
                                            onChangeAction={(val) =>
                                                setBasePrice(val)
                                            }
                                            placeholder='0.00'
                                            disabled={isSaving}
                                            className='catalog-input'
                                        />
                                        <span>{tCurrency('egp')}</span>
                                    </div>
                                }
                                viewValue={
                                    <span>
                                        {item.basePrice.toFixed(2)}{' '}
                                        {tCurrency('egp')}
                                    </span>
                                }
                            />
                        </TableCell>
                    )
                },
            },
            {
                header: t('thFlexibility'),
                renderCell: (item: PriceCatalogDocument) => {
                    const isCurrentRowEditing = editingId === item._id
                    return (
                        <TableCell>
                            <div>
                                <DataDisplayBlock
                                    plain
                                    isEditing={isCurrentRowEditing}
                                    isLocked={isSaving}
                                    editInput={
                                        <div
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Toggle
                                                id={`flex-toggle-${item._id}`}
                                                checked={isPriceFlexible}
                                                onChangeAction={(val) =>
                                                    setIsPriceFlexible(val)
                                                }
                                                disabled={isSaving}
                                            />
                                        </div>
                                    }
                                    viewValue={
                                        <StatusBadge
                                            text={
                                                item.isPriceFlexible
                                                    ? t('flexibleActive')
                                                    : t('flexibleFixed')
                                            }
                                            variant={
                                                item.isPriceFlexible
                                                    ? StatusEnum.SUCCESS
                                                    : StatusEnum.ERROR
                                            }
                                        />
                                    }
                                />
                            </div>
                        </TableCell>
                    )
                },
            },
        ]

        if (canWriteCatalog) {
            columns.push({
                header: t('thActions'),
                cellClassName: 'catalog-actions-column',
                renderCell: (item: PriceCatalogDocument) => {
                    const isCurrentRowEditing = editingId === item._id
                    return (
                        <TableCell>
                            <div
                                className='catalog-flex-center'
                                onClick={(e) => e.stopPropagation()}
                            >
                                {isCurrentRowEditing ? (
                                    <>
                                        <Button
                                            variant='normal-dark'
                                            Icon={FiCheck}
                                            onClick={() =>
                                                handleSaveChanges(item._id)
                                            }
                                            disabled={isSaving}
                                        />
                                        <Button
                                            variant='normal-light'
                                            Icon={FiX}
                                            onClick={handleCancelEditing}
                                            disabled={isSaving}
                                        />
                                    </>
                                ) : (
                                    <Button
                                        label={tActions('edit')}
                                        variant='normal-light'
                                        Icon={FiEdit}
                                        disabled={editingId !== null}
                                        onClick={() =>
                                            handleStartEditing(
                                                item._id,
                                                item.basePrice,
                                                item.isPriceFlexible
                                            )
                                        }
                                    />
                                )}
                            </div>
                        </TableCell>
                    )
                },
            })
        }

        return columns
    }, [
        editingId,
        isSaving,
        basePrice,
        isPriceFlexible,
        canWriteCatalog,
        t,
        tActions,
        tCurrency,
        tVisitTypes,
        handleStartEditing,
        handleCancelEditing,
        handleSaveChanges,
    ])

    // Early Termination
    if (isLoadingCatalog || isLoadingProfile) {
        return <Loading />
    }

    if (!catalog || !canReadCatalog) {
        return null
    }

    return (
        <PageContainer id='catalog-page'>
            <PageHeader
                title={t('title')}
                subtitle={t('subtitle')}
                Icon={FiDollarSign}
                noBorder
            />

            {error && <ErrorMessages messages={error} />}

            <DataTable
                data={catalog}
                columns={tableColumns}
                getRowKeyAction={(item) => item._id}
                emptyStateMessage={t('noRecords')}
                onRowClickAction={(item) => {
                    if (editingId === item._id || !canWriteCatalog) return
                    handleStartEditing(
                        item._id,
                        item.basePrice,
                        item.isPriceFlexible
                    )
                }}
            />

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
