// Functions
import { renderClasses } from '@/src/utils/functions'
// Types
import { ErrorMessagesProps } from '@/src/types/props.type'
// Style
import '@/src/styles/components/UiRelated/ErrorMessages.css'

export default function ErrorMessages({
    messages,
    variant = 'box',
}: ErrorMessagesProps) {
    if (!messages || (Array.isArray(messages) && messages.length === 0))
        return null

    return (
        <div
            className={renderClasses(
                variant === 'box'
                    ? 'error-messages-box'
                    : 'error-messages-text-only'
            )}
        >
            {Array.isArray(messages) ? (
                <ul className='error-list'>
                    {messages.map((item, idx) => (
                        <li key={`error-${idx}`}>{item}</li>
                    ))}
                </ul>
            ) : (
                <p className='error-text'>{messages}</p>
            )}
        </div>
    )
}
