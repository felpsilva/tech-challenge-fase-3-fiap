import { slugify, deaccent } from './slugify'

describe('slugify', () => {
    it('folds portuguese accents', () => {
        expect(slugify('Matemática')).toBe('matematica')
        expect(slugify('Introdução à Física')).toBe('introducao-a-fisica')
        expect(slugify('Ação e Coração')).toBe('acao-e-coracao')
    })

    it('turns the ampersand into the word "e"', () => {
        expect(slugify('Ciências & Tecnologia')).toBe('ciencias-e-tecnologia')
    })

    it('collapses separators and trims the edges', () => {
        expect(slugify('  Olá   Mundo!  ')).toBe('ola-mundo')
    })

    it('never ends with a dash after the length cap', () => {
        const slug = slugify('a'.repeat(190) + ' ' + 'b'.repeat(30))

        expect(slug.length).toBeLessThanOrEqual(200)
        expect(slug.endsWith('-')).toBe(false)
    })

    it('keeps the cedilla folding to a plain c', () => {
        expect(deaccent('ç')).toBe('c')
    })
})
