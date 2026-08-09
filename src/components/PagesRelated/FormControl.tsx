// Types
import { FormControlProps } from '@/src/types/props.type'
// Style
import '@/src/styles/components/PagesRelated/FormControl.css'

export default function FormControl({
    id,
    label,
    required = false,
    span,
    children,
}: FormControlProps) {
    const spanClassMap = {
        1: 'sm:col-span-1',
        2: 'sm:col-span-2',
        3: 'sm:col-span-3',
    }

    const colSpanClass = span ? spanClassMap[span] : ''

    return (
        <div className={`form-control ${colSpanClass}`}>
            <label htmlFor={id}>
                {label} {required && '*'}
            </label>
            {children}
        </div>
    )
}
