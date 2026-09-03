export const PERMISSIONS = {
  corrections: {
    reader: 'no',
    read_only: 'view',
    tech: 'no',
    editorial: 'yes',
    super_admin: 'yes'
  },
  politicians: {
    reader: 'no',
    read_only: 'view',
    tech: 'no',
    editorial: 'yes',
    super_admin: 'yes'
  },
  monitoring_spirit: {
    reader: 'no',
    read_only: 'view',
    tech: 'no',
    editorial: 'yes',
    super_admin: 'yes'
  },
  reports: {
    reader: 'no',
    read_only: 'view',
    tech: 'no',
    editorial: 'yes',
    super_admin: 'yes'
  },
  platform_health: {
    reader: 'no',
    read_only: 'view',
    tech: 'yes',
    editorial: 'no',
    super_admin: 'yes'
  },
  audit_ledger: {
    reader: 'no',
    read_only: 'view',
    tech: 'view',
    editorial: 'view',
    super_admin: 'yes'
  },
  reader_data: {
    reader: 'no',
    read_only: 'no',
    tech: 'no',
    editorial: 'no',
    super_admin: 'yes'
  },
  staff_management: {
    reader: 'no',
    read_only: 'no',
    tech: 'no',
    editorial: 'no',
    super_admin: 'yes'
  },
  console_access: {
    reader: 'no',
    read_only: 'yes',
    tech: 'yes',
    editorial: 'yes',
    super_admin: 'yes'
  }
};

export function hasPermission(role, isStaffFallback, section, action = 'view') {
  if (role == null) {
    // Fallback mode: if they only have is_staff, they get legacy access (everything)
    return Boolean(isStaffFallback);
  }
  if (role === 'reader') return false;
  
  const sectionPerms = PERMISSIONS[section];
  if (!sectionPerms) return false;
  
  const userPerm = sectionPerms[role];
  if (!userPerm || userPerm === 'no') return false;
  if (action === 'view') return userPerm === 'view' || userPerm === 'yes';
  return userPerm === 'yes';
}

export function isStaffRole(role, isStaffFallback) {
  return role != null ? role !== 'reader' : Boolean(isStaffFallback);
}
