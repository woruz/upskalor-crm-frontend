import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AppLayout } from '@/shared/components/ui/appLayout/appLayout';
import { Button } from '@/shared/components/ui/button/button';
import { Input, SearchInput } from '@/shared/components/ui/input';
import { Dropdown } from '@/shared/components/ui/dropdown';
import { Badge } from '@/shared/components/ui/badge/badge';
import { Modal } from '@/shared/components/ui/modal/modal';
import { Checkbox } from '@/shared/components/ui/checkbox/checkbox';
import { Table, type Column } from '@/shared/components/ui/table';
import { useToast } from '@/shared/components/ui/toast/toast';
import { useAuth } from '@/shared/lib/hooks/useAuth';
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  listRoles,
  createRole,
  updateRole,
  deleteRole,
} from '@/shared/lib/api/usersApi';
import { extractApiError } from '@/shared/lib/api/authApi';
import type {
  User,
  Role,
  PermissionAction,
  ResourcePermission,
  CreateUserPayload,
  CreateRolePayload,
  UpdateRolePayload,
} from '@/shared/lib/types';
import styles from './userManagement.module.scss';

const DEFAULT_RESOURCES = ['leads', 'quotations', 'reports', 'users', 'settings'];
const PERMISSION_ACTIONS: { key: PermissionAction; label: string }[] = [
  { key: 'read', label: 'Read (View)' },
  { key: 'create', label: 'Create' },
  { key: 'update', label: 'Update (Edit)' },
  { key: 'delete', label: 'Delete' },
  { key: 'export', label: 'Export' },
];

