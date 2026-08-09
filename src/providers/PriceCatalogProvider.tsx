'use client'

// Core
import {
    PropsWithChildren,
    createContext,
    useContext,
    useCallback,
    useMemo,
} from 'react'
// Enums
import { EndpointsEnum } from '@/src/enums/endpoints.enum'
import { VisitCategoryEnum } from '@/src/enums/schemas.enum'
// Functions
import { catchBackendError } from '@/src/utils/functions'
// Types
import {
    CreatePriceCatalogRequest,
    UpdatePriceCatalogRequest,
} from '@/src/types/backend/backend.requests.type'
import { PriceCatalogContextType } from '@/src/types/contexts.type'
import { PriceCatalogDocument } from '@/src/types/backend/documents.type'
// Variables
import { api } from '@/src/utils/api'
import { endpoints } from '@/src/constants/server.constant'

// Context
export const PriceCatalogContext = createContext<PriceCatalogContextType>(
    {} as PriceCatalogContextType
)

// Hook
export const usePriceCatalog = () => {
    const context = useContext(PriceCatalogContext)
    if (!context) {
        throw new Error(
            'usePriceCatalog must be used within a PriceCatalogProvider'
        )
    }
    return context
}

// Provider
export default function PriceCatalogProvider({ children }: PropsWithChildren) {
    // GET /price-catalog
    const getCatalog = useCallback(async (): Promise<
        PriceCatalogDocument[]
    > => {
        const { data, error } = await catchBackendError(
            api.get<PriceCatalogDocument[]>(
                endpoints[EndpointsEnum.PRICE_CATALOG].root
            )
        )

        if (error) throw error
        return data
    }, [])

    // POST /price-catalog
    const createCatalog = useCallback(
        async (
            createCatalogData: CreatePriceCatalogRequest
        ): Promise<PriceCatalogDocument> => {
            const { data, error } = await catchBackendError(
                api.post<PriceCatalogDocument>(
                    endpoints[EndpointsEnum.PRICE_CATALOG].root,
                    createCatalogData
                )
            )

            if (error) throw error
            return data
        },
        []
    )

    // GET /price-catalog/:id
    const getCatalogById = useCallback(
        async (id: string): Promise<PriceCatalogDocument> => {
            const { data, error } = await catchBackendError(
                api.get<PriceCatalogDocument>(
                    endpoints[EndpointsEnum.PRICE_CATALOG].byId(id)
                )
            )

            if (error) throw error
            return data
        },
        []
    )

    // GET /price-catalog/type/:visitType
    const getCatalogByVisitType = useCallback(
        async (visitType: VisitCategoryEnum): Promise<PriceCatalogDocument> => {
            const { data, error } = await catchBackendError(
                api.get<PriceCatalogDocument>(
                    endpoints[EndpointsEnum.PRICE_CATALOG].byVisitType(
                        visitType
                    )
                )
            )

            if (error) throw error
            return data
        },
        []
    )

    // GET /price-catalog/price/:visitType
    const getPriceByVisitType = useCallback(
        async (visitType: VisitCategoryEnum): Promise<number> => {
            const { data, error } = await catchBackendError(
                api.get<number>(
                    endpoints[EndpointsEnum.PRICE_CATALOG].priceByVisitType(
                        visitType
                    )
                )
            )

            if (error) throw error
            return data
        },
        []
    )

    // PATCH /price-catalog/:id
    const updateCatalog = useCallback(
        async (
            id: string,
            updateCatalogData: UpdatePriceCatalogRequest
        ): Promise<PriceCatalogDocument> => {
            const { data, error } = await catchBackendError(
                api.patch<PriceCatalogDocument>(
                    endpoints[EndpointsEnum.PRICE_CATALOG].byId(id),
                    updateCatalogData
                )
            )

            if (error) throw error
            return data
        },
        []
    )

    // DELETE /price-catalog/:id
    const deleteCatalog = useCallback(async (id: string): Promise<void> => {
        const { error } = await catchBackendError(
            api.delete(endpoints[EndpointsEnum.PRICE_CATALOG].byId(id))
        )

        if (error) throw error
    }, [])

    // Context Value
    const contextValue = useMemo(
        () => ({
            getCatalog,
            createCatalog,
            getCatalogById,
            getCatalogByVisitType,
            getPriceByVisitType,
            updateCatalog,
            deleteCatalog,
        }),
        [
            getCatalog,
            createCatalog,
            getCatalogById,
            getCatalogByVisitType,
            getPriceByVisitType,
            updateCatalog,
            deleteCatalog,
        ]
    )

    return (
        <PriceCatalogContext.Provider value={contextValue}>
            {children}
        </PriceCatalogContext.Provider>
    )
}
