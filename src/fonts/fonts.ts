// Core
import { Noto_Kufi_Arabic, Outfit, Playfair_Display } from 'next/font/google'

export const logoFont = Outfit({
    weight: ['500'],
    subsets: ['latin'],
})

export const mainFont = Noto_Kufi_Arabic({
    weight: ['400', '500', '600', '700', '800', '900'],
})

export const rxSymbolFont = Playfair_Display({
    weight: ['700'],
    style: ['italic'],
    subsets: ['latin'],
})
