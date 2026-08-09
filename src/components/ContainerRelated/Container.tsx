// Functions
import { renderClasses } from '@/src/utils/functions'
// Types
import { ContainerProps } from '@/src/types/props.type'
// Style
import '@/src/styles/components/ContainerRelated/Container.css'

export default function Container({
    children,
    className,
    noPadding,
    addMargin,
}: ContainerProps) {
    return (
        <div
            className={renderClasses(
                'container',
                noPadding && 'no-padding',
                addMargin && 'margined',
                className
            )}
        >
            {children}
        </div>
    )
}
