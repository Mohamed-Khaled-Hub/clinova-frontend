// Enums
import {
    VisitCategoryEnum,
    ExpenseCategoryEnum,
    NoteCategoryEnum,
} from '@/src/enums/schemas.enum'
import { IntervalEnum } from '@/src/enums/finance.enum'
// Types
import {
    LoginRequest,
    RefreshRequest,
    ChangePasswordRequest,
    UpdateUserRequest,
    CreateUserRequest,
    UpdateUserRoleRequest,
    UpdateSettingsRequest,
    CreatePriceCatalogRequest,
    UpdatePriceCatalogRequest,
    CreatePatientRequest,
    UpdatePatientRequest,
    CreateExpenseRequest,
    UpdateExpenseRequest,
    CreateRoleRequest,
    UpdateRoleRequest,
    AddPermissionsRequest,
    RemovePermissionsRequest,
    CreateVisitRequest,
    UpdateVisitRequest,
    CreateRevenueRequest,
    UpdateRevenueRequest,
    CreatePermissionRequest,
    UpdatePermissionRequest,
} from '@/src/types/backend/backend.requests.type'
import {
    ExpenseResponse,
    MessageResponse,
    UserResponse,
    RoleResponse,
    VisitResponse,
    RevenueResponse,
    FinanceGetSummaryResponse,
    FinanceGetTimelineResponse,
    FinanceGetRevenueByCategoryResponse,
    FinanceGetExpensesByCategoryResponse,
    PrescriptionResponse,
    LabRequestResponse,
    RadiologyRequestResponse,
} from '@/src/types/backend/backend.responses.type'
import {
    SettingsDocument,
    PriceCatalogDocument,
    PatientDocument,
    PermissionDocument,
} from '@/src/types/backend/documents.type'

export type AuthContextType = {
    login: (loginData: LoginRequest) => Promise<void>
    refreshToken: (refreshData: RefreshRequest) => Promise<void>
    changePassword: (
        changePasswordData: ChangePasswordRequest
    ) => Promise<MessageResponse>
}

export type UserContextType = {
    user: UserResponse | null
    isLoggedIn: boolean
    isLoadingProfile: boolean
    getMe: () => Promise<UserResponse>
    updateMe: (updateUserData: UpdateUserRequest) => Promise<UserResponse>
    updateMyAvatar: (file: File) => Promise<UserResponse>
    createUser: (createUserData: CreateUserRequest) => Promise<UserResponse>
    getUsers: () => Promise<UserResponse[]>
    getUserById: (id: string) => Promise<UserResponse>
    getUserByUsername: (username: string) => Promise<UserResponse>
    getDoctors: () => Promise<UserResponse[]>
    updateUser: (
        id: string,
        updateUserData: UpdateUserRequest
    ) => Promise<UserResponse>
    updateUserRole: (
        id: string,
        updateRoleData: UpdateUserRoleRequest
    ) => Promise<UserResponse>
    deleteUser: (id: string) => Promise<MessageResponse>
    logout: () => void
    fetchUser: () => Promise<UserResponse | null>
}

export type SettingsContextType = {
    settings: SettingsDocument | null
    isLoadingSettings: boolean
    getSettings: () => Promise<SettingsDocument>
    updateSettings: (
        updateSettingsData: UpdateSettingsRequest
    ) => Promise<SettingsDocument>
    updateLogo: (file: File) => Promise<SettingsDocument>
    updateSecondaryLogo: (file: File) => Promise<SettingsDocument>
    updateWatermark: (file: File) => Promise<SettingsDocument>
}

export type PriceCatalogContextType = {
    getCatalog: () => Promise<PriceCatalogDocument[]>
    createCatalog: (
        createCatalogData: CreatePriceCatalogRequest
    ) => Promise<PriceCatalogDocument>
    getCatalogById: (id: string) => Promise<PriceCatalogDocument>
    getCatalogByVisitType: (
        visitType: VisitCategoryEnum
    ) => Promise<PriceCatalogDocument>
    getPriceByVisitType: (visitType: VisitCategoryEnum) => Promise<number>
    updateCatalog: (
        id: string,
        updateCatalogData: UpdatePriceCatalogRequest
    ) => Promise<PriceCatalogDocument>
    deleteCatalog: (id: string) => Promise<void>
}

