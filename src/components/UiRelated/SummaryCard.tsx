// Functions
import { renderClasses } from '@/src/utils/functions'
// Types
import { SummaryCardProps } from '@/src/types/props.type'
// Style
import '@/src/styles/components/UiRelated/SummaryCard.css'

export default function SummaryCard({
    label,
    value,
    Icon,
    className = '',
}: SummaryCardProps) {
    const summaryCardClassName = renderClasses(
        'summary-card-container',
        className
    )

    return (
        <div className={summaryCardClassName}>
            <div className='summary-card-icon-wrapper'>
                <Icon />
            </div>
            <div className='summary-card-info'>
                <span className='summary-card-label'>{label}</span>
                <h3 className='summary-card-value'>{value}</h3>
            </div>
        </div>
    )
}
