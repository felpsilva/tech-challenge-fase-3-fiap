
function flush() {
    return new Promise((resolve) => setTimeout(resolve, 0))
}

describe('bootstrap do servidor', () => {
    beforeEach(() => {
        jest.resetModules()
        jest.spyOn(console, 'log').mockImplementation(() => undefined)
        jest.spyOn(console, 'error').mockImplementation(() => undefined)
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('nao abre a porta enquanto o banco nao esta pronto', async () => {
        let liberaBanco!: () => void
        const bancoPronto = new Promise<void>((resolve) => {
            liberaBanco = resolve
        })
        const listen = jest.fn().mockResolvedValue(undefined)

        jest.doMock('@/app', () => ({ app: { listen } }))
        jest.doMock('@/lib/typeorm/typeorm', () => ({ databaseReady: bancoPronto }))

        require('./server')
        await flush()

        expect(listen).not.toHaveBeenCalled()

        liberaBanco()
        await flush()

        expect(listen).toHaveBeenCalledTimes(1)
        expect(listen).toHaveBeenCalledWith({ host: '0.0.0.0', port: expect.any(Number) })
    })

    it('sai com codigo 1 quando o banco falha, sem abrir a porta', async () => {
        const listen = jest.fn()
        const exit = jest.spyOn(process, 'exit').mockImplementation((() => undefined) as never)

        jest.doMock('@/app', () => ({ app: { listen } }))
        jest.doMock('@/lib/typeorm/typeorm', () => ({
            databaseReady: Promise.reject(new Error('banco inacessivel')),
        }))

        require('./server')
        await flush()

        expect(listen).not.toHaveBeenCalled()
        expect(exit).toHaveBeenCalledWith(1)
    })

    it('sai com codigo 1 quando a porta ja esta em uso', async () => {
        const listen = jest.fn().mockRejectedValue(new Error('EADDRINUSE'))
        const exit = jest.spyOn(process, 'exit').mockImplementation((() => undefined) as never)

        jest.doMock('@/app', () => ({ app: { listen } }))
        jest.doMock('@/lib/typeorm/typeorm', () => ({ databaseReady: Promise.resolve() }))

        require('./server')
        await flush()

        expect(listen).toHaveBeenCalledTimes(1)
        expect(exit).toHaveBeenCalledWith(1)
    })
})
