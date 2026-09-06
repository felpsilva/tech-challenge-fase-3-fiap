'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Formik, Form } from 'formik'
import * as yup from 'yup'
import styled from 'styled-components'
import { FormField } from '@/components/ui/form-field'
import { TextInput } from '@/components/ui/inputs'
import { Button } from '@/components/ui/button'
import { FormErrorSummary } from '@/components/ui/form-error-summary'
import { Card } from '@/components/ui/page-container'
import { useSlugSync } from '@/lib/hooks/use-slug-sync'
import { isApiError } from '@/lib/api/api-error'
import { createCategory, updateCategory } from '@/lib/api/category-service'
import { from } from '@/styles/media'
import type { Category } from '@/types/api'

const schema = yup.object({
    name: yup
        .string()
        .trim()
        .required('Informe o nome da categoria.')
        .max(255, 'O nome passa de 255 caracteres.'),
    slug: yup
        .string()
        .trim()
        .required('O slug é obrigatório.')
        .max(255, 'O slug passa de 255 caracteres.')
        .matches(/^[a-z0-9-]+$/, 'Use apenas letras minúsculas, números e hífen.'),
})

interface CategoryFormValues {
    name: string
    slug: string
}

interface CategoryFormProps {
    mode: 'create' | 'edit'
    category?: Category
}

export function CategoryForm({ mode, category }: CategoryFormProps) {
    const router = useRouter()
    const [formError, setFormError] = useState<string | null>(null)

    const initialValues: CategoryFormValues = {
        name: category?.name ?? '',
        slug: category?.slug ?? '',
    }

    return (
        <Wrapper>
            <FormErrorSummary message={formError} />

            <Formik
                initialValues={initialValues}
                validationSchema={schema}
                enableReinitialize
                onSubmit={async (values, helpers) => {
                    setFormError(null)

                    const payload = { name: values.name.trim(), slug: values.slug.trim() }

                    try {
                        if (mode === 'create') {
                            await createCategory(payload)
                        } else {
                            await updateCategory(category!.id, payload)
                        }

                        router.push('/admin/categories')
                        router.refresh()
                    } catch (error) {
                        if (isApiError(error) && Object.keys(error.fieldErrors).length > 0) {
                            helpers.setErrors(error.fieldErrors)
                        }

                        setFormError(
                            isApiError(error)
                                ? error.message
                                : 'Não foi possível salvar a categoria.',
                        )
                    }
                }}
            >
                {({ values, errors, touched, handleChange, handleBlur, setFieldValue, isSubmitting }) => (
                    <CategoryFields
                        mode={mode}
                        values={values}
                        errors={errors}
                        touched={touched}
                        handleChange={handleChange}
                        handleBlur={handleBlur}
                        setFieldValue={setFieldValue}
                        isSubmitting={isSubmitting}
                    />
                )}
            </Formik>
        </Wrapper>
    )
}

interface CategoryFieldsProps {
    mode: 'create' | 'edit'
    values: CategoryFormValues
    errors: Record<string, unknown>
    touched: Record<string, unknown>
    handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    handleBlur: (event: React.FocusEvent<HTMLInputElement>) => void
    setFieldValue: (field: string, value: unknown) => void
    isSubmitting: boolean
}

function CategoryFields({
    mode,
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    isSubmitting,
}: CategoryFieldsProps) {
    const { isLocked, onSlugManualChange, regenerateFromSource } = useSlugSync({
        source: values.name,
        setSlug: (value) => setFieldValue('slug', value),
        startLocked: mode === 'edit',
    })

    return (
        <Form noValidate>
            <Fields>
                <FormField
                    name="name"
                    label="Nome"
                    required
                    error={touched.name ? (errors.name as string | undefined) : undefined}
                >
                    {(fieldProps) => (
                        <TextInput
                            {...fieldProps}
                            name="name"
                            maxLength={255}
                            value={values.name}
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
                                ? 'Slug travado. Apague o campo ou use "Gerar do nome".'
                                : 'Preenchido a partir do nome enquanto você não editar.'
                        }
                        error={touched.slug ? (errors.slug as string | undefined) : undefined}
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
                        Gerar do nome
                    </Button>
                </SlugRow>

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                        ? 'Salvando…'
                        : mode === 'create' ? 'Criar categoria' : 'Salvar alterações'}
                </Button>
            </Fields>
        </Form>
    )
}

const Wrapper = styled(Card)`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(4)};
    max-width: 560px;
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
