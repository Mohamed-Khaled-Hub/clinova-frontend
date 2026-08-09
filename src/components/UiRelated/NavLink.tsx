// Core
import { Link, usePathname } from '@/src/i18n/routing'
// Functions
import { renderClasses } from '@/src/utils/functions'
// Types
import { NavLinkProps } from '@/src/types/props.type'
// Style
import '@/src/styles/components/UiRelated/NavLink.css'

export default function NavLink({ href, label, Icon }: NavLinkProps) {
    const pathname = usePathname()

    const isActive = pathname === href

    return (
        <Link
            href={href}
            className={renderClasses('nav-item-link', isActive ? 'active' : '')}
        >
            <Icon className='nav-item-icon' />
            <span>{label}</span>
        </Link>
    )
}
