'use client'

import { useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { FormField } from '@/components/ui/form-field'
import { TextInput } from '@/components/ui/inputs'
import { Button } from '@/components/ui/button'
import { Feedback } from '@/components/ui/feedback'
import { PostThumbnail } from './post-thumbnail'
import { formatBytes } from '@/lib/utils/format-bytes'
import { ACCEPTED_IMAGE_TYPES } from './post-form-schema'

export type ThumbnailAction = 'keep' | 'replace' | 'remove'

interface PostImageFieldProps {
    imageUrl: string
    onImageUrlChange: (value: string) => void
    imageUrlError?: string | undefined
    file: File | null
    onFileChange: (file: File | null) => void
    fileError?: string | undefined
    thumbnailAction: ThumbnailAction
    onThumbnailActionChange: (action: ThumbnailAction) => void
    existingPostId?: number
    existingVersion?: string
}

export function PostImageField({
    imageUrl,
    onImageUrlChange,
    imageUrlError,
    file,
    onFileChange,
    fileError,
    thumbnailAction,
    onThumbnailActionChange,
    existingPostId,
    existingVersion,
}: PostImageFieldProps) {
    const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

    useEffect(() => () => {
        if (preview) {
            URL.revokeObjectURL(preview)
        }
    }, [preview])

    return (
        <Fieldset>
            <Legend>Imagem do post</Legend>

            <Note>
                Se você enviar um arquivo, ele tem prioridade sobre a URL externa.
            </Note>

            {existingPostId && thumbnailAction === 'keep' && !file && (
                <Existing>
                    <PostThumbnail
                        postId={existingPostId}
                        imageUrl={null}
                        version={existingVersion}
                        alt="Imagem atual do post"
                    />
                    <Button
                        type="button"
                        $variant="secondary"
                        onClick={() => onThumbnailActionChange('remove')}
                    >
                        Remover imagem enviada
                    </Button>
                </Existing>
            )}

            {thumbnailAction === 'remove' && (
                <Feedback $tone="warning">
                    A imagem será removida ao salvar.{' '}
                    <Button
                        type="button"
                        $variant="ghost"
                        onClick={() => onThumbnailActionChange('keep')}
                    >
                        Desfazer
                    </Button>
                </Feedback>
            )}

            <FormField
                name="thumbnailFile"
                label="Enviar arquivo"
                hint="JPEG, PNG ou WebP. Máximo 2 MB."
                error={fileError}
            >
                {(fieldProps) => (
                    <input
                        {...fieldProps}
                        type="file"
                        name="thumbnailFile"
                        accept={ACCEPTED_IMAGE_TYPES.join(',')}
                        onChange={(event) => {
                            const selected = event.target.files?.[0] ?? null
                            onFileChange(selected)
                            onThumbnailActionChange(selected ? 'replace' : 'keep')
                        }}
                    />
                )}
            </FormField>

            {file && preview && (
                <Preview>
                    <PreviewImage src={preview} alt="Pré-visualização da imagem escolhida" />
                    <FileInfo>
                        {file.name} · {formatBytes(file.size)}
                    </FileInfo>
                </Preview>
            )}

            <FormField
                name="imageUrl"
                label="Ou URL de imagem externa"
                hint="Usada quando não há arquivo enviado."
                error={imageUrlError}
            >
                {(fieldProps) => (
                    <TextInput
                        {...fieldProps}
                        name="imageUrl"
                        type="url"
                        maxLength={255}
                        placeholder="https://exemplo.com/imagem.png"
                        value={imageUrl}
                        onChange={(event) => onImageUrlChange(event.target.value)}
                    />
                )}
            </FormField>
        </Fieldset>
    )
}

const Fieldset = styled.fieldset`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(4)};
    padding: ${({ theme }) => theme.spacing(4)};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.md};
`

const Legend = styled.legend`
    padding: 0 ${({ theme }) => theme.spacing(2)};
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    font-weight: ${({ theme }) => theme.typography.weights.semibold};
`

const Note = styled.p`
    font-size: ${({ theme }) => theme.typography.sizes.xs};
    color: ${({ theme }) => theme.colors.textMuted};
`

const Existing = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(2)};
    max-width: 320px;
`

const Preview = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(1)};
    max-width: 320px;
`

const PreviewImage = styled.img`
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    border-radius: ${({ theme }) => theme.radii.md};
`

const FileInfo = styled.p`
    font-size: ${({ theme }) => theme.typography.sizes.xs};
    color: ${({ theme }) => theme.colors.textMuted};
`
