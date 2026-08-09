// Core
import createMiddleware from 'next-intl/middleware'
import { NextRequest } from 'next/server'
// I18n
import { routing } from '@/src/i18n/routing'

const intlMiddleware = createMiddleware(routing)

export function proxy(request: NextRequest) {
    return intlMiddleware(request)
}

export const config = {
    matcher: ['/', '/(ar|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
}
