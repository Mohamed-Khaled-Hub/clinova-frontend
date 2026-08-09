'use client'

// Types
import { StatusBadgeProps } from '@/src/types/props.type'
// Variables
import { iconMap } from '@/src/constants/ui.constant'
// Style
import '@/src/styles/components/UiRelated/StatusBadge.css'

export default function StatusBadge({
    text,
    variant,
    className = '',
}: StatusBadgeProps) {
    const Icon = iconMap[variant]

    return (
        <div className={`status-badge-container ${className}`}>
            <span className={`indicator-badge variant-${variant}`}>
                {Icon && <Icon size={11} />}
                <span>{text}</span>
            </span>
        </div>
    )
}
