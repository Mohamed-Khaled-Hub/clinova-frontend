// Core
import { useTranslations } from 'next-intl'
// Enums
import { RolesEnum } from '@/src/enums/roles-permissions.enum'
// Functions
import { renderClasses } from '@/src/utils/functions'
// Types
import { RoleChipProps } from '@/src/types/props.type'
// Style
import '@/src/styles/components/UiRelated/RoleChip.css'

const roleClasses: Record<RolesEnum, string> = {
    [RolesEnum.SUPER_ADMIN]: 'role-super-admin',
    [RolesEnum.ADMIN]: 'role-admin',
    [RolesEnum.DOCTOR]: 'role-doctor',
    [RolesEnum.RECEPTIONIST]: 'role-receptionist',
}

export default function RoleChip({
    role,
    variant = 'chip',
    className = '',
}: RoleChipProps) {
    const t = useTranslations('RolesEnum')
    const currentRoleClass = roleClasses[role] || 'role-default'

    if (variant === 'textOnly') {
        return (
            <span
                className={renderClasses(
                    'role-text-only',
                    currentRoleClass,
                    className
                )}
            >
                {t(role)}
            </span>
        )
    }

    return (
        <div
            className={renderClasses('role-chip', currentRoleClass, className)}
        >
            <span className='dot' />
            <span>{t(role)}</span>
        </div>
    )
}
