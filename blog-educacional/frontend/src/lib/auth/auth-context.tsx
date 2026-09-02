'use client'

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import { AUTH_COOKIE_NAME, clearAuthToken, readAuthToken, writeAuthToken } from './auth-cookie'
import { decodeJwtPayload, isExpired } from './decode-jwt'
import { setUnauthorizedHandler } from '@/lib/api/http-client'
import { signIn as signInRequest } from '@/lib/api/auth-service'

export interface SessionUser {
    id: number
    username: string
    permission: string
}

interface AuthState {
    user: SessionUser | null
    isAuthenticated: boolean
    /** `false` até o cookie ser lido no cliente. Evita mismatch de hidratação. */
    isReady: boolean
    signIn: (username: string, password: string) => Promise<void>
    signOut: (reason?: 'manual' | 'expired') => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter()
    const [session, setSession] = useState<{ user: SessionUser | null; isReady: boolean }>({
        user: null,
        isReady: false,
    })

    const { user, isReady } = session

    const signOut = useCallback(
        (reason: 'manual' | 'expired' = 'manual') => {
            clearAuthToken()
            setSession({ user: null, isReady: true })
            router.replace(reason === 'expired' ? '/login?reason=expired' : '/login')
        },
        [router],
    )

    // Ler o cookie num inicializador de useState causaria erro de hidratação:
    // o servidor sempre renderiza o ramo anônimo, então a leitura só pode
    // acontecer depois da montagem. É a exceção que a própria regra descreve:
    // ler um sistema externo (document.cookie) indisponível no SSR. Uma
    // gravação só, para não haver dois renders em sequência.
    useEffect(() => {
        const token = readAuthToken()
        const claims = token ? decodeJwtPayload(token) : null

        if (!claims && token) {
            clearAuthToken()
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSession({
            user: claims && !isExpired(claims)
                ? { id: claims.id, username: claims.username, permission: claims.permission }
                : null,
            isReady: true,
        })
    }, [])

    // O interceptor do axios não pode importar este contexto (ciclo), então o
    // handler de 401 é injetado aqui.
    useEffect(() => {
        setUnauthorizedHandler(() => signOut('expired'))
    }, [signOut])

    // A API não tem refresh: o token morre em 1h. Sem este alarme, quem
    // estivesse preenchendo um formulário levaria um 401 opaco no envio.
    useEffect(() => {
        const token = readAuthToken()
        const claims = token ? decodeJwtPayload(token) : null

        if (!claims) {
            return
        }

        // Token ja vencido agenda com 0 em vez de chamar signOut aqui: manter
        // o setState fora do corpo do efeito evita render em cascata.
        const msLeft = Math.max(0, claims.exp * 1000 - Date.now())
        const timer = setTimeout(() => signOut('expired'), msLeft)

        return () => clearTimeout(timer)
    }, [user, signOut])

    const signIn = useCallback(
        async (username: string, password: string) => {
            const { token } = await signInRequest({ username, password })

            writeAuthToken(token)

            const claims = decodeJwtPayload(token)

            if (!claims) {
                clearAuthToken()
                throw new Error('O servidor devolveu um token em formato inesperado.')
            }

            setSession({
                user: { id: claims.id, username: claims.username, permission: claims.permission },
                isReady: true,
            })
        },
        [],
    )

    const value = useMemo<AuthState>(
        () => ({ user, isAuthenticated: Boolean(user), isReady, signIn, signOut }),
        [user, isReady, signIn, signOut],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error('useAuth precisa estar dentro de AuthProvider')
    }

    return context
}

export { AUTH_COOKIE_NAME }
