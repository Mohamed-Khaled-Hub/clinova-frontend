// Functions
import { renderClasses } from '@/src/utils/functions'
// Types
import { ContentSectionProps } from '@/src/types/props.type'
// Style
import '@/src/styles/components/PagesRelated/ContentSection.css'

export default function ContentSection({
    children,
    className = '',
}: ContentSectionProps) {
    return (
        <div className={renderClasses('content-section-card', className)}>
            {children}
        </div>
    )
}
