// Functions
import { renderClasses } from '@/src/utils/functions'
// Types
import { PageContainerProps } from '@/src/types/props.type'
// Style
import '@/src/styles/components/ContainerRelated/PageContainer.css'

export default function PageContainer({
    id,
    children,
    className,
    fullHeight,
    centerContent,
}: PageContainerProps) {
    return (
        <div
            className={renderClasses(
                'page-container',
                fullHeight && 'full-height-page',
                centerContent && 'center-content-page',
                className
            )}
            id={id}
        >
            {children}
        </div>
    )
}
