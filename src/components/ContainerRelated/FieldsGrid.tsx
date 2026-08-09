// Core
import { PropsWithChildren } from 'react'
// Style
import '@/src/styles/components/ContainerRelated/FieldsGrid.css'

export default function FieldsGrid({ children }: PropsWithChildren) {
    return <div className='fields-grid'>{children}</div>
}
