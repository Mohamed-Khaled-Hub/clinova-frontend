// Core
import { PropsWithChildren } from 'react'
// Providers
import AuthProvider from '@/src/providers/AuthProvider'
import UserProvider from '@/src/providers/UserProvider'
import SettingsProvider from '@/src/providers/SettingsProvider'
import PriceCatalogProvider from '@/src/providers/PriceCatalogProvider'
import PatientProvider from '@/src/providers/PatientProvider'
import ExpenseProvider from '@/src/providers/ExpenseProvider'
import RoleProvider from '@/src/providers/RoleProvider'
import VisitProvider from '@/src/providers/VisitProvider'
import RevenueProvider from '@/src/providers/RevenueProvider'
import PermissionProvider from '@/src/providers/PermissionProvider'
import FinanceProvider from '@/src/providers/FinanceProvider'
import MedicalDocumentsProvider from '@/src/providers/MedicalDocumentsProvider'

export default function AllProviders({ children }: PropsWithChildren) {
    return (
        <UserProvider>
            <AuthProvider>
                <RoleProvider>
                    <PermissionProvider>
                        <PatientProvider>
                            <SettingsProvider>
                                <PriceCatalogProvider>
                                    <VisitProvider>
                                        <ExpenseProvider>
                                            <RevenueProvider>
                                                <FinanceProvider>
                                                    <MedicalDocumentsProvider>
                                                        {children}
                                                    </MedicalDocumentsProvider>
                                                </FinanceProvider>
                                            </RevenueProvider>
                                        </ExpenseProvider>
                                    </VisitProvider>
                                </PriceCatalogProvider>
                            </SettingsProvider>
                        </PatientProvider>
                    </PermissionProvider>
                </RoleProvider>
            </AuthProvider>
        </UserProvider>
    )
}
