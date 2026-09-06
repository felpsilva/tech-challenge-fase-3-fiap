export type FieldErrors = Record<string, string>

export class ApiError extends Error {
    readonly status: number
    readonly fieldErrors: FieldErrors
    readonly isNetwork: boolean
    readonly isValidation: boolean

    constructor(args: {
        message: string
        status: number
        fieldErrors?: FieldErrors
        isNetwork?: boolean
        isValidation?: boolean
    }) {
        super(args.message)
        this.name = 'ApiError'
        this.status = args.status
        this.fieldErrors = args.fieldErrors ?? {}
        this.isNetwork = args.isNetwork ?? false
        this.isValidation = args.isValidation ?? false
    }
}

export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError
}

const STATUS_MESSAGES: Record<number, string> = {
    401: 'Sua sessão expirou. Entre novamente.',
    403: 'Você não tem permissão para esta ação.',
    404: 'Registro não encontrado.',
    413: 'A imagem passa do limite de 2 MB.',
    415: 'Formato de envio inválido.',
    500: 'Erro interno no servidor. Tente novamente.',
}

const MESSAGE_TRANSLATIONS: Record<string, string> = {
    'user_id not found': 'O autor selecionado não existe.',
    'Username or password is incorrect.': 'Usuário ou senha inválidos.',
    'Post not found': 'Post não encontrado.',
    'Category not found': 'Categoria não encontrada.',
    'User not found': 'Usuário não encontrado.',
    'Thumbnail not found': 'Este post não tem imagem enviada.',
    'Image file is required': 'Selecione um arquivo de imagem.',
    'Empty image file': 'O arquivo de imagem está vazio.',
}

const MAX_DEPTH = 5

export function flattenZodFormat(tree: unknown, path = '', depth = 0): FieldErrors {
    if (depth > MAX_DEPTH || tree === null || typeof tree !== 'object') {
        return {}
    }

    const result: FieldErrors = {}

    for (const [key, value] of Object.entries(tree as Record<string, unknown>)) {
        if (key === '_errors') {
            if (path && Array.isArray(value) && typeof value[0] === 'string') {
                result[path] = value[0]
            }
            continue
        }

        const childPath = /^\d+$/.test(key)
            ? `${path}[${key}]`
            : path ? `${path}.${key}` : key

        Object.assign(result, flattenZodFormat(value, childPath, depth + 1))
    }

    return result
}

interface ErrorBody {
    message?: unknown
    statusCode?: unknown
    error?: unknown
}

export function normalizeApiError(error: unknown): ApiError {
    if (isApiError(error)) {
        return error
    }

    const candidate = error as {
        response?: { status?: number; data?: ErrorBody }
        message?: string
        code?: string
    }

    if (!candidate?.response) {
        return new ApiError({
            message: 'Não foi possível contatar o servidor. Verifique se a API está no ar.',
            status: 0,
            isNetwork: true,
        })
    }

    const status = candidate.response.status ?? 0
    const body = candidate.response.data ?? {}
    const serverMessage = typeof body.message === 'string' ? body.message : undefined

    if (status === 400 && serverMessage === 'Validation error' && body.error) {
        const fieldErrors = flattenZodFormat(body.error)
        const rootErrors = (body.error as { _errors?: unknown })._errors

        const rootMessage = Array.isArray(rootErrors) && typeof rootErrors[0] === 'string'
            ? rootErrors[0]
            : 'Verifique os campos destacados.'

        return new ApiError({
            message: rootMessage,
            status,
            fieldErrors,
            isValidation: true,
        })
    }

    const translated = serverMessage ? MESSAGE_TRANSLATIONS[serverMessage] : undefined

    return new ApiError({
        message: translated ?? STATUS_MESSAGES[status] ?? serverMessage ?? 'Erro inesperado.',
        status,
    })
}
