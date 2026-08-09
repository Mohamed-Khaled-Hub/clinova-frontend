// Core
import { ReactNode } from 'react'
import { IconType } from 'react-icons'

export type ButtonVariant =
    | 'normal-light'
    | 'normal-dark'
    | 'destructive-light'
    | 'destructive-dark'

export type DateFormatType = 'full' | 'dateOnly' | 'timeOnly'

export type SelectOptionType = {
    value: string | number
    label: string
}

export type TableColumnType<T> = {
    header: string
    renderCell: (item: T) => ReactNode
    cellClassName?: string
}

export type TabItem<T extends string> = {
    key: T
    label: string
    Icon?: IconType
}

export type TabKey = 'users' | 'roles' | 'permissions'
