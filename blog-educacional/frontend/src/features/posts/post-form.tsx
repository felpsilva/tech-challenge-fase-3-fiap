'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Formik, Form } from 'formik'
import styled from 'styled-components'
import { postFormSchema } from './post-form-schema'
import { PostImageField, type ThumbnailAction } from './post-image-field'
import { FormField } from '@/components/ui/form-field'
import { TextInput, TextArea, Select } from '@/components/ui/inputs'
import { Button } from '@/components/ui/button'
import { FormErrorSummary } from '@/components/ui/form-error-summary'
import { Feedback } from '@/components/ui/feedback'
import { Card } from '@/components/ui/page-container'
import { useAuth } from '@/lib/auth/auth-context'
import { useSlugSync } from '@/lib/hooks/use-slug-sync'
import { isApiError } from '@/lib/api/api-error'
import { canManageUsers } from '@/types/permissions'
import { POST_STATUSES, POST_STATUS_LABELS, normalizeStatus } from '@/types/post-status'
import {
    createPost,
    updatePost,
    uploadPostThumbnail,
    deletePostThumbnail,
} from '@/lib/api/post-service'
import type { Category, Post, PostStatus, UserView } from '@/types/api'
import { from } from '@/styles/media'

export interface PostFormValues {
    title: string
    slug: string
    content: string
    status: PostStatus
    authorId: number
    imageUrl: string
    categoryIds: number[]
    thumbnailFile: File | null
}

interface PostFormProps {
    mode: 'create' | 'edit'
    categories: Category[]
    users: UserView[]
    post?: Post
}

export function PostForm({ mode, categories, users, post }: PostFormProps) {
    const router = useRouter()
    const { user } = useAuth()
    const [formError, setFormError] = useState<string | null>(null)
    const [warning, setWarning] = useState<string | null>(null)
    const [stage, setStage] = useState<'idle' | 'saving' | 'uploading'>('idle')
    const [thumbnailAction, setThumbnailAction] = useState<ThumbnailAction>('keep')

    const isAdmin = canManageUsers(user?.permission ?? '')

    const initialValues = useMemo<PostFormValues>(
        () => ({
            title: post?.title ?? '',
            slug: post?.slug ?? '',
            content: post?.content ?? '',
            status: post ? normalizeStatus(post.status) : 'draft',
            authorId: post?.user_id ?? user?.id ?? 0,
            imageUrl: post?.image_url ?? '',
            categoryIds: (post?.categories ?? []).map((category) => category.id),
            thumbnailFile: null,
        }),
        [post, user?.id],
    )

    if (!user?.id) {
        return (
            <Feedback $tone="danger" role="alert">
                Não foi possível identificar o autor a partir da sessão. Entre novamente.
            </Feedback>
        )
    }

    return (
        <Wrapper>
            <FormErrorSummary message={formError} />
            {warning && <Feedback $tone="warning" role="alert">{warning}</Feedback>}

            <Formik
                initialValues={initialValues}
                validationSchema={postFormSchema}
                enableReinitialize
                onSubmit={async (values, helpers) => {
                    setFormError(null)
                    setWarning(null)
                    setStage('saving')

                    const payload = {
                        title: values.title.trim(),
                        slug: values.slug.trim(),
                        content: values.content.trim(),
                        status: values.status,
                        ...(values.imageUrl.trim() ? { image_url: values.imageUrl.trim() } : {}),
                        categories: values.categoryIds.map((id) => ({ id })),
                    }

                    try {
                        const saved = mode === 'create'
                            ? await createPost({ ...payload, user_id: values.authorId })
                            : await updatePost(post!.id, payload)

                        const postId = mode === 'create' ? saved.id : post!.id

                        try {
                            if (values.thumbnailFile) {
                                setStage('uploading')
                                await uploadPostThumbnail(postId, values.thumbnailFile)
                            } else if (mode === 'edit' && thumbnailAction === 'remove') {
                                setStage('uploading')
                                await deletePostThumbnail(postId).catch((error: unknown) => {
                                    if (isApiError(error) && error.status === 404) {
                                        return
                                    }
                                    throw error
                                })
                            }
                        } catch (imageError) {
                            const reason = isApiError(imageError)
                                ? imageError.message
                                : 'erro ao enviar a imagem'

                            setStage('idle')
                            setWarning(
                                `O post foi salvo, mas a imagem não subiu: ${reason} ` +
                                'Você pode tentar de novo aqui na edição.',
                            )
                            router.replace(`/admin/posts/${postId}/edit`)
                            router.refresh()
                            return
                        }

                        router.push('/admin/posts')
                        router.refresh()
                    } catch (error) {
                        setStage('idle')

                        if (isApiError(error) && Object.keys(error.fieldErrors).length > 0) {
                            helpers.setErrors(error.fieldErrors)
                        }

                        setFormError(
                            isApiError(error) ? error.message : 'Não foi possível salvar o post.',
                        )
                    }
                }}
            >
                {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting }) => (
                    <PostFormFields
                        mode={mode}
                        categories={categories}
                        users={users}
                        isAdmin={isAdmin}
                        currentUserName={user.username}
                        values={values}
                        errors={errors}
                        touched={touched}
                        handleChange={handleChange}
                        handleBlur={handleBlur}
                        setFieldValue={setFieldValue}
                        isSubmitting={isSubmitting}
                        stage={stage}
                        thumbnailAction={thumbnailAction}
                        onThumbnailActionChange={setThumbnailAction}
                        post={post}
                    />
                )}
            </Formik>
        </Wrapper>
    )
}

