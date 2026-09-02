'use client'

import { useState, type ReactNode } from 'react'
import { useServerInsertedHTML } from 'next/navigation'
import { ServerStyleSheet, StyleSheetManager } from 'styled-components'

/**
 * Coleta o CSS gerado no servidor e injeta no <head> antes do conteudo.
 *
 * Tres detalhes que quebram se mexidos: o `useState(() => ...)` mantem a
 * folha por requisicao (uma folha em escopo de modulo vazaria estilo entre
 * usuarios); o `clearTag()` evita reemitir a mesma regra em cada chunk do
 * streaming; e o retorno antecipado no cliente e o que deixa o
 * styled-components injetar estilo de componente montado depois.
 */
export function StyledComponentsRegistry({ children }: { children: ReactNode }) {
    const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet())

    useServerInsertedHTML(() => {
        const styles = styledComponentsStyleSheet.getStyleElement()
        styledComponentsStyleSheet.instance.clearTag()
        return <>{styles}</>
    })

    if (typeof window !== 'undefined') {
        return <>{children}</>
    }

    return (
        <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
            {children}
        </StyleSheetManager>
    )
}
