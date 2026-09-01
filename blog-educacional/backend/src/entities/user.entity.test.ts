import { getMetadataArgsStorage } from 'typeorm'
import { User } from './user.entity'
import { Post } from './post.entity'

function columnsOf(target: Function) {
    return getMetadataArgsStorage().columns.filter((column) => column.target === target)
}

/**
 * Trava o vazamento do hash de senha: sem `select: false` na coluna, todo
 * find() de usuario — inclusive o join do autor em GET /post, liberado para
 * o perfil `aluno` — devolvia o hash bcrypt de admins e professores.
 */
describe('User entity password column', () => {
    it('is never selected by default', () => {
        const password = columnsOf(User).find((column) => column.propertyName === 'password')

        expect(password).toBeDefined()
        expect(password!.options.select).toBe(false)
    })

    it('keeps the other user columns selectable', () => {
        const selectable = columnsOf(User)
            .filter((column) => column.options.select !== false)
            .map((column) => column.propertyName)
            .sort()

        expect(selectable).toEqual(['created_at', 'id', 'permission', 'username'])
    })

    it('applies to the post author relation, which loads the same entity', () => {
        const authorRelation = getMetadataArgsStorage().relations.find(
            (relation) => relation.target === Post && relation.propertyName === 'user',
        )

        expect(authorRelation).toBeDefined()
        // A relacao resolve para a entidade User, entao herda o select: false
        // da coluna: nao existe caminho de leitura que traga o hash sem um
        // addSelect explicito.
        expect((authorRelation!.type as () => Function)()).toBe(User)
    })
})
