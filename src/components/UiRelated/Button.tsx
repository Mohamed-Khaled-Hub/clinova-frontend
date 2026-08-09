'use client'

// Core
import { Link } from '@/src/i18n/routing'
// Functions
import { renderClasses } from '@/src/utils/functions'
// Types
import {
    ButtonProps,
    ButtonAsLinkProps,
    ButtonAsButtonProps,
} from '@/src/types/props.type'
// Style
import '@/src/styles/components/UiRelated/Button.css'

export default function Button({
    variant = 'normal-light',
    Icon,
    label,
    className = '',
    fullWidth = false,
    ...props
}: ButtonProps) {
    const disabled = 'disabled' in props ? Boolean(props.disabled) : false

    const combinedClassName = renderClasses(
        'custom-action-btn',
        `btn-${variant}`,
        fullWidth && 'btn-full-width',
        Icon && !label && 'icon-only-btn',
        disabled && 'btn-disabled',
        className
    )

    const innerContent = (
        <>
            {Icon && <Icon className='btn-action-icon' />}
            {label && <span>{label}</span>}
        </>
    )

    if ('href' in props && props.href) {
        const { href, ...linkProps } = props as ButtonAsLinkProps
        return (
            <Link href={href} className={combinedClassName} {...linkProps}>
                {innerContent}
            </Link>
        )
    }

    const buttonProps = props as ButtonAsButtonProps
    return (
        <button className={combinedClassName} {...buttonProps}>
            {innerContent}
        </button>
    )
}
