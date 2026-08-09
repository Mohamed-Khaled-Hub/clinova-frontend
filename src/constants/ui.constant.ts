// Core
import {
    FiAlertCircle,
    FiCheckCircle,
    FiInfo,
    FiKey,
    FiShield,
    FiUsers,
    FiXCircle,
} from 'react-icons/fi'
// Enums
import { StatusEnum } from '@/src/enums/ui.enum'
// Types
import { TabKey } from '@/src/types/ui.type'

export const iconMap = {
    [StatusEnum.SUCCESS]: FiCheckCircle,
    [StatusEnum.ERROR]: FiXCircle,
    [StatusEnum.INFO]: FiInfo,
    [StatusEnum.WARNING]: FiAlertCircle,
}

export const TAB_CONFIGS = [
    { key: 'users' as TabKey, translationKey: 'usersTab', Icon: FiUsers },
    { key: 'roles' as TabKey, translationKey: 'rolesTab', Icon: FiKey },
    {
        key: 'permissions' as TabKey,
        translationKey: 'permissionsTab',
        Icon: FiShield,
    },
]

export const CHART_COLORS = [
    '#000000',
    '#86765d',
    '#318ce7',
    '#0b486b',
    '#272941',
    '#1cceb7',
    '#008080',
    '#1b4d3e',
    '#2c9c38',
    '#f0a830',
    '#ffa4e9',
    '#e95081',
    '#7b1e7a',
    '#841b2d',
]

export const LINE_COLORS = {
    totalRevenue: '#86765d',
    totalExpenses: '#318ce7',
    netProfit: '#000000',
}
