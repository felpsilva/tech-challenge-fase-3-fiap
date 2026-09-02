'use client'

import Link from 'next/link'
import styled from 'styled-components'
import { PostThumbnail } from './post-thumbnail'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils/format-date'
import type { PostCardData } from '@/types/view'

export function PostCard({ post }: { post: PostCardData }) {
    return (
        <Article>
            <PostThumbnail
                postId={post.id}
                imageUrl={post.imageUrl}
                version={post.thumbnailVersion}
            />

            <Body>
                <Meta>
                    <Author>{post.authorName}</Author>
                    <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
                </Meta>

                <Title>
                    {/* O nome acessível do link é o título, não o resumo. */}
                    <TitleLink href={`/posts/${post.id}`} aria-label={`Ler post: ${post.title}`}>
                        {post.title}
                    </TitleLink>
                </Title>

                <Excerpt>{post.excerpt}</Excerpt>

                {post.categories.length > 0 && (
                    <Categories>
                        {post.categories.map((category) => (
                            <Badge key={category.id}>{category.name}</Badge>
                        ))}
                    </Categories>
                )}
            </Body>
        </Article>
    )
}

const Article = styled.article`
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.lg};
    background: ${({ theme }) => theme.colors.surface};
    box-shadow: ${({ theme }) => theme.shadows.sm};
    transition: box-shadow ${({ theme }) => theme.transitions.base};

    &:hover {
        box-shadow: ${({ theme }) => theme.shadows.md};
    }
`

const Body = styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(2)};
    padding: ${({ theme }) => theme.spacing(4)};
`

const Meta = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing(2)};
    font-size: ${({ theme }) => theme.typography.sizes.xs};
    color: ${({ theme }) => theme.colors.textMuted};
`

const Author = styled.span`
    font-weight: ${({ theme }) => theme.typography.weights.semibold};
    color: ${({ theme }) => theme.colors.brand};
`

const Title = styled.h3`
    font-size: ${({ theme }) => theme.typography.sizes.lg};
`

const TitleLink = styled(Link)`
    color: ${({ theme }) => theme.colors.text};
    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }
`

/**
 * Duas linhas com reticências de verdade, em qualquer largura.
 *
 * Truncar por contagem de caracteres em JS daria duas linhas no notebook,
 * quatro no celular e uma e meia com fonte aumentada — "duas linhas" só o CSS
 * resolve, porque depende da largura renderizada e da fonte que carregou.
 *
 * O `min-height` reserva as duas linhas para os cartões da grade ficarem da
 * mesma altura mesmo quando o resumo ocupa uma linha só.
 */
const Excerpt = styled.p`
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
    min-height: calc(2em * ${({ theme }) => theme.typography.lineHeights.base});
    color: ${({ theme }) => theme.colors.textMuted};
`

const Categories = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing(1)};
    margin-top: auto;
    padding-top: ${({ theme }) => theme.spacing(2)};
`
