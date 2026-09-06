import { getMetadataArgsStorage } from 'typeorm'
import { User } from './user.entity'
import { Post } from './post.entity'

function columnsOf(target: Function) {
    return getMetadataArgsStorage().columns.filter((column) => column.target === target)
}

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
        expect((authorRelation!.type as () => Function)()).toBe(User)
    })
})
