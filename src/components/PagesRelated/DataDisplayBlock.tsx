// Functions
import { renderClasses } from '@/src/utils/functions'
// Types
import { DataDisplayBlockProps } from '@/src/types/props.type'
// Style
import '@/src/styles/components/PagesRelated/DataDisplayBlock.css'

export default function DataDisplayBlock({
    label,
    isEditing,
    isLocked,
    fullWidth,
    editInput,
    viewValue,
    plain,
}: DataDisplayBlockProps) {
    if (plain) {
        if (isEditing && !isLocked) {
            return <>{editInput}</>
        }
        return <>{viewValue}</>
    }

    if (isEditing && !isLocked) {
        return (
            <div
                className={renderClasses(
                    'data-input-wrapper',
                    fullWidth ? 'data-full-width' : ''
                )}
            >
                {label && <span className='data-block-label'>{label}</span>}
                {editInput}
            </div>
        )
    }

    const hasValue =
        typeof viewValue === 'string' ? viewValue.trim() !== '' : !!viewValue

    return (
        <div
            className={renderClasses(
                'data-display-box',
                isLocked ? 'data-display-locked' : '',
                fullWidth ? 'data-full-width' : ''
            )}
        >
            {label && <span className='data-block-label'>{label}</span>}
            <div className='data-block-value'>
                {hasValue ? (
                    viewValue
                ) : (
                    <span className='data-block-fallback'>—</span>
                )}
            </div>
        </div>
    )
}
