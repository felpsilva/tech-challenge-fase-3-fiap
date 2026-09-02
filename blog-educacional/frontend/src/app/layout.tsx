import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { StyledComponentsRegistry } from '@/styles/styled-components-registry'
import { AppThemeProvider } from '@/styles/app-theme-provider'
import { AuthProvider } from '@/lib/auth/auth-context'
import { SkipLink } from '@/components/layout/skip-link'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'

export const metadata: Metadata = {
    title: {
        default: 'Blog Educacional',
        template: '%s · Blog Educacional',
    },
    description: 'Posts e materiais publicados por docentes para alunos.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        // `lang` em pt-BR importa para a pronúncia em leitor de tela.
        <html lang="pt-BR">
            <body>
                {/* O registry envolve o tema para capturar também o global style. */}
                <StyledComponentsRegistry>
                    <AppThemeProvider>
                        <AuthProvider>
                            <SkipLink />
                            <SiteHeader />
                            <main id="conteudo-principal">{children}</main>
                            <SiteFooter />
                        </AuthProvider>
                    </AppThemeProvider>
                </StyledComponentsRegistry>
            </body>
        </html>
    )
}