interface FieldsProps {
    mode: 'create' | 'edit'
    categories: Category[]
    users: UserView[]
    isAdmin: boolean
    currentUserName: string
    values: PostFormValues
    errors: Record<string, unknown>
    touched: Record<string, unknown>
    handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
    handleBlur: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
    setFieldValue: (field: string, value: unknown) => void
    isSubmitting: boolean
    stage: 'idle' | 'saving' | 'uploading'
    thumbnailAction: ThumbnailAction
    onThumbnailActionChange: (action: ThumbnailAction) => void
    post?: Post
}

function PostFormFields({
    mode,
    categories,
    users,
    isAdmin,
    currentUserName,
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    isSubmitting,
    stage,
    thumbnailAction,
    onThumbnailActionChange,
    post,
}: FieldsProps) {
    const { isLocked, onSlugManualChange, regenerateFromSource } = useSlugSync({
        source: values.title,
        setSlug: (value) => setFieldValue('slug', value),
        startLocked: mode === 'edit',
    })

    const errorFor = (field: keyof PostFormValues) =>
        touched[field] ? (errors[field] as string | undefined) : undefined

    const submitLabel = stage === 'uploading'
        ? 'Enviando imagem…'
        : isSubmitting ? 'Salvando…' : mode === 'create' ? 'Publicar post' : 'Salvar alterações'

    return (
        <Form noValidate>
            <Fields>
                <FormField name="title" label="Título" required error={errorFor('title')}>
                    {(fieldProps) => (
                        <TextInput
                            {...fieldProps}
                            name="title"
                            maxLength={255}
                            value={values.title}
                            onChange={handleChange}
                            onBlur={handleBlur}
                        />
                    )}
                </FormField>

                <SlugRow>
                    <FormField
                        name="slug"
                        label="Slug"
                        required
                        hint={
                            isLocked
                                ? 'Slug travado. Apague o campo ou use "Gerar do título" para voltar a acompanhar.'
                                : 'Preenchido a partir do título enquanto você não editar.'
                        }
                        error={errorFor('slug')}
                    >
                        {(fieldProps) => (
                            <TextInput
                                {...fieldProps}
                                name="slug"
                                maxLength={255}
                                value={values.slug}
                                onChange={onSlugManualChange}
                                onBlur={handleBlur}
                            />
                        )}
                    </FormField>

                    <Button type="button" $variant="ghost" onClick={regenerateFromSource}>
                        Gerar do título
                    </Button>
                </SlugRow>

                <TwoColumns>
                    <FormField name="authorId" label="Autor" required error={errorFor('authorId')}>
                        {(fieldProps) =>
                            isAdmin && users.length > 0 ? (
                                <Select
                                    {...fieldProps}
                                    name="authorId"
                                    value={values.authorId}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                >
                                    {users.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.username}
                                        </option>
                                    ))}
                                </Select>
                            ) : (
                                <TextInput
                                    {...fieldProps}
                                    name="authorDisplay"
                                    value={currentUserName}
                                    readOnly
                                    aria-readonly="true"
                                />
                            )
                        }
                    </FormField>

                    <FormField name="status" label="Status" required error={errorFor('status')}>
                        {(fieldProps) => (
                            <Select
                                {...fieldProps}
                                name="status"
                                value={values.status}
                                onChange={handleChange}
                                onBlur={handleBlur}
                            >
                                {POST_STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                        {POST_STATUS_LABELS[status]}
                                    </option>
                                ))}
                            </Select>
                        )}
                    </FormField>
                </TwoColumns>

                <fieldset>
                    <CategoriesLegend>Categorias</CategoriesLegend>
                    {categories.length === 0 ? (
                        <EmptyCategories>
                            Nenhuma categoria cadastrada ainda.
                        </EmptyCategories>
                    ) : (
                        <CheckboxList>
                            {categories.map((category) => {
                                const checked = values.categoryIds.includes(category.id)

                                return (
                                    <CheckboxItem key={category.id}>
                                        <input
                                            type="checkbox"
                                            id={`category-${category.id}`}
                                            checked={checked}
                                            onChange={() =>
                                                setFieldValue(
                                                    'categoryIds',
                                                    checked
                                                        ? values.categoryIds.filter((id) => id !== category.id)
                                                        : [...values.categoryIds, category.id],
                                                )
                                            }
                                        />
                                        <label htmlFor={`category-${category.id}`}>
                                            {category.name}
                                        </label>
                                    </CheckboxItem>
                                )
                            })}
                        </CheckboxList>
                    )}
                </fieldset>

                <FormField name="content" label="Conteúdo" required error={errorFor('content')}>
                    {(fieldProps) => (
                        <TextArea
                            {...fieldProps}
                            name="content"
                            value={values.content}
                            onChange={handleChange}
                            onBlur={handleBlur}
                        />
                    )}
                </FormField>

                <PostImageField
                    imageUrl={values.imageUrl}
                    onImageUrlChange={(value) => setFieldValue('imageUrl', value)}
                    imageUrlError={errorFor('imageUrl')}
                    file={values.thumbnailFile}
                    onFileChange={(file) => setFieldValue('thumbnailFile', file)}
                    fileError={errorFor('thumbnailFile')}
                    thumbnailAction={thumbnailAction}
                    onThumbnailActionChange={onThumbnailActionChange}
                    {...(post ? { existingPostId: post.id, existingVersion: post.updated_at } : {})}
                />

                <Actions>
                    <Button type="submit" disabled={isSubmitting}>
                        {submitLabel}
                    </Button>
                </Actions>
            </Fields>
        </Form>
    )
}

const Wrapper = styled(Card)`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(4)};
`

const Fields = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(5)};
`

const SlugRow = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(2)};

    ${from('md')} {
        flex-direction: row;
        align-items: flex-end;

        > *:first-child {
            flex: 1;
        }
    }
`

const TwoColumns = styled.div`
    display: grid;
    gap: ${({ theme }) => theme.spacing(4)};

    ${from('md')} {
        grid-template-columns: 1fr 1fr;
    }
`

const CategoriesLegend = styled.legend`
    margin-bottom: ${({ theme }) => theme.spacing(2)};
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    font-weight: ${({ theme }) => theme.typography.weights.semibold};
`

const CheckboxList = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing(3)};
`

const CheckboxItem = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(2)};
    font-size: ${({ theme }) => theme.typography.sizes.sm};

    input {
        width: 20px;
        height: 20px;
    }
`

const EmptyCategories = styled.p`
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    color: ${({ theme }) => theme.colors.textMuted};
`

const Actions = styled.div`
    display: flex;
    gap: ${({ theme }) => theme.spacing(2)};
`
