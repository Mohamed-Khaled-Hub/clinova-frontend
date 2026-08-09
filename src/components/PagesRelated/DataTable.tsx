'use client'

// Core
import { useState, useMemo } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
// Components
import Button from '@/src/components/UiRelated/Button'
// Types
import { DataTableProps } from '@/src/types/props.type'
// Style
import '@/src/styles/components/PagesRelated/DataTable.css'

export default function DataTable<T>({
    data,
    columns,
    getRowKeyAction,
    onRowClickAction,
    emptyStateMessage,
    pageSize = 5,
}: DataTableProps<T>) {
    const [page, setPage] = useState<number>(1)

    // Variables
    const totalPages = Math.ceil(data.length / pageSize) || 1

    const currentPage = Math.min(page, totalPages)

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize
        return data.slice(startIndex, startIndex + pageSize)
    }, [data, currentPage, pageSize])

    if (data.length === 0) {
        return (
            <div className='table-empty'>
                <p>{emptyStateMessage}</p>
            </div>
        )
    }

    const startItem = (currentPage - 1) * pageSize + 1
    const endItem = Math.min(currentPage * pageSize, data.length)

    return (
        <div className='table-wrapper'>
            <div className='table-container'>
                <table className='data-table'>
                    <thead>
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx}>{col.header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((item) => (
                            <tr
                                key={getRowKeyAction(item)}
                                onClick={() => onRowClickAction?.(item)}
                                className={
                                    onRowClickAction
                                        ? 'table-row-interactive'
                                        : ''
                                }
                            >
                                {columns.map((col, idx) => (
                                    <td key={idx} className={col.cellClassName}>
                                        {col.renderCell(item)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls Footer */}
            {totalPages > 1 && (
                <div className='table-pagination'>
                    <span className='pagination-info'>
                        Showing <strong>{startItem}</strong> -{' '}
                        <strong>{endItem}</strong> of{' '}
                        <strong>{data.length}</strong>
                    </span>

                    <div className='pagination-actions'>
                        <Button
                            variant={'normal-light'}
                            Icon={FiChevronLeft}
                            onClick={() =>
                                setPage((prev) => Math.max(prev - 1, 1))
                            }
                            disabled={currentPage === 1}
                            aria-label='Previous page'
                        />

                        <span className='pagination-page-indicator'>
                            {currentPage} / {totalPages}
                        </span>

                        <Button
                            variant={'normal-light'}
                            Icon={FiChevronRight}
                            onClick={() =>
                                setPage((prev) =>
                                    Math.min(prev + 1, totalPages)
                                )
                            }
                            disabled={currentPage === totalPages}
                            aria-label='Next page'
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
