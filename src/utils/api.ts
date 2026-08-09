'use client'

// Core
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
// Enums
import { EndpointsEnum } from '@/src/enums/endpoints.enum'
// Functions
import { getTokens, saveTokens, clearTokens } from '@/src/utils/tokens'
// Types
import { TokensResponse } from '@/src/types/backend/backend.responses.type'
// Variables
import { endpoints } from '@/src/constants/server.constant'

export const api = axios.create()

api.interceptors.request.use(
    (config) => {
        const tokensStr = getTokens()
        if (tokensStr) {
            const tokens = JSON.parse(tokensStr) as TokensResponse
            config.headers.Authorization = `Bearer ${tokens.accessToken}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                const tokensStr = getTokens()
                if (tokensStr) {
                    const tokens = JSON.parse(tokensStr) as TokensResponse
                    const decoded: { sub: string } = jwtDecode(
                        tokens.accessToken
                    )
                    const response = await axios.post<TokensResponse>(
                        endpoints[EndpointsEnum.AUTH].refresh,
                        {
                            userId: decoded.sub,
                            refreshToken: tokens.refreshToken,
                        }
                    )

                    saveTokens(JSON.stringify(response.data))

                    originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`
                    return api(originalRequest)
                }
            } catch (refreshError) {
                clearTokens()
                window.location.href = '/login'
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)
