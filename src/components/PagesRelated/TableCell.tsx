// Types
import { TableCellProps } from '@/src/types/props.type'
// Style
import '@/src/styles/components/PagesRelated/TableCell.css'

export default function TableCell({
    Icon,
    variant = 'default',
    children,
    className = '',
    value,
}: TableCellProps) {
    let wrapperClass = 'cell-base'

    if (variant === 'numeric') wrapperClass = 'cell-numeric'
    if (variant === 'subtext') wrapperClass = 'cell-subtext'
    if (variant === 'stacked') wrapperClass = 'cell-stacked'

    const hasContent =
        (children !== undefined && children !== null) ||
        (value !== undefined && value !== null && value !== '')

    return (
        <div className={`${wrapperClass} ${className}`}>
            {hasContent ? (
                <>
                    {Icon && <Icon className='cell-decor-icon' size={14} />}
                    <div className='cell-content-body'>{children ?? value}</div>
                </>
            ) : (
                <span className='cell-empty'>—</span>
            )}
        </div>
    )
}
