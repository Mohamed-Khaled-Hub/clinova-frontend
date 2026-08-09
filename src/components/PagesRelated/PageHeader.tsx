// Functions
import { renderClasses } from '@/src/utils/functions'
// Types
import { PageHeaderProps } from '@/src/types/props.type'
// Style
import '@/src/styles/components/PagesRelated/PageHeader.css'

export default function PageHeader({
    title,
    subtitle,
    Icon,
    action,
    noBorder,
}: PageHeaderProps) {
    return (
        <header
            className={renderClasses(
                'page-view-header',
                noBorder && 'page-view-header-flush'
            )}
        >
            <div className='page-header-identity'>
                {Icon && (
                    <div className='page-header-icon-badge'>
                        <Icon size={24} />
                    </div>
                )}
                <div className='page-header-details'>
                    <h1 className='page-header-title'>{title}</h1>
                    {subtitle && (
                        <p className='page-header-subtitle'>{subtitle}</p>
                    )}
                </div>
            </div>

            {action && <div className='page-header-actions'>{action}</div>}
        </header>
    )
}
