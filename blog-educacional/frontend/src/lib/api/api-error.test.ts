import { normalizeApiError, flattenZodFormat } from './api-error'

describe('normalizeApiError', () => {
    it('reports a network failure when there is no response', () => {
        const error = normalizeApiError({ message: 'Network Error' })

        expect(error.isNetwork).toBe(true)
        expect(error.status).toBe(0)
        expect(error.message).toContain('Não foi possível contatar o servidor')
    })

    it('turns the zod format tree into formik field errors', () => {
        const error = normalizeApiError({
            response: {
                status: 400,
                data: {
                    statusCode: 400,
                    message: 'Validation error',
                    error: {
                        _errors: [],
                        title: { _errors: ['Invalid input: expected string, received undefined'] },
                        categories: {
                            _errors: [],
                            '0': { _errors: [], id: { _errors: ['Expected number'] } },
                        },
                    },
                },
            },
        })

        expect(error.isValidation).toBe(true)
        expect(error.fieldErrors).toEqual({
            title: 'Invalid input: expected string, received undefined',
            'categories[0].id': 'Expected number',
        })
    })

    it('translates the backend message when there is a better wording', () => {
        const error = normalizeApiError({
            response: { status: 400, data: { message: 'user_id not found' } },
        })

        expect(error.message).toBe('O autor selecionado não existe.')
    })

    it('replaces the english message on an unauthorized response', () => {
        const error = normalizeApiError({
            response: { status: 401, data: { message: 'Unauthorized' } },
        })

        expect(error.status).toBe(401)
        expect(error.message).toBe('Sua sessão expirou. Entre novamente.')
    })

    it('skips the root _errors key when flattening', () => {
        expect(flattenZodFormat({ _errors: ['erro geral'] })).toEqual({})
    })
})
