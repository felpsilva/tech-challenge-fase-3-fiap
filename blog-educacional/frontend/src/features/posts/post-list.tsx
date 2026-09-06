'use client'

import { useMemo, useState } from 'react'
import styled from 'styled-components'
import { PostCard } from './post-card'
import { Pagination } from '@/components/ui/pagination'
import { EmptyState } from '@/components/ui/feedback'
import { FormField } from '@/components/ui/form-field'
import { TextInput } from '@/components/ui/inputs'
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value'
import { useClientPagination } from '@/lib/hooks/use-client-pagination'
import { from } from '@/styles/media'
import { deaccent } from '@/lib/utils/slugify'
import type { PostCardData } from '@/types/view'

export function PostList({ posts }: { posts: PostCardData[] }) {
    const [query, setQuery] = useState('')
    const debouncedQuery = useDebouncedValue(query, 250)

    const filtered = useMemo(() => {
        const needle = deaccent(debouncedQuery.trim().toLowerCase())

        if (!needle) {
            return posts
        }

        const terms = needle.split(/\s+/)

        return posts.filter((post) => terms.every((term) => post.searchText.includes(term)))
    }, [posts, debouncedQuery])

    const { page, totalPages, pageItems, totalItems, setPage } = useClientPagination(filtered)

    return (
        <>
            <SearchArea>
                <FormField
                    name="busca"
                    label="Buscar posts"
                    hint="Filtra por título, autor ou conteúdo. Acentos são ignorados."
                >
                    {(fieldProps) => (
                        <TextInput
                            {...fieldProps}
                            type="search"
                            name="busca"
                            value={query}
                            placeholder="Ex.: matematica"
                            onChange={(event) => setQuery(event.target.value)}
                        />
                    )}
                </FormField>

                <ResultCount role="status">
                    {totalItems === 1 ? '1 post encontrado' : `${totalItems} posts encontrados`}
                </ResultCount>
            </SearchArea>

            {pageItems.length === 0 ? (
                <EmptyState>
                    <p>Nenhum post corresponde à busca.</p>
                </EmptyState>
            ) : (
                <Grid>
                    {pageItems.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </Grid>
            )}

            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
    )
}

const SearchArea = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(2)};
    margin-bottom: ${({ theme }) => theme.spacing(6)};

    ${from('md')} {
        max-width: 520px;
    }
`

const ResultCount = styled.p`
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    color: ${({ theme }) => theme.colors.textMuted};
`

const Grid = styled.div`
    display: grid;
    gap: ${({ theme }) => theme.spacing(5)};
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
`
