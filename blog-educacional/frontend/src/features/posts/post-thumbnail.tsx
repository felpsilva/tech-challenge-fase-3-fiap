'use client'

import { useState } from 'react'
import styled from 'styled-components'
import { buildThumbnailUrl } from '@/lib/api/post-service'

interface PostThumbnailProps {
    postId: number
    imageUrl: string | null
    version?: string
    alt?: string
}

type Source = 'thumbnail' | 'imageUrl' | 'placeholder'

/**
 * Precedência: arquivo enviado > `image_url` > espaço vazio.
 *
 * A thumbnail ganha porque é validada (magic bytes, ≤2MB, três MIME types) e
 * hospedada por nós; `image_url` é texto livre apontando para terceiro, que
 * pode dar 404 ou bloquear hotlink.
 *
 * O `onError` rebaixa a fonte um passo por vez e nunca entra em laço. Como a
 * API não expõe um `has_thumbnail`, a primeira tentativa é especulativa e
 * custa um 404 nos posts sem imagem — o `loading="lazy"` faz esse custo só
 * existir para o que entra na tela.
 *
 * É um `<img>` e não `next/image` por dois motivos: `image_url` é texto livre,
 * então o conjunto de hosts para `remotePatterns` é desconhecido por
 * definição; e o Next 16 passou a bloquear otimização de IP local, o que
 * quebraria a thumbnail vinda de `localhost:3001` em desenvolvimento.
 */
export function PostThumbnail({ postId, imageUrl, version, alt = '' }: PostThumbnailProps) {
    const [source, setSource] = useState<Source>('thumbnail')

    const src = source === 'thumbnail'
        ? buildThumbnailUrl(postId, version)
        : source === 'imageUrl' ? imageUrl : null

    if (!src) {
        return <Placeholder aria-hidden="true" />
    }

    return (
        <Frame>
            <Image
                src={src}
                alt={alt}
                loading="lazy"
                decoding="async"
                onError={() => setSource(source === 'thumbnail' ? 'imageUrl' : 'placeholder')}
            />
        </Frame>
    )
}

// `aspect-ratio` fixo elimina o deslocamento de layout enquanto carrega.
const Frame = styled.div`
    aspect-ratio: 16 / 9;
    overflow: hidden;
    background: ${({ theme }) => theme.colors.surfaceAlt};
`

const Image = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
`

const Placeholder = styled.div`
    aspect-ratio: 16 / 9;
    background: linear-gradient(
        135deg,
        ${({ theme }) => theme.colors.brandSubtle},
        ${({ theme }) => theme.colors.surfaceAlt}
    );
`
