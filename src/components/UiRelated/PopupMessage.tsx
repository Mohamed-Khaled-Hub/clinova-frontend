'use client'

// Core
import { useEffect, useState } from 'react'
import { FiX } from 'react-icons/fi'
// Enums
import { StatusEnum } from '@/src/enums/ui.enum'
// Functions
import { renderClasses } from '@/src/utils/functions'
// Types
import { PopupMessageProps } from '@/src/types/props.type'
// Variables
import { iconMap } from '@/src/constants/ui.constant'
// Style
import '@/src/styles/components/UiRelated/PopupMessage.css'

export default function PopupMessage({
    message,
    type = StatusEnum.INFO,
    duration = 4000,
    onCloseAction,
}: PopupMessageProps) {
    const Icon = iconMap[type]
    const [isExiting, setIsExiting] = useState(false)

    useEffect(() => {
        if (!duration) return

        const animationDuration = 300

        const exitTimer = setTimeout(
            () => {
                setIsExiting(true)
            },
            Math.max(0, duration - animationDuration)
        )

        const closeTimer = setTimeout(() => {
            onCloseAction()
        }, duration)

        return () => {
            clearTimeout(exitTimer)
            clearTimeout(closeTimer)
        }
    }, [duration, onCloseAction])

    const handleManualClose = () => {
        setIsExiting(true)
        setTimeout(() => {
            onCloseAction()
        }, 300)
    }

    const renderMessages = () => {
        if (Array.isArray(message)) {
            return message.map((msg, idx) => (
                <p key={idx} className='popup-text-item'>
                    {msg}
                </p>
            ))
        }
        return <p className='popup-text-item'>{message}</p>
    }

    return (
        <div
            className={renderClasses(
                'popup-message',
                `popup-modifier-${type}`,
                isExiting ? 'popup-state-exit' : ''
            )}
            role='alert'
        >
            <div className='popup-icon-wrapper'>
                <Icon className='popup-status-icon' />
            </div>

            <div className='popup-content-zone'>{renderMessages()}</div>

            <button
                type='button'
                onClick={handleManualClose}
                className='popup-close-button'
                aria-label='Close notification'
            >
                <FiX className='popup-close-icon' />
            </button>
        </div>
    )
}
