import type { AppTheme } from './theme'

// Sem esta augmentation, `theme.colors.brand` dentro de um styled component
// nao tem tipo nem autocomplete.
declare module 'styled-components' {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    export interface DefaultTheme extends AppTheme { }
}
