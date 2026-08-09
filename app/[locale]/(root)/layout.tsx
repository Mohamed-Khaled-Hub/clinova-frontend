// Core
import { PropsWithChildren } from 'react'
// Components
import Nav from '@/src/components/NavRelated/Nav'
import Main from '@/src/components/ContainerRelated/Main'

export default function RootLayout({ children }: PropsWithChildren) {
    return (
        <>
            <Nav />
            <Main navFixed>{children}</Main>
        </>
    )
}
