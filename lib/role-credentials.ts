import type { UserRole } from "./types"

export interface RoleCredentials {
  email: string
  password: string
}

export function getRoleCredentials(role: UserRole): RoleCredentials {
  const credentials: Record<UserRole, RoleCredentials> = {
    system_admin: {
      email: process.env.NEXT_PUBLIC_ADMIN_EMAIL || '',
      password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || ''
    },
    district_manager: {
      email: process.env.NEXT_PUBLIC_DISTRICT_EMAIL || '',
      password: process.env.NEXT_PUBLIC_DISTRICT_PASSWORD || ''
    },
    local_admin: {
      email: process.env.NEXT_PUBLIC_LOCAL_EMAIL || '',
      password: process.env.NEXT_PUBLIC_LOCAL_PASSWORD || ''
    },
    operations: {
      email: process.env.NEXT_PUBLIC_OPERATIONS_EMAIL || '',
      password: process.env.NEXT_PUBLIC_OPERATIONS_PASSWORD || ''
    }
  }
  
  return credentials[role] || { email: '', password: '' }
}

export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    system_admin: 'System Admin',
    district_manager: 'District Manager',
    local_admin: 'Local Admin',
    operations: 'Operations'
  }
  
  return displayNames[role] || role
}

export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    system_admin: 'Full system oversight and user management',
    district_manager: 'District-level operations and coordination',
    local_admin: 'Town-level venue and booking management',
    operations: 'Department resource management and notifications'
  }
  
  return descriptions[role] || ''
}

export function validateRoleCredentials(role: UserRole): boolean {
  const credentials = getRoleCredentials(role)
  return credentials.email !== '' && credentials.password !== ''
}
