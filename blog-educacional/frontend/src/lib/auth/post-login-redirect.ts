import { canAccessPanel } from '@/types/permissions'

/** Destino de quem tem acesso ao painel (professor, admin). */
export const PANEL_HOME = '/admin/posts'

/** Destino de quem só lê o blog (aluno): a listagem de posts publicados. */
export const READER_HOME = '/'

// `next` vem da query string, entao pode ser forjado: aceitamos apenas caminho
// interno. `//host` seria protocol-relative e levaria o usuario para fora.
function isInternalPath(path: string | null | undefined): path is string {
    return typeof path === 'string' && path.startsWith('/') && !path.startsWith('//')
}

/**
 * Para onde mandar o usuário depois do login. Sem acesso ao painel o destino é
 * a leitura do blog — mandar para `/admin/*` só produziria `/sem-permissao`.
 */
export function resolvePostLoginRedirect(permission: string, nextPath?: string | null) {
    const requested = isInternalPath(nextPath) ? nextPath : null

    if (canAccessPanel(permission)) {
        return requested ?? PANEL_HOME
    }

    return requested && !requested.startsWith('/admin') ? requested : READER_HOME
}
