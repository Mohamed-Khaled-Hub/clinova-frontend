'use client'

// Core
import Image from 'next/image'
import { Link } from '@/src/i18n/routing'
import { GiTwoCoins } from 'react-icons/gi'
import { RiUserSettingsFill } from 'react-icons/ri'
import { useLocale, useTranslations } from 'next-intl'
import {
    FiDollarSign,
    FiGrid,
    FiLogOut,
    FiSettings,
    FiTrendingUp,
    FiUser,
} from 'react-icons/fi'
import { FaReceipt, FaStethoscope, FaUserInjured } from 'react-icons/fa'
// Components
import Logo from '@/src/components/UiRelated/Logo'
import Button from '@/src/components/UiRelated/Button'
import NavLink from '@/src/components/UiRelated/NavLink'
import RoleChip from '@/src/components/UiRelated/RoleChip'
import Container from '@/src/components/ContainerRelated/Container'
// Enums
import { PermissionsEnum, RolesEnum } from '@/src/enums/roles-permissions.enum'
// Functions
import {
    displayUserFullName,
    hasPermission,
    isAdmin,
    isSuperAdmin,
    stripHonorifics,
    userFullNameInitials,
} from '@/src/utils/functions'
// Hooks
import { useUser } from '@/src/providers/UserProvider'
// Types
import { LocaleType } from '@/src/types/i18n.type'
// Style
import '@/src/styles/components/NavRelated/Nav.css'

export default function Nav() {
    // Translations
    const t = useTranslations('NavComponent')
    const tPages = useTranslations('Pages')

    // From Providers
    const locale = useLocale() as LocaleType
    const { user, isLoggedIn, isLoadingProfile, logout } = useUser()

    // Authorization Guard Check
    const hasAdminAccess = isSuperAdmin(user) || isAdmin(user)

    // Variables
    const displayName = stripHonorifics(
        displayUserFullName(user, locale)
    ).split(' ')[0]
    const userInitials = userFullNameInitials(displayName)

    return (
        <nav className='navbar-container'>
            <Container addMargin>
                <div className='navbar-wrapper'>
                    <div className='navbar-top-row'>
                        <div className='brand-logo-zone'>
                            <Link href='/dashboard'>
                                <Logo />
                            </Link>
                        </div>

                        <div className='profile-identity-zone'>
                            {isLoggedIn && !isLoadingProfile ? (
                                <div className='user-profile-card'>
                                    <div className='user-meta-details'>
                                        <span className='welcome-label'>
                                            {t('welcome')}
                                        </span>
                                        <h4 className='user-display-name'>
                                            {displayName}
                                        </h4>
                                        {user?.role?.roleName && (
                                            <RoleChip
                                                role={
                                                    user.role
                                                        .roleName as RolesEnum
                                                }
                                                variant={'textOnly'}
                                                className={'text-sm'}
                                            />
                                        )}
                                    </div>

                                    <div className='user-avatar-circle'>
                                        {user?.imageUrl ? (
                                            <Image
                                                src={user.imageUrl}
                                                alt={displayName}
                                                width={40}
                                                height={40}
                                                className='user-avatar-img'
                                                priority
                                            />
                                        ) : (
                                            userInitials
                                        )}
                                    </div>
                                </div>
                            ) : (
                                !isLoadingProfile && (
                                    <Button
                                        href='/login'
                                        variant='normal-dark'
                                        label={t('login')}
                                    />
                                )
                            )}
                        </div>
                    </div>

                    <div className='navbar-bottom-row'>
                        <div className='navigation-links-group'>
                            <NavLink
                                href='/dashboard'
                                label={tPages('dashboard')}
                                Icon={FiGrid}
                            />

                            {hasAdminAccess && (
                                <NavLink
                                    href='/admin'
                                    label={tPages('admin')}
                                    Icon={RiUserSettingsFill}
                                />
                            )}

                            {!isLoadingProfile && (
                                <NavLink
                                    href='/profile'
                                    label={tPages('profile')}
                                    Icon={FiUser}
                                />
                            )}

                            {hasPermission(
                                user,
                                PermissionsEnum.PATIENT,
                                'canRead'
                            ) && (
                                <NavLink
                                    href='/patients'
                                    label={tPages('patients')}
                                    Icon={FaUserInjured}
                                />
                            )}

                            {hasPermission(
                                user,
                                PermissionsEnum.VISIT,
                                'canRead'
                            ) && (
                                <NavLink
                                    href='/visits'
                                    label={tPages('visits')}
                                    Icon={FaStethoscope}
                                />
                            )}

                            {hasPermission(
                                user,
                                PermissionsEnum.PRICE_CATALOG,
                                'canRead'
                            ) && (
                                <NavLink
                                    href='/price-catalog'
                                    label={tPages('priceCatalog')}
                                    Icon={FiDollarSign}
                                />
                            )}

                            {hasPermission(
                                user,
                                PermissionsEnum.FINANCE,
                                'canRead'
                            ) && (
                                <NavLink
                                    href='/finance'
                                    label={tPages('finance')}
                                    Icon={FiTrendingUp}
                                />
                            )}

                            {hasPermission(
                                user,
                                PermissionsEnum.EXPENSE,
                                'canRead'
                            ) && (
                                <NavLink
                                    href={'/finance/expenses'}
                                    label={tPages('expenses')}
                                    Icon={FaReceipt}
                                />
                            )}

                            {hasPermission(
                                user,
                                PermissionsEnum.REVENUE,
                                'canRead'
                            ) && (
                                <NavLink
                                    href={'/finance/revenues'}
                                    label={tPages('revenues')}
                                    Icon={GiTwoCoins}
                                />
                            )}

                            {hasPermission(
                                user,
                                PermissionsEnum.SETTINGS,
                                'canRead'
                            ) && (
                                <NavLink
                                    href='/settings'
                                    label={tPages('settings')}
                                    Icon={FiSettings}
                                />
                            )}
                        </div>

                        <div className='utility-actions-group'>
                            {isLoggedIn && !isLoadingProfile && (
                                <Button
                                    variant='destructive-light'
                                    Icon={FiLogOut}
                                    label={t('logout')}
                                    onClick={logout}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </Container>
        </nav>
    )
}
