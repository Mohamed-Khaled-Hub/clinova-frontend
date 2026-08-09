// Enums
import {
    VisitCategoryEnum,
    ExpenseCategoryEnum,
    NoteCategoryEnum,
} from '@/src/enums/schemas.enum'
// Types
import {
    UserDocument,
    RoleDocument,
    PermissionDocument,
    ExpenseDocument,
    VisitDocument,
    PatientDocument,
    RevenueDocument,
} from '@/src/types/backend/documents.type'

export type BackendErrorResponse = {
    message: string | string[]
    path: string
    statusCode: number
    timestamp: Date
}
export type AsyncResponse<T> =
    | { data: T; error: null }
    | { data: null; error: BackendErrorResponse }

export type TokensResponse = {
    accessToken: string
    refreshToken: string
}

export type MessageResponse = {
    message: string
}

export type UserResponse = Omit<UserDocument, 'roleId'> & {
    role: Omit<
        Pick<RoleDocument, '_id' | 'roleName' | 'permissions'>,
        'permissions'
    > & {
        permissions: {
            permission: Pick<PermissionDocument, '_id' | 'permissionKey'>
            canRead: boolean
            canWrite: boolean
        }[]
    }
}

export type ExpenseResponse = Omit<ExpenseDocument, 'recordedByUserId'> & {
    recordedBy: Pick<
        UserDocument,
        '_id' | 'username' | 'fullNameEn' | 'fullNameAr'
    > | null
}

export type RoleResponse = Pick<
    RoleDocument,
    '_id' | 'roleName' | 'createdAt' | 'updatedAt'
> & {
    permissions: {
        permission: Pick<PermissionDocument, '_id' | 'permissionKey'>
        canRead: boolean
        canWrite: boolean
    }[]
}

export type VisitResponse = Omit<VisitDocument, 'patientId' | 'doctorId'> & {
    patient: Pick<PatientDocument, '_id' | 'fullNameEn' | 'fullNameAr'>
    doctor: Pick<UserDocument, '_id' | 'username' | 'fullNameEn' | 'fullNameAr'>
}

export type RevenueResponse = Omit<
    RevenueDocument,
    'visitId' | 'recordedByUserId'
> & {
    visit: Pick<VisitDocument, '_id' | 'visitDate' | 'visitType'> & {
        patient: Pick<PatientDocument, '_id' | 'fullNameEn' | 'fullNameAr'>
        doctor: Pick<
            UserDocument,
            '_id' | 'username' | 'fullNameEn' | 'fullNameAr'
        >
    }
    recordedBy: Pick<
        UserDocument,
        '_id' | 'username' | 'fullNameEn' | 'fullNameAr'
    > | null
}

export type FinanceGetSummaryResponse = {
    totalRevenue: number
    totalExpenses: number
    totalDiscounts: number
    netProfit: number
}

export type FinanceGetTimelineResponse = {
    period: string
    revenue: number
    expense: number
    netProfit: number
}

export type FinanceGetRevenueByCategoryResponse = {
    visitType: VisitCategoryEnum
    revenue: number
    percentage: number
}

export type FinanceGetExpensesByCategoryResponse = {
    expenseCategory: ExpenseCategoryEnum
    expense: number
    percentage: number
}

export type MedicalDocumentsData<
    T extends NoteCategoryEnum = NoteCategoryEnum,
> = {
    language: string
    clinic: {
        name: string | null
        clinicAddress: string | null
        clinicPhones: string[]
        logoUrl: string | null
        secondaryLogoUrl: string | null
        watermarkUrl: string | null
        doctorName: string
        specialization: string | null
    }
    patient: {
        name: string
        age: number
    }
    visit: {
        height: number | null
        weight: number | null
        bloodPressure: string | null
        visitDate: string | null
        nextVisitDate: string | null
        notes: {
            category: T
            noteText: string
            contentDate: string | null
            highlightColor: string | null
        }[]
    }
}

export type PrescriptionResponse = MedicalDocumentsData<
    NoteCategoryEnum.PRESCRIBED_MEDICATIONS | NoteCategoryEnum.DIAGNOSIS
>

export type LabRequestResponse = MedicalDocumentsData<
    NoteCategoryEnum.REQUESTED_LAB_TESTS | NoteCategoryEnum.DIAGNOSIS
>

export type RadiologyRequestResponse = MedicalDocumentsData<
    | NoteCategoryEnum.REQUESTED_RADIOLOGY
    | NoteCategoryEnum.COMPLAINT
    | NoteCategoryEnum.HISTORY
    | NoteCategoryEnum.DIAGNOSIS
>
