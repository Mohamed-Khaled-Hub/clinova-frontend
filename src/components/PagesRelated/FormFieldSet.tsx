// Types
import { FormFieldSetProps } from '@/src/types/props.type'
// Style
import '@/src/styles/components/PagesRelated/FormFieldSet.css'

export default function FormFieldSet({
    legend,
    columns = 1,
    children,
}: FormFieldSetProps) {
    const gridClassMap = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-3',
    }

    return (
        <fieldset className='form-fieldset'>
            <legend className='form-legend'>{legend}</legend>
            <div className={`grid gap-4 w-full ${gridClassMap[columns]}`}>
                {children}
            </div>
        </fieldset>
    )
}