export type PatientContextType = {
    getPatients: () => Promise<PatientDocument[]>
    getPatientById: (id: string) => Promise<PatientDocument>
    getPatientsByDate: (date: string) => Promise<PatientDocument[]>
    searchPatients: (term?: string) => Promise<PatientDocument[]>
    createPatient: (
        createPatientData: CreatePatientRequest
    ) => Promise<PatientDocument>
    updatePatient: (
        id: string,
        updatePatientData: UpdatePatientRequest
    ) => Promise<PatientDocument>
    deletePatient: (id: string) => Promise<void>
}

export type ExpenseContextType = {
    getExpenses: () => Promise<ExpenseResponse[]>
    createExpense: (
        createExpenseData: CreateExpenseRequest
    ) => Promise<ExpenseResponse>
    getExpenseById: (id: string) => Promise<ExpenseResponse>
    getExpensesByCategory: (
        category: ExpenseCategoryEnum
    ) => Promise<ExpenseResponse[]>
    updateExpense: (
        id: string,
        updateExpenseData: UpdateExpenseRequest
    ) => Promise<ExpenseResponse>
    deleteExpense: (id: string) => Promise<void>
}

export type RoleContextType = {
    getRoles: () => Promise<RoleResponse[]>
    createRole: (createRoleData: CreateRoleRequest) => Promise<RoleResponse>
    getRoleById: (id: string) => Promise<RoleResponse>
    updateRole: (
        id: string,
        updateRoleData: UpdateRoleRequest
    ) => Promise<RoleResponse>
    addPermissions: (
        id: string,
        addPermissionsData: AddPermissionsRequest
    ) => Promise<RoleResponse>
    removePermissions: (
        id: string,
        removePermissionsData: RemovePermissionsRequest
    ) => Promise<RoleResponse>
    deleteRole: (id: string) => Promise<void>
}

export type VisitContextType = {
    getVisits: () => Promise<VisitResponse[]>
    createVisit: (createVisitData: CreateVisitRequest) => Promise<VisitResponse>
    getNotesSuggestions: (
        search?: string,
        category?: NoteCategoryEnum
    ) => Promise<string[]>
    getVisitById: (id: string) => Promise<VisitResponse>
    getVisitsByPatientId: (patientId: string) => Promise<VisitResponse[]>
    getVisitsByDate: (date: string) => Promise<VisitResponse[]>
    updateVisit: (
        id: string,
        updateVisitData: UpdateVisitRequest
    ) => Promise<VisitResponse>
    deleteVisit: (id: string) => Promise<void>
}

export type RevenueContextType = {
    getRevenues: () => Promise<RevenueResponse[]>
    createRevenue: (
        createRevenueData: CreateRevenueRequest
    ) => Promise<RevenueResponse>
    getRevenueById: (id: string) => Promise<RevenueResponse>
    getRevenueByVisitId: (visitId: string) => Promise<RevenueResponse>
    updateRevenue: (
        id: string,
        updateRevenueData: UpdateRevenueRequest
    ) => Promise<RevenueResponse>
    deleteRevenue: (id: string) => Promise<void>
}

export type PermissionContextType = {
    getPermissions: () => Promise<PermissionDocument[]>
    createPermission: (
        data: CreatePermissionRequest
    ) => Promise<PermissionDocument>
    getPermissionById: (id: string) => Promise<PermissionDocument>
    updatePermission: (
        id: string,
        data: UpdatePermissionRequest
    ) => Promise<PermissionDocument>
    deletePermission: (id: string) => Promise<void>
}

export type FinanceContextType = {
    getSummary: (
        startDate: string,
        endDate: string
    ) => Promise<FinanceGetSummaryResponse>
    getTimeline: (
        year: string,
        interval?: IntervalEnum
    ) => Promise<FinanceGetTimelineResponse[]>
    getRevenueByCategory: (
        startDate: string,
        endDate: string
    ) => Promise<FinanceGetRevenueByCategoryResponse[]>
    getExpensesByCategory: (
        startDate: string,
        endDate: string
    ) => Promise<FinanceGetExpensesByCategoryResponse[]>
}

export type MedicalDocumentsContextType = {
    getPrescription: (visitId: string) => Promise<PrescriptionResponse>
    getLabRequest: (visitId: string) => Promise<LabRequestResponse>
    getRadiologyRequest: (visitId: string) => Promise<RadiologyRequestResponse>
}
