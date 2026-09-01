import { Column, Entity, PrimaryColumn } from 'typeorm';
import { IPostImage } from './models/post-image.interface';

@Entity({
    name: 'post_images',
})
export class PostImage implements IPostImage {
    // Chave primária e estrangeira ao mesmo tempo: garante uma thumbnail por
    // post. A FK e o ON DELETE CASCADE são declarados em db/init.sql.
    @PrimaryColumn({
        name: 'post_id',
        type: 'integer',
    })
    post_id: number

    @Column({
        name: 'filename',
        type: 'varchar',
        length: 255,
    })
    filename: string

    @Column({
        name: 'mime_type',
        type: 'varchar',
        length: 100,
    })
    mime_type: string

    @Column({
        name: 'size_bytes',
        type: 'integer',
    })
    size_bytes: number

    // select: false mantém o binário fora de qualquer find() acidental.
    // Só o findDataByPostId, via query builder, traz esta coluna.
    @Column({
        name: 'data',
        type: 'bytea',
        select: false,
    })
    data: Buffer

    @Column({
        name: 'created_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    created_at?: Date

    @Column({
        name: 'updated_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    updated_at?: Date
}
