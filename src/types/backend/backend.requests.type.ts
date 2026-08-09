// Types
import {
    ExpenseDocument,
    PatientDocument,
    PriceCatalogDocument,
    SettingsDocument,
    UserDocument,
    RoleDocument,
    VisitDocument,
    RevenueDocument,
    PermissionDocument,
} from '@/src/types/backend/documents.type'

// /auth
export type LoginRequest = {
    username: string
    password: string
}

export type RefreshRequest = {
    userId: string
    refreshToken: string
}

export type ChangePasswordRequest = {
    oldPassword: string
    newPassword: string
}

// /users
export type CreateUserRequest = LoginRequest &
    Pick<UserDocument, 'roleId'> &
    Partial<
        Pick<
            UserDocument,
            | 'fullNameEn'
            | 'fullNameAr'
            | 'imageUrl'
            | 'specializationEn'
            | 'specializationAr'
            | 'customFields'
        >
    >

export type UpdateUserRequest = Partial<
    Omit<CreateUserRequest, 'password' | 'roleId'>
>

export type UpdateUserRoleRequest = Pick<UserDocument, 'roleId'>

// /settings
export type UpdateSettingsRequest = Partial<
    Omit<SettingsDocument, '_id' | 'createdAt' | 'updatedAt'>
>

// /price-catalogs
export type CreatePriceCatalogRequest = Pick<
    PriceCatalogDocument,
    'visitType' | 'basePrice'
> &
    Partial<Pick<PriceCatalogDocument, 'isPriceFlexible' | 'customFields'>>

export type UpdatePriceCatalogRequest = Partial<
    Omit<CreatePriceCatalogRequest, 'visitType'>
>

// /patients
export type CreatePatientRequest = Pick<
    PatientDocument,
    'fullNameEn' | 'fullNameAr' | 'dob' | 'phone' | 'gender'
> &
    Partial<
        Pick<
            PatientDocument,
            | 'nationality'
            | 'maritalStatus'
            | 'referralSource'
            | 'notes'
            | 'customFields'
        >
    >

export type UpdatePatientRequest = Partial<CreatePatientRequest>

// /expenses
export type CreateExpenseRequest = Pick<
    ExpenseDocument,
    'expenseCategory' | 'expenseAmount'
> &
    Partial<
        Pick<
            ExpenseDocument,
            | 'expenseDate'
            | 'paymentMethod'
            | 'status'
            | 'notes'
            | 'customFields'
        >
    >

export type UpdateExpenseRequest = Partial<CreateExpenseRequest>

// /roles
export type CreateRoleRequest = Pick<RoleDocument, 'roleName' | 'permissions'>

export type UpdateRoleRequest = Pick<RoleDocument, 'roleName'>

export type AddPermissionsRequest = Pick<RoleDocument, 'permissions'>

export type RemovePermissionsRequest = {
    permissionIds: string[]
}

// /revenues
export type CreateRevenueRequest = Pick<RevenueDocument, 'visitId'> &
    Partial<
        Pick<
            RevenueDocument,
            | 'transactionAmount'
            | 'discountAmount'
            | 'paymentMethod'
            | 'status'
            | 'transactionDate'
            | 'notes'
            | 'customFields'
        >
    >

export type UpdateRevenueRequest = Partial<
    Omit<CreateRevenueRequest, 'visitId'>
>

// /visits
export type CreateVisitRequest = Pick<
    VisitDocument,
    'patientId' | 'doctorId' | 'visitType'
> &
    Partial<
        Omit<
            VisitDocument,
            | 'patientId'
            | 'doctorId'
            | 'visitType'
            | '_id'
            | 'createdAt'
            | 'updatedAt'
        >
    > & {
        revenueDetails?: Omit<CreateRevenueRequest, 'visitId'>
    }

export type UpdateVisitRequest = Partial<
    Omit<CreateVisitRequest, 'patientId' | 'doctorId' | 'revenueDetails'>
>

// /permissions
export type CreatePermissionRequest = Pick<PermissionDocument, 'permissionKey'>

export type UpdatePermissionRequest = Partial<CreatePermissionRequest>
