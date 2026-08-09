// Components
import Container from '@/src/components/ContainerRelated/Container'
// Functions
import { renderClasses } from '@/src/utils/functions'
// Types
import { MainProps } from '@/src/types/props.type'
// Style
import '@/src/styles/components/ContainerRelated/Main.css'

export default function Main({ children, navFixed }: MainProps) {
    return (
        <main
            className={renderClasses('main', navFixed && 'mt-(--nav-height)')}
        >
            <Container addMargin>{children}</Container>
        </main>
    )
}
