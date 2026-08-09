// Core
import { IconType } from 'react-icons'
import {
    ReactNode,
    SubmitEvent,
    PropsWithChildren,
    AnchorHTMLAttributes,
    ButtonHTMLAttributes,
    InputHTMLAttributes,
    TextareaHTMLAttributes,
    ComponentPropsWithoutRef,
} from 'react'
// Enums
import { StatusEnum } from '@/src/enums/ui.enum'
import { RolesEnum } from '@/src/enums/roles-permissions.enum'
// Types
import { LocaleParamsProps } from '@/src/types/i18n.type'
import {
    ButtonVariant,
    SelectOptionType,
    TableColumnType,
    TabItem,
} from '@/src/types/ui.type'
import { VisitNoteSubDocument } from '@/src/types/backend/documents.type'
import { VisitResponse } from '@/src/types/backend/backend.responses.type'

export type LocaleAndChildrenProps = PropsWithChildren & LocaleParamsProps

export type ContainerProps = PropsWithChildren & {
    className?: string
    noPadding?: boolean
    addMargin?: boolean
}

export type MainProps = PropsWithChildren & {
    navFixed?: boolean
}

export type InputProps = {
    label?: string
    error?: string
    Icon?: IconType
    onChangeAction: (value: string) => void
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'>

export type ErrorMessagesProps = {
    messages: string | string[]
    variant?: 'box' | 'textOnly'
}

export type NavLinkProps = {
    href: string
    label: string
    Icon: IconType
}

export type ButtonBaseProps = {
    variant?: ButtonVariant
    fullWidth?: boolean
} & (
    | {
          Icon: IconType
          label?: string
      }
    | {
          Icon?: never
          label: string
      }
)

export type ButtonAsButtonProps = ButtonBaseProps &
    ButtonHTMLAttributes<HTMLButtonElement> & { href?: never }
export type ButtonAsLinkProps = ButtonBaseProps &
    AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps

export type PopupMessageProps = {
    message: string | string[]
    type?: StatusEnum
    duration?: number
    onCloseAction: () => void
}

export type RoleChipProps = {
    role: RolesEnum
    variant?: 'chip' | 'textOnly'
    className?: string
}

export type ToggleProps = {
    id: string
    checked: boolean
    onChangeAction: (checked: boolean) => void
    disabled?: boolean
    labelOn?: string
    labelOff?: string
}

export type IdPageProps = {
    params: Promise<{ id: string }>
}

export type ContentSectionProps = PropsWithChildren & {
    className?: string
}

export type FormBoundaryActionsProps = {
    title?: string
    position: 'top' | 'bottom'
    mode?: 'edit' | 'create'
    isEditing?: boolean
    isSaving?: boolean
    isDeleting?: boolean
    hideControls?: boolean
    onStartEditAction?: () => void
    onCancelEditAction?: () => void
    onCreateCancelAction?: () => void
    onDeleteAction?: () => void
}

export type DataDisplayBlockProps = {
    label?: string
    isEditing?: boolean
    isLocked?: boolean
    fullWidth?: boolean
    editInput?: ReactNode
    viewValue: ReactNode
    plain?: boolean
}

export type SelectProps = Omit<
    ComponentPropsWithoutRef<'select'>,
    'onChange'
> & {
    label?: string
    options: SelectOptionType[]
    placeholder?: string
    onChangeAction: (value: string) => void
}

export type StatusBadgeProps = {
    text: string
    variant: StatusEnum
    className?: string
}

export type PageContainerProps = PropsWithChildren & {
    id: string
    className?: string
    fullHeight?: boolean
    centerContent?: boolean
}

export type AuthLayoutShellProps = PropsWithChildren & {
    id: string
    titleNode: ReactNode
    subtitle: string
    error: string | string[] | null
    onSubmitAction: (e: SubmitEvent<HTMLFormElement>) => void
}

export type DataTableProps<T> = {
    data: T[]
    columns: TableColumnType<T>[]
    getRowKeyAction: (item: T) => string | number
    onRowClickAction?: (item: T) => void
    emptyStateMessage: string
    pageSize?: number
}

export type TableCellProps = PropsWithChildren & {
    Icon?: IconType
    variant?: 'default' | 'numeric' | 'subtext' | 'stacked'
    className?: string
    value?: string | number | null
}

export type FormFieldSetProps = PropsWithChildren & {
    legend: string
    columns?: 1 | 2 | 3
}

export type FormControlProps = PropsWithChildren & {
    id: string
    label: string
    required?: boolean
    span?: 1 | 2 | 3
}

export type TextAreaProps = {
    label?: string
    error?: string
    Icon?: IconType
    onChangeAction: (value: string) => void
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'>

export type PageHeaderProps = {
    title: string
    subtitle?: string
    Icon?: IconType
    action?: ReactNode
    noBorder?: boolean
}

export type ColorPickerProps = {
    label?: string
    error?: string
    onChangeAction: (value: string | null) => void
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & {
        value: string | null
    }

export type VisitNoteProps = {
    index: number
    note: VisitNoteSubDocument
    isSubmitting: boolean
    onNoteChangeAction: (
        index: number,
        key: keyof VisitNoteSubDocument,
        value: string | null
    ) => void
    onRemoveNoteAction: (index: number) => void
}

export type VisitsNotesViewListProps = {
    visits: VisitResponse | VisitResponse[]
    emptyMessage: string
}

export type TabsProps<T extends string> = {
    tabs: TabItem<T>[]
    activeTab: T
    onChangeAction: (key: T) => void
}

export type SummaryCardProps = {
    label: string
    value: string
    Icon: IconType
    className?: string
}
