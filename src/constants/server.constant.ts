// Enums
import { EndpointsEnum } from '@/src/enums/endpoints.enum'
import { NoteCategoryEnum } from '@/src/enums/schemas.enum'
import { IntervalEnum } from '@/src/enums/finance.enum'

export const server = process.env.NEXT_PUBLIC_SERVER_ENDPOINT

export const endpoints = {
    [EndpointsEnum.AUTH]: {
        login: `${server}/${EndpointsEnum.AUTH}/login`,
        refresh: `${server}/${EndpointsEnum.AUTH}/refresh`,
        changePassword: `${server}/${EndpointsEnum.AUTH}/change-password`,
    },
    [EndpointsEnum.USER]: {
        me: `${server}/${EndpointsEnum.USER}/me`,
        myAvatar: `${server}/${EndpointsEnum.USER}/me/avatar`,
        root: `${server}/${EndpointsEnum.USER}`,
        byId: (id: string) => `${server}/${EndpointsEnum.USER}/${id}`,
        findByUsername: `${server}/${EndpointsEnum.USER}/username`,
        findAllDoctors: `${server}/${EndpointsEnum.USER}/doctors`,
        updateRole: (id: string) =>
            `${server}/${EndpointsEnum.USER}/${id}/role`,
    },
    [EndpointsEnum.SETTINGS]: {
        root: `${server}/${EndpointsEnum.SETTINGS}`,
        updateLogo: `${server}/${EndpointsEnum.SETTINGS}/logo`,
        updateSecondaryLogo: `${server}/${EndpointsEnum.SETTINGS}/secondary-logo`,
        updateWatermark: `${server}/${EndpointsEnum.SETTINGS}/watermark`,
    },
    [EndpointsEnum.PRICE_CATALOG]: {
        root: `${server}/${EndpointsEnum.PRICE_CATALOG}`,
        byId: (id: string) => `${server}/${EndpointsEnum.PRICE_CATALOG}/${id}`,
        byVisitType: (visitType: string) =>
            `${server}/${EndpointsEnum.PRICE_CATALOG}/type/${visitType}`,
        priceByVisitType: (visitType: string) =>
            `${server}/${EndpointsEnum.PRICE_CATALOG}/price/${visitType}`,
    },
    [EndpointsEnum.PATIENT]: {
        root: `${server}/${EndpointsEnum.PATIENT}`,
        byId: (id: string) => `${server}/${EndpointsEnum.PATIENT}/${id}`,
        byDate: (date: string) =>
            `${server}/${EndpointsEnum.PATIENT}/by-date?date=${encodeURIComponent(date)}`,
        search: (term?: string) =>
            `${server}/${EndpointsEnum.PATIENT}/search${term ? `?term=${encodeURIComponent(term)}` : ''}`,
    },
    [EndpointsEnum.EXPENSE]: {
        root: `${server}/${EndpointsEnum.EXPENSE}`,
        byId: (id: string) => `${server}/${EndpointsEnum.EXPENSE}/${id}`,
        byCategory: (category: string) =>
            `${server}/${EndpointsEnum.EXPENSE}/category/${category}`,
    },
    [EndpointsEnum.ROLE]: {
        root: `${server}/${EndpointsEnum.ROLE}`,
        byId: (id: string) => `${server}/${EndpointsEnum.ROLE}/${id}`,
        addPermissions: (id: string) =>
            `${server}/${EndpointsEnum.ROLE}/${id}/permissions/add`,
        removePermissions: (id: string) =>
            `${server}/${EndpointsEnum.ROLE}/${id}/permissions/remove`,
    },
    [EndpointsEnum.VISIT]: {
        root: `${server}/${EndpointsEnum.VISIT}`,
        byId: (id: string) => `${server}/${EndpointsEnum.VISIT}/${id}`,
        byPatientId: (patientId: string) =>
            `${server}/${EndpointsEnum.VISIT}/patient/${patientId}`,
        byDate: (date: string) =>
            `${server}/${EndpointsEnum.VISIT}/by-date?date=${encodeURIComponent(date)}`,
        notesSuggestions: (search?: string, category?: NoteCategoryEnum) => {
            const params = new URLSearchParams()
            if (search) params.append('search', search)
            if (category) params.append('category', category)

            const queryString = params.toString()
            return `${server}/${EndpointsEnum.VISIT}/notes/suggestions${queryString ? `?${queryString}` : ''}`
        },
    },
    [EndpointsEnum.REVENUE]: {
        root: `${server}/${EndpointsEnum.REVENUE}`,
        byId: (id: string) => `${server}/${EndpointsEnum.REVENUE}/${id}`,
        byVisitId: (visitId: string) =>
            `${server}/${EndpointsEnum.REVENUE}/visit/${visitId}`,
    },
    [EndpointsEnum.PERMISSION]: {
        root: `${server}/${EndpointsEnum.PERMISSION}`,
        byId: (id: string) => `${server}/${EndpointsEnum.PERMISSION}/${id}`,
    },
    [EndpointsEnum.FINANCE]: {
        summary: (startDate: string, endDate: string) =>
            `${server}/${EndpointsEnum.FINANCE}/summary?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,

        timeline: (year: string, interval?: IntervalEnum) => {
            const params = new URLSearchParams()
            params.append('year', year)
            if (interval) params.append('interval', interval)
            const queryString = params.toString()
            return `${server}/${EndpointsEnum.FINANCE}/timeline?${queryString}`
        },

        revenueByCategory: (startDate: string, endDate: string) =>
            `${server}/${EndpointsEnum.FINANCE}/revenue-by-category?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,

        expensesByCategory: (startDate: string, endDate: string) =>
            `${server}/${EndpointsEnum.FINANCE}/expenses-by-category?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
    },
    [EndpointsEnum.MEDICAL_DOCUMENTS]: {
        prescription: (visitId: string) =>
            `${server}/${EndpointsEnum.MEDICAL_DOCUMENTS}/prescription/${visitId}`,
        labRequest: (visitId: string) =>
            `${server}/${EndpointsEnum.MEDICAL_DOCUMENTS}/lab-request/${visitId}`,
        radiologyRequest: (visitId: string) =>
            `${server}/${EndpointsEnum.MEDICAL_DOCUMENTS}/radiology-request/${visitId}`,
    },
}
