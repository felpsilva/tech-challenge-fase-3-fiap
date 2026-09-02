import type { Permission } from './api'

export const PERMISSIONS: readonly Permission[] = ['admin', 'professor', 'aluno']

export const PERMISSION_LABELS: Record<Permission, string> = {
    admin: 'Administrador',
    professor: 'Professor(a)',
    aluno: 'Aluno(a)',
}

/** Papeis que enxergam a area administrativa. `aluno` so le o blog. */
export const PANEL_PERMISSIONS: readonly string[] = ['admin', 'professor']

export function canAccessPanel(permission: string) {
    return PANEL_PERMISSIONS.includes(permission)
}

export function canManageUsers(permission: string) {
    return permission === 'admin'
}

export function normalizePermission(permission: string): Permission {
    return PERMISSIONS.includes(permission as Permission) ? (permission as Permission) : 'aluno'
}
