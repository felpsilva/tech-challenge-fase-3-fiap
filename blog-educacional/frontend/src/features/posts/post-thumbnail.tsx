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

// <img> e nao next/image: `image_url` e texto livre (hosts desconhecidos para
// `remotePatterns`) e o Next 16 bloqueia otimizacao de IP local.
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
