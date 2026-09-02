'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Formik, Form } from 'formik'
import * as yup from 'yup'
import styled from 'styled-components'
import { useAuth } from '@/lib/auth/auth-context'
import { isApiError } from '@/lib/api/api-error'
import { FormField } from '@/components/ui/form-field'
import { TextInput } from '@/components/ui/inputs'
import { Button } from '@/components/ui/button'
import { FormErrorSummary } from '@/components/ui/form-error-summary'
import { Feedback } from '@/components/ui/feedback'
import { Card } from '@/components/ui/page-container'

const schema = yup.object({
    username: yup.string().trim().required('Informe o usuário.'),
    password: yup.string().required('Informe a senha.'),
})

interface LoginValues {
    username: string
    password: string
}

const initialValues: LoginValues = { username: '', password: '' }

export function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { signIn } = useAuth()
    const [formError, setFormError] = useState<string | null>(null)

    const expired = searchParams.get('reason') === 'expired'
    const nextPath = searchParams.get('next')

    return (
        <Wrapper>
            {expired && (
                <Feedback $tone="warning">
                    Sua sessão expirou. O acesso vale 1 hora e a API não renova o token.
                </Feedback>
            )}

            <FormErrorSummary message={formError} />

            <Formik
                initialValues={initialValues}
                validationSchema={schema}
                onSubmit={async (values, helpers) => {
                    setFormError(null)

                    try {
                        await signIn(values.username.trim(), values.password)
                        router.replace(nextPath ?? '/admin/posts')
                        router.refresh()
                    } catch (error) {
                        // `fieldErrors` do Zod alimenta o Formik direto.
                        if (isApiError(error) && Object.keys(error.fieldErrors).length > 0) {
                            helpers.setErrors(error.fieldErrors)
                        }

                        setFormError(
                            isApiError(error) ? error.message : 'Não foi possível entrar.',
                        )
                    }
                }}
            >
                {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
                    <Form noValidate>
                        <Fields>
                            <FormField
                                name="username"
                                label="Usuário"
                                required
                                error={touched.username ? errors.username : undefined}
                            >
                                {(fieldProps) => (
                                    <TextInput
                                        {...fieldProps}
                                        name="username"
                                        autoComplete="username"
                                        value={values.username}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                )}
                            </FormField>

                            <FormField
                                name="password"
                                label="Senha"
                                required
                                error={touched.password ? errors.password : undefined}
                            >
                                {(fieldProps) => (
                                    <TextInput
                                        {...fieldProps}
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        value={values.password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                )}
                            </FormField>

                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Entrando…' : 'Entrar'}
                            </Button>
                        </Fields>
                    </Form>
                )}
            </Formik>

            <Note>
                O painel é restrito a docentes e administradores. Contas de aluno leem
                o blog, mas não acessam a administração.
            </Note>
        </Wrapper>
    )
}

const Wrapper = styled(Card)`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(4)};
    max-width: 420px;
    margin: 0 auto;
`

const Fields = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(4)};
`

const Note = styled.p`
    font-size: ${({ theme }) => theme.typography.sizes.xs};
    color: ${({ theme }) => theme.colors.textMuted};
`