export const UserManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const fullName = [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ');

  // ── Tab State ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');

  // ── Data States ────────────────────────────────────────────────────────────
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Filter States ──────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // ── Modal States ───────────────────────────────────────────────────────────
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Add User Form State ────────────────────────────────────────────────────
  const [userFirstName, setUserFirstName] = useState('');
  const [userLastName, setUserLastName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState('user');
  const [userErrors, setUserErrors] = useState<Record<string, string>>({});

  // ── Create Role Form State ─────────────────────────────────────────────────
  const [roleName, setRoleName] = useState('');
  const [roleDisplayName, setRoleDisplayName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [rolePermissions, setRolePermissions] = useState<Record<string, PermissionAction[]>>({
    leads: ['read'],
    quotations: ['read'],
    reports: ['read'],
    users: [],
    settings: [],
  });
  const [newResourceInput, setNewResourceInput] = useState('');
  const [roleErrors, setRoleErrors] = useState<Record<string, string>>({});

  // ── Load Data ──────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([listUsers(), listRoles()]);
      setUsers(usersRes.data || []);
      setRoles(rolesRes.data || []);
    } catch {
      addToast({
        title: 'Error',
        description: 'Failed to load user management records.',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Filtered Users ─────────────────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        !searchQuery.trim() ||
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.role.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === 'all' || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  // ── Role Dropdown Options ──────────────────────────────────────────────────
  const roleDropdownOptions = useMemo(() => {
    return roles.map((r) => ({
      label: `${r.displayName} (${r.name})`,
      value: r.name,
    }));
  }, [roles]);

  const roleFilterOptions = useMemo(() => {
    return [
      { label: 'All Roles', value: 'all' },
      ...roles.map((r) => ({ label: r.displayName, value: r.name })),
    ];
  }, [roles]);

  // ── Handlers: Add User ─────────────────────────────────────────────────────
  const resetUserForm = () => {
    setUserFirstName('');
    setUserLastName('');
    setUserEmail('');
    setUserPassword('');
    setUserRole(roles[0]?.name || 'user');
    setUserErrors({});
    setEditingUser(null);
  };

  const handleOpenAddUser = () => {
    resetUserForm();
    setIsAddUserOpen(true);
  };

  const handleOpenEditUser = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setUserFirstName(userToEdit.firstName);
    setUserLastName(userToEdit.lastName);
    setUserEmail(userToEdit.email);
    setUserRole(userToEdit.role);
    setUserErrors({});
    setIsAddUserOpen(true);
  };

  const handleSaveUser = async () => {
    const errs: Record<string, string> = {};
    if (!userFirstName.trim()) errs.firstName = 'First name is required';
    if (!userLastName.trim()) errs.lastName = 'Last name is required';
    if (!userEmail.trim()) errs.email = 'Valid email is required';

    if (!editingUser) {
      if (!userPassword.trim()) {
        errs.password = 'Initial password is required';
      } else if (userPassword.trim().length < 8) {
        errs.password = 'Password must be at least 8 characters long';
      }
    } else if (userPassword.trim() && userPassword.trim().length < 8) {
      errs.password = 'Password must be at least 8 characters long';
    }

    if (Object.keys(errs).length > 0) {
      setUserErrors(errs);
      return;
    }

    setUserErrors({});
    setIsSubmitting(true);
    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          firstName: userFirstName.trim(),
          lastName: userLastName.trim(),
          role: userRole,
          password: userPassword.trim() || undefined,
        });
        addToast({
          title: 'User Updated',
          description: `Updated profile & role for ${userFirstName} ${userLastName}.`,
          variant: 'success',
        });
      } else {
        const payload: CreateUserPayload = {
          firstName: userFirstName.trim(),
          lastName: userLastName.trim(),
          email: userEmail.trim().toLowerCase(),
          password: userPassword.trim(),
          role: userRole,
          status: 'ACTIVE',
        };
        await createUser(payload);
        addToast({
          title: 'User Created',
          description: `New user ${userFirstName} (${userRole}) added successfully.`,
          variant: 'success',
        });
      }

      setIsAddUserOpen(false);
      resetUserForm();
      loadData();
    } catch (err) {
      const msg = extractApiError(err);
      addToast({
        title: 'Failed to Save User',
        description: msg,
        variant: 'error',
      });
      if (msg.toLowerCase().includes('password')) {
        setUserErrors((prev) => ({ ...prev, password: msg }));
      } else if (msg.toLowerCase().includes('email')) {
        setUserErrors((prev) => ({ ...prev, email: msg }));
      } else {
        setUserErrors((prev) => ({ ...prev, submit: msg }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (u: User) => {
    if (u.id === currentUser?.id) {
      addToast({
        title: 'Action Prohibited',
        description: 'You cannot delete your own active super admin account.',
        variant: 'error',
      });
      return;
    }

    if (!confirm(`Are you sure you want to remove user "${u.firstName} ${u.lastName}"?`)) {
      return;
    }

    try {
      await deleteUser(u.id);
      addToast({
        title: 'User Removed',
        description: `Account for ${u.firstName} deleted.`,
        variant: 'info',
      });
      loadData();
    } catch (err) {
      const msg = extractApiError(err);
      addToast({
        title: 'Failed to delete user',
        description: msg,
        variant: 'error',
      });
    }
  };

  const handleToggleUserStatus = async (u: User) => {
    const nextStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateUser(u.id, { status: nextStatus });
      addToast({
        title: 'Status Updated',
        description: `User ${u.firstName} is now ${nextStatus.toLowerCase()}.`,
        variant: 'success',
      });
      loadData();
    } catch (err) {
      const msg = extractApiError(err);
      addToast({
        title: 'Update failed',
        description: msg,
        variant: 'error',
      });
    }
  };

  // ── Handlers: Create & Edit Role ──────────────────────────────────────────
  const resetRoleForm = () => {
    setRoleName('');
    setRoleDisplayName('');
    setRoleDescription('');
    setRolePermissions({
      leads: ['read'],
      quotations: ['read'],
      reports: ['read'],
      users: [],
      settings: [],
    });
    setNewResourceInput('');
    setRoleErrors({});
    setEditingRole(null);
  };

  const handleOpenCreateRole = () => {
    resetRoleForm();
    setIsCreateRoleOpen(true);
  };

  const handleOpenEditRole = (roleToEdit: Role) => {
    setEditingRole(roleToEdit);
    setRoleName(roleToEdit.name);
    setRoleDisplayName(roleToEdit.displayName);
    setRoleDescription(roleToEdit.description || '');

    const initialPerms: Record<string, PermissionAction[]> = {
      leads: [],
      quotations: [],
      reports: [],
      users: [],
      settings: [],
    };

    if (roleToEdit.permissions && Array.isArray(roleToEdit.permissions)) {
      for (const p of roleToEdit.permissions) {
        initialPerms[p.resource] = [...p.actions];
      }
    }

    setRolePermissions(initialPerms);
    setNewResourceInput('');
    setRoleErrors({});
    setIsCreateRoleOpen(true);
  };

  const handleTogglePermission = (resource: string, action: PermissionAction) => {
    setRolePermissions((prev) => {
      const current = prev[resource] || [];
      const hasAction = current.includes(action);
      const nextActions = hasAction
        ? current.filter((a) => a !== action)
        : [...current, action];
      return { ...prev, [resource]: nextActions };
    });
  };

  const handleToggleAllActionsForResource = (resource: string) => {
    setRolePermissions((prev) => {
      const current = prev[resource] || [];
      const allActions: PermissionAction[] = ['create', 'read', 'update', 'delete', 'export'];
      const hasAll = allActions.every((a) => current.includes(a));
      return { ...prev, [resource]: hasAll ? [] : allActions };
    });
  };

  const handleAddNewResource = () => {
    const sanitized = newResourceInput.trim().toLowerCase().replace(/\s+/g, '_');
    if (!sanitized) return;

    if (rolePermissions[sanitized]) {
      addToast({
        title: 'Resource Exists',
        description: `Resource "${sanitized}" is already in the permissions list.`,
        variant: 'info',
      });
      return;
    }

    setRolePermissions((prev) => ({
      ...prev,
      [sanitized]: ['read'],
    }));
    setNewResourceInput('');
    addToast({
      title: 'Resource Added',
      description: `Added "${sanitized}" to role permission builder.`,
      variant: 'success',
    });
  };

  const handleRemoveCustomResource = (resKey: string) => {
    setRolePermissions((prev) => {
      const next = { ...prev };
      delete next[resKey];
      return next;
    });
  };

  const handleSaveRole = async () => {
    const errs: Record<string, string> = {};
    if (!roleDisplayName.trim()) errs.displayName = 'Display name is required';
    if (!roleName.trim()) errs.name = 'Role key identifier is required';

    if (Object.keys(errs).length > 0) {
      setRoleErrors(errs);
      return;
    }

    const formattedPermissions: ResourcePermission[] = Object.entries(rolePermissions)
      .filter(([, actions]) => actions.length > 0)
      .map(([resource, actions]) => ({ resource, actions }));

    setIsSubmitting(true);
    try {
      if (editingRole) {
        const payload: UpdateRolePayload = {
          name: roleName.trim().toLowerCase().replace(/\s+/g, '_'),
          displayName: roleDisplayName.trim(),
          description: roleDescription.trim(),
          permissions: formattedPermissions,
        };
        await updateRole(editingRole.id, payload);
        setRoles((prev) =>
          prev.map((r) =>
            r.id === editingRole.id
              ? {
                  ...r,
                  displayName: payload.displayName || r.displayName,
                  description: payload.description,
                  permissions: formattedPermissions,
                  updatedAt: new Date().toISOString(),
                }
              : r,
          ),
        );
        addToast({
          title: 'Role Updated',
          description: `Role "${roleDisplayName.trim()}" updated successfully.`,
          variant: 'success',
        });
      } else {
        const payload: CreateRolePayload = {
          name: roleName.trim().toLowerCase().replace(/\s+/g, '_'),
          displayName: roleDisplayName.trim(),
          description: roleDescription.trim(),
          permissions: formattedPermissions,
        };
        await createRole(payload);
        addToast({
          title: 'Role Created',
          description: `Role "${payload.displayName}" with custom permissions created successfully.`,
          variant: 'success',
        });
      }

      setIsCreateRoleOpen(false);
      resetRoleForm();
      loadData();
    } catch (err) {
      const msg = extractApiError(err);
      addToast({
        title: editingRole ? 'Failed to update role' : 'Failed to create role',
        description: msg,
        variant: 'error',
      });
      setRoleErrors({ submit: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = async (r: Role) => {
    if (r.isSystem) {
      addToast({
        title: 'Protected Role',
        description: 'System roles cannot be deleted.',
        variant: 'warning',
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete role "${r.displayName}"?`)) {
      return;
    }

    try {
      await deleteRole(r.id);
      addToast({
        title: 'Role Deleted',
        description: `Role "${r.displayName}" deleted.`,
        variant: 'info',
      });
      loadData();
    } catch (err) {
      const msg = extractApiError(err);
      addToast({
        title: 'Delete Failed',
        description: msg,
        variant: 'error',
      });
    }
  };

  // ── Table Columns for Users ────────────────────────────────────────────────
  const userColumns: Column<User>[] = [
    {
      key: 'user',
      header: 'USER',
      render: (_, row) => (
        <div className={styles.userCell}>
          <div className={styles.avatar}>
            {(row.firstName?.[0] || 'U').toUpperCase()}
          </div>
          <div>
            <div className={styles.userName}>{row.firstName} {row.lastName}</div>
            <div className={styles.userEmail}>{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'ASSIGNED ROLE',
      render: (val) => {
        const matched = roles.find((r) => r.name === val);
        const label = matched?.displayName || String(val).replace('_', ' ').toUpperCase();
        const variant =
          val === 'super_admin' ? 'primary' : val === 'admin' ? 'info' : 'secondary';
        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      key: 'status',
      header: 'STATUS',
      render: (val) => (
        <Badge variant={val === 'ACTIVE' ? 'success' : 'default'} pill>
          {val || 'ACTIVE'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'JOINED DATE',
      render: (val) =>
        val
          ? new Date(val).toLocaleDateString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
            })
          : '-',
    },
    {
      key: 'actions',
      header: 'ACTIONS',
      align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => handleOpenEditUser(row)}
            title="Edit User & Role"
            aria-label="Edit User"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => handleToggleUserStatus(row)}
            title={row.status === 'ACTIVE' ? 'Deactivate User' : 'Activate User'}
            aria-label="Toggle Status"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            onClick={() => handleDeleteUser(row)}
            title="Delete User"
            aria-label="Delete User"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  return (
    <AppLayout
      headerProps={{
        title: 'User & Role Management',
        breadcrumbs: [{ label: 'CRM' }, { label: 'User & Access Management' }],
        userName: fullName || currentUser?.email || 'Admin',
        userRole: currentUser?.role || 'super_admin',
      }}
    >
      <div className={styles.page}>
        {/* Page Header */}
        <div className={styles.headerCard}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageTitle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              User & Access Control Center
            </h1>
            <p className={styles.pageSubtitle}>
              Create users, assign organizational roles, and configure granular permissions across all system resources.
            </p>
          </div>
          <Badge variant="primary" pill>
            Super Administrator Control
          </Badge>
        </div>

        {/* Navigation Tabs */}
        <div className={styles.tabsContainer}>
          <div className={styles.tabList}>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'users' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Users
              <span className={`${styles.tabBadge} ${activeTab === 'users' ? styles.tabBadgeActive : ''}`}>
                {users.length}
              </span>
            </button>

            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'roles' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('roles')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Roles & Resource Permissions
              <span className={`${styles.tabBadge} ${activeTab === 'roles' ? styles.tabBadgeActive : ''}`}>
                {roles.length}
              </span>
            </button>
          </div>

          {/* TAB 1: USERS */}
          {activeTab === 'users' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Toolbar */}
              <div className={styles.toolbar}>
                <div className={styles.toolbarLeft}>
                  <div className={styles.searchWrap}>
                    <SearchInput
                      placeholder="Search users by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onClear={() => setSearchQuery('')}
                      size="sm"
                    />
                  </div>
                  <Dropdown
                    size="sm"
                    options={roleFilterOptions}
                    value={roleFilter}
                    onChange={(val) => setRoleFilter(String(val))}
                    inline
                  />
                </div>

                <div className={styles.toolbarRight}>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleOpenAddUser}
                    leftIcon={
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    }
                  >
                    Add New User
                  </Button>
                </div>
              </div>

              {/* Users Table */}
              <div className={styles.tableCard}>
                <Table
                  columns={userColumns}
                  data={filteredUsers}
                  isLoading={isLoading}
                  emptyText="No users found matching your criteria."
                />
              </div>
            </div>
          )}

          {/* TAB 2: ROLES & PERMISSIONS */}
          {activeTab === 'roles' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className={styles.toolbar}>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  Showing {roles.length} system and custom roles with granular CRUD+Export capabilities.
                </p>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOpenCreateRole}
                  leftIcon={
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  }
                >
                  Create New Role
                </Button>
              </div>

              <div className={styles.rolesGrid}>
                {roles.map((r) => (
                  <div key={r.id} className={styles.roleCard}>
                    <div className={styles.roleCardHeader}>
                      <div className={styles.roleTitleWrap}>
                        <h3 className={styles.roleDisplayName}>
                          {r.displayName}
                          {r.isSystem && (
                            <Badge variant="secondary" size="sm">
                              System
                            </Badge>
                          )}
                        </h3>
                        <span className={styles.roleKeyName}>role: {r.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Badge variant="info" pill>
                          {r.userCount || 0} Users
                        </Badge>
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => handleOpenEditRole(r)}
                          title="Edit Role & Permissions"
                          aria-label="Edit Role"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {r.description && <p className={styles.roleDesc}>{r.description}</p>}

                    <div className={styles.permissionsSummary}>
                      <span className={styles.permTitle}>Resource Permissions ({r.permissions?.length || 0})</span>
                      <div className={styles.resourcePermList}>
                        {(r.permissions || []).map((p) => (
                          <div key={p.resource} className={styles.resourcePermItem}>
                            <span className={styles.resourceName}>{p.resource}</span>
                            <div className={styles.actionsChips}>
                              {p.actions.map((act) => (
                                <span
                                  key={act}
                                  className={`${styles.actionChip} ${
                                    act === 'delete' ? styles.actionChipDelete : ''
                                  }`}
                                >
                                  {act}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={styles.roleCardFooter}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEditRole(r)}
                        leftIcon={
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                          </svg>
                        }
                      >
                        Edit Role
                      </Button>
                      {!r.isSystem ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRole(r)}
                          style={{ color: 'var(--color-error)' }}
                        >
                          Delete Role
                        </Button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                          System Protected Role
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── MODAL: ADD / EDIT USER ────────────────────────────────────────── */}
        <Modal
          isOpen={isAddUserOpen}
          onClose={() => setIsAddUserOpen(false)}
          size="md"
          closeOnOverlayClick={!isSubmitting}
        >
          <Modal.Header
            title={editingUser ? `Edit User: ${editingUser.firstName}` : 'Add New User'}
            onClose={() => setIsAddUserOpen(false)}
          />
          <Modal.Content>
            <div className={styles.modalForm}>
              <div className={styles.row}>
                <Input
                  label="First Name *"
                  placeholder="e.g. Rahul"
                  value={userFirstName}
                  onChange={(e) => setUserFirstName(e.target.value)}
                  error={userErrors.firstName}
                />
                <Input
                  label="Last Name *"
                  placeholder="e.g. Sharma"
                  value={userLastName}
                  onChange={(e) => setUserLastName(e.target.value)}
                  error={userErrors.lastName}
                />
              </div>

              <Input
                label="Email Address *"
                type="email"
                placeholder="name@company.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                disabled={Boolean(editingUser)}
                error={userErrors.email}
              />

              <Input
                label={editingUser ? 'Reset Password (Leave blank to keep)' : 'Initial Password *'}
                type="password"
                placeholder={editingUser ? '••••••••' : 'Min 8 characters'}
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                error={userErrors.password}
              />

              <Dropdown
                label="Assign Role *"
                options={roleDropdownOptions}
                value={userRole}
                onChange={(val) => setUserRole(String(val))}
              />
            </div>
          </Modal.Content>
          <Modal.Footer>
            <Button variant="outline" onClick={() => setIsAddUserOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveUser} isLoading={isSubmitting}>
              {editingUser ? 'Save Changes' : 'Create User'}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* ── MODAL: CREATE / EDIT ROLE WITH DYNAMIC RESOURCE PERMISSIONS ──── */}
        <Modal
          isOpen={isCreateRoleOpen}
          onClose={() => setIsCreateRoleOpen(false)}
          size="lg"
          closeOnOverlayClick={!isSubmitting}
        >
          <Modal.Header
            title={editingRole ? `Edit Role: ${editingRole.displayName}` : 'Create New Role & Permission Matrix'}
            onClose={() => setIsCreateRoleOpen(false)}
          />
          <Modal.Content>
            <div className={styles.modalForm}>
              {editingRole?.isSystem && (
                <div
                  style={{
                    padding: '10px 14px',
                    background: 'var(--color-bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8125rem',
                    color: 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, color: 'var(--color-primary-600)' }}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <span>
                    <strong>System Role:</strong> The identifier key is immutable. You can customize the display name, description, and fine-tune resource permissions.
                  </span>
                </div>
              )}

              <div className={styles.row}>
                <Input
                  label="Role Display Name *"
                  placeholder="e.g. Solar Design Engineer"
                  value={roleDisplayName}
                  onChange={(e) => {
                    setRoleDisplayName(e.target.value);
                    if (!editingRole && !roleName) {
                      setRoleName(e.target.value.toLowerCase().replace(/\s+/g, '_'));
                    }
                  }}
                  error={roleErrors.displayName}
                />
                <Input
                  label="Role Identifier Key *"
                  placeholder="e.g. design_engineer"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                  disabled={Boolean(editingRole)}
                  helpText={editingRole ? 'Unique system key cannot be changed.' : 'Used in codebase & API (immutable once saved)'}
                  error={roleErrors.name}
                />
              </div>

              <Input
                label="Role Description"
                placeholder="Describe the responsibilities and scope of this role..."
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
              />

              {/* Resource Permissions Builder */}
              <div className={styles.permissionsBuilder}>
                <div className={styles.builderHeader}>
                  <h4 className={styles.builderTitle}>Resource Access Permissions</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    Toggle CRUD+E capabilities per resource
                  </span>
                </div>

                <div className={styles.resourceRows}>
                  {Object.keys(rolePermissions).map((resKey) => {
                    const currentActions = rolePermissions[resKey] || [];
                    const isCustom = !DEFAULT_RESOURCES.includes(resKey);

                    return (
                      <div key={resKey} className={styles.permRow}>
                        <div className={styles.permRowTop}>
                          <span className={styles.permRowResource}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polygon points="12 2 2 7 12 12 22 7 12 2" />
                              <polyline points="2 17 12 22 22 17" />
                              <polyline points="2 12 12 17 22 12" />
                            </svg>
                            {resKey}
                            {isCustom && (
                              <Badge variant="info" size="sm">
                                Custom Resource
                              </Badge>
                            )}
                          </span>

                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleAllActionsForResource(resKey)}
                            >
                              Toggle All
                            </Button>
                            {isCustom && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveCustomResource(resKey)}
                                style={{ color: 'var(--color-error)' }}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className={styles.permCheckboxes}>
                          {PERMISSION_ACTIONS.map(({ key, label }) => (
                            <Checkbox
                              key={key}
                              id={`${resKey}_${key}`}
                              label={label}
                              checked={currentActions.includes(key)}
                              onChange={() => handleTogglePermission(resKey, key)}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add New Resource Control */}
                <div className={styles.addResourceBox}>
                  <div className={styles.addResourceInput}>
                    <Input
                      placeholder="Add new resource (e.g. inventory, invoices, audits)..."
                      value={newResourceInput}
                      onChange={(e) => setNewResourceInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNewResource();
                        }
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={handleAddNewResource}
                    leftIcon={
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    }
                  >
                    Add Resource
                  </Button>
                </div>
              </div>
            </div>
          </Modal.Content>
          <Modal.Footer>
            <Button variant="outline" onClick={() => setIsCreateRoleOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveRole} isLoading={isSubmitting}>
              {editingRole ? 'Update Role & Permissions' : 'Save Role & Permissions'}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </AppLayout>
  );
};

export default UserManagementPage;
