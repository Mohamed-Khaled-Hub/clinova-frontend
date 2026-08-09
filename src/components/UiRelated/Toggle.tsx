'use client'

// Types
import { ToggleProps } from '@/src/types/props.type'
// Style
import '@/src/styles/components/UiRelated/Toggle.css'

export default function Toggle({
    id,
    checked,
    onChangeAction,
    disabled = false,
    labelOn,
    labelOff,
}: ToggleProps) {
    return (
        <div className='toggle-wrapper'>
            <button
                type='button'
                id={id}
                role='switch'
                aria-checked={checked}
                disabled={disabled}
                onClick={() => onChangeAction(!checked)}
                className={`toggle-track ${
                    checked ? 'toggle-track-active' : 'toggle-track-inactive'
                }`}
            >
                <span
                    className={`toggle-thumb ${
                        checked
                            ? 'toggle-thumb-active'
                            : 'toggle-thumb-inactive'
                    }`}
                />
            </button>
            {labelOn && labelOff && (
                <label htmlFor={id} className='toggle-label'>
                    {checked ? labelOn : labelOff}
                </label>
            )}
        </div>
    )
}
