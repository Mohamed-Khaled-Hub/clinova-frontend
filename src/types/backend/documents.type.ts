// Enums
import {
    LangEnum,
    GenderEnum,
    MaritalStatusEnum,
    ReferralEnum,
    PaymentMethodEnum,
    ExpenseCategoryEnum,
    FinancialStatusEnum,
    VisitCategoryEnum,
    NoteCategoryEnum,
} from '@/src/enums/schemas.enum'
// Types
import { CustomFieldsType } from '@/src/types/backend/schemas.type'

export type UserDocument = {
    _id: string
    username: string
    passwordHash: string
    roleId: string
    fullNameEn?: string
    fullNameAr?: string
    imageUrl?: string
    specializationEn?: string
    specializationAr?: string
    hashedRefreshToken: string | null
    customFields: Record<string, CustomFieldsType>
    createdAt: string
    updatedAt: string
}

export type PermissionDocument = {
    _id: string
    permissionKey: string
    createdAt: string
    updatedAt: string
}

export type RolePermissionSubDocument = {
    permissionId: string
    canRead: boolean
    canWrite: boolean
}

export type RoleDocument = {
    _id: string
    roleName: string
    permissions: RolePermissionSubDocument[]
    createdAt: string
    updatedAt: string
}

export type SettingsDocument = {
    _id: string
    clinicNameEn?: string
    clinicNameAr?: string
    clinicAddress?: string
    clinicPhones: string[]
    primaryLanguage: LangEnum
    aiAssistantEnabled: boolean
    logoUrl?: string
    secondaryLogoUrl?: string
    watermarkUrl?: string
    customFields: Record<string, CustomFieldsType>
    createdAt: string
    updatedAt: string
}

export type PriceCatalogDocument = {
    _id: string
    visitType: VisitCategoryEnum
    basePrice: number
    isPriceFlexible: boolean
    customFields: Record<string, CustomFieldsType>
    createdAt: string
    updatedAt: string
}

export type PatientDocument = {
    _id: string
    fullNameEn: string
    fullNameAr: string
    dob: string
    phone: string
    gender: GenderEnum
    nationality: string
    maritalStatus: MaritalStatusEnum
    referralSource: ReferralEnum
    notes?: string
    customFields: Record<string, CustomFieldsType>
    createdAt: string
    updatedAt: string
}

export type ExpenseDocument = {
    _id: string
    expenseCategory: ExpenseCategoryEnum
    expenseAmount: number
    expenseDate: string
    paymentMethod: PaymentMethodEnum
    status: FinancialStatusEnum
    notes?: string
    recordedByUserId: string | null
    customFields: Record<string, CustomFieldsType>
    createdAt: string
    updatedAt: string
}

export type VisitNoteSubDocument = {
    category: NoteCategoryEnum
    noteText: string
    contentDate: string | null
    highlightColor: string | null
}

export type VisitDocument = {
    _id: string
    patientId: string
    doctorId: string
    visitDate: string
    visitType: VisitCategoryEnum
    visitTypeOtherDescription?: string
    height?: number
    weight?: number
    bloodPressure?: string
    nextVisitDate: string
    nextVisitType: VisitCategoryEnum
    nextVisitTypeOtherDescription?: string
    notes: VisitNoteSubDocument[]
    customFields: Record<string, CustomFieldsType>
    createdAt: string
    updatedAt: string
}

export type RevenueDocument = {
    _id: string
    visitId: string
    transactionAmount: number
    discountAmount: number
    finalAmount: number
    paymentMethod: PaymentMethodEnum
    status: FinancialStatusEnum
    transactionDate: string
    notes?: string
    recordedByUserId: string | null
    customFields: Record<string, CustomFieldsType>
    createdAt: string
    updatedAt: string
}
