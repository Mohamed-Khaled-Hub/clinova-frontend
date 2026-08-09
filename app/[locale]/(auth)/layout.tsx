// Core
import { PropsWithChildren } from 'react'
// Components
import Main from '@/src/components/ContainerRelated/Main'

export default function AuthLayout({ children }: PropsWithChildren) {
    return (
        <>
            <Main>{children}</Main>
        </>
    )
}
