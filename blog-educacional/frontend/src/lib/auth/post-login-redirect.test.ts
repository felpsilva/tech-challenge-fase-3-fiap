import {
    PANEL_HOME,
    READER_HOME,
    resolvePostLoginRedirect,
} from './post-login-redirect'

describe('resolvePostLoginRedirect', () => {
    it('manda professor e admin para o painel quando nao havia destino', () => {
        expect(resolvePostLoginRedirect('admin')).toBe(PANEL_HOME)
        expect(resolvePostLoginRedirect('professor', null)).toBe(PANEL_HOME)
    })

    it('devolve professor e admin para a pagina que tentaram abrir', () => {
        expect(resolvePostLoginRedirect('professor', '/admin/categories')).toBe(
            '/admin/categories',
        )
    })

    it('manda aluno para a leitura do blog, nao para o painel', () => {
        expect(resolvePostLoginRedirect('aluno')).toBe(READER_HOME)
    })

    it('ignora destino administrativo pedido por aluno', () => {
        expect(resolvePostLoginRedirect('aluno', '/admin/posts')).toBe(READER_HOME)
        expect(resolvePostLoginRedirect('aluno', '/admin/users')).toBe(READER_HOME)
    })

    it('preserva destino publico pedido por aluno', () => {
        expect(resolvePostLoginRedirect('aluno', '/posts/7')).toBe('/posts/7')
    })

    it('trata permissao desconhecida como leitor', () => {
        expect(resolvePostLoginRedirect('convidado', '/admin/posts')).toBe(READER_HOME)
    })

    it('recusa destino externo vindo da query string', () => {
        expect(resolvePostLoginRedirect('admin', '//exemplo.invalido')).toBe(PANEL_HOME)
        expect(resolvePostLoginRedirect('admin', 'https://exemplo.invalido')).toBe(PANEL_HOME)
        expect(resolvePostLoginRedirect('aluno', '//exemplo.invalido')).toBe(READER_HOME)
    })
})
