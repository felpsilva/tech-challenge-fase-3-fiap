'use client'

import Link from 'next/link'
import styled from 'styled-components'
import { PostThumbnail } from './post-thumbnail'
import { Badge } from '@/components/ui/badge'
import { PageContainer } from '@/components/ui/page-container'
import { formatDate } from '@/lib/utils/format-date'
import { from } from '@/styles/media'
import type { Post } from '@/types/api'

export function PostArticle({ post }: { post: Post }) {
    return (
        <PageContainer>
            <BackLink href="/">← Voltar para os posts</BackLink>

            <Article>
                <Header>
                    <Title>{post.title}</Title>

                    <Meta>
                        <Author>{post.user?.username ?? 'Autor não identificado'}</Author>
                        <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
                    </Meta>

                    {(post.categories ?? []).length > 0 && (
                        <Categories>
                            {(post.categories ?? []).map((category) => (
                                <Badge key={category.id}>{category.name}</Badge>
                            ))}
                        </Categories>
                    )}
                </Header>

                <Cover>
                    <PostThumbnail
                        postId={post.id}
                        imageUrl={post.image_url}
                        version={post.updated_at}
                        alt={`Imagem de capa do post ${post.title}`}
                    />
                </Cover>

                <Content>
                    {post.content.split(/\n{2,}/).map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                    ))}
                </Content>
            </Article>
        </PageContainer>
    )
}

const BackLink = styled(Link)`
    display: inline-block;
    margin-bottom: ${({ theme }) => theme.spacing(5)};
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    font-weight: ${({ theme }) => theme.typography.weights.medium};
`

const Article = styled.article`
    max-width: ${({ theme }) => theme.layout.readableWidth};
    ${from('md')} {
        max-width: 100%;
    }
`

const Header = styled.header`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(3)};
    margin-bottom: ${({ theme }) => theme.spacing(6)};
`

const Title = styled.h1`
    font-size: ${({ theme }) => theme.typography.sizes['2xl']};

    ${from('md')} {
        font-size: ${({ theme }) => theme.typography.sizes['3xl']};
    }
`

const Meta = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing(3)};
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    color: ${({ theme }) => theme.colors.textMuted};
`

const Author = styled.span`
    font-weight: ${({ theme }) => theme.typography.weights.semibold};
    color: ${({ theme }) => theme.colors.brand};
`

const Categories = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing(1)};
`

const Cover = styled.div`
    margin-bottom: ${({ theme }) => theme.spacing(6)};
    overflow: hidden;
    border-radius: ${({ theme }) => theme.radii.lg};
`

const Content = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(4)};
    font-size: ${({ theme }) => theme.typography.sizes.lg};
    line-height: ${({ theme }) => theme.typography.lineHeights.relaxed};
    white-space: pre-wrap;
`
