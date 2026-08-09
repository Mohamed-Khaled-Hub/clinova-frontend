// Fonts
import { logoFont } from '@/src/fonts/fonts'
// Style
import '@/src/styles/components/UiRelated/Logo.css'

export default function Logo() {
    return <p className={`${logoFont.className} logo`}>Clinova</p>
}
