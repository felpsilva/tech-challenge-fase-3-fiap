type Listener = (event: MediaQueryListEvent) => void

export interface MatchMediaControl {
    /** Dispara uma mudanca de preferencia do sistema, como o SO faria. */
    setPrefersDark: (prefersDark: boolean) => void
}

/*
 * O jsdom nao implementa matchMedia. Este stub cobre so o que o tema usa: o valor de
 * `matches` para a media query escura e os listeners de mudanca.
 */
export function mockMatchMedia(prefersDark = false): MatchMediaControl {
    let current = prefersDark
    const listeners = new Set<Listener>()

    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: (query: string) => ({
            media: query,
            matches: query.includes('dark') ? current : false,
            onchange: null,
            addEventListener: (_type: string, listener: Listener) => listeners.add(listener),
            removeEventListener: (_type: string, listener: Listener) => listeners.delete(listener),
            addListener: (listener: Listener) => listeners.add(listener),
            removeListener: (listener: Listener) => listeners.delete(listener),
            dispatchEvent: () => false,
        }),
    })

    return {
        setPrefersDark: (next: boolean) => {
            current = next
            listeners.forEach((listener) => listener({ matches: next } as MediaQueryListEvent))
        },
    }
}
