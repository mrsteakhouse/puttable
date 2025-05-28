<script lang="ts">
    import { superForm } from 'sveltekit-superforms/client';
    import type { PageProps } from './$types';
    import { Button, Card, Input, Label, Modal, Select, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from 'flowbite-svelte';
    import { PlusIcon, TrashIcon, PencilIcon } from 'lucide-svelte';

    let { data }: PageProps = $props();

    // User management
    let selectedUser: any = $state(null);
    let userRoleModalOpen = $state(false);
    let selectedRole = $state('');

    function openUserRoleModal(user: any) {
        selectedUser = user;
        userRoleModalOpen = true;
    }

    // Role management
    let roleModalOpen = $state(false);
    let editingRole: any = $state(null);
    let roleName = $state('');
    let roleDescription = $state('');

    function openCreateRoleModal() {
        editingRole = null;
        roleName = '';
        roleDescription = '';
        roleModalOpen = true;
    }

    function openEditRoleModal(role: any) {
        editingRole = role;
        roleName = role.role_name;
        roleDescription = role.role_description || '';
        roleModalOpen = true;
    }

    // Permission management
    let permissionModalOpen = $state(false);
    let selectedRoleForPermissions: any = $state(null);
    let selectedPermission = $state('');

    function openPermissionModal(role: any) {
        selectedRoleForPermissions = role;
        permissionModalOpen = true;
    }

    // Helper function to check if a role has a permission
    function hasPermission(role: any, permissionId: number): boolean {
        if (!role.permissions) return false;
        return role.permissions.some((p: any) => p.id === permissionId);
    }

    // Form handlers
    const assignRoleForm = superForm({}, {
        id: 'assignRole',
        dataType: 'json',
        resetForm: true,
        onSubmit: ({ form, data, cancel }) => {
            if (!selectedUser || !selectedRole) {
                cancel();
            }
            form.userId = selectedUser.user_id;
            form.roleName = selectedRole;
        },
        onResult: ({ result }) => {
            if (result.type === 'success') {
                userRoleModalOpen = false;
                // Refresh the page to show updated data
                window.location.reload();
            }
        }
    });

    const removeRoleForm = superForm({}, {
        id: 'removeRole',
        dataType: 'json',
        resetForm: true,
        onResult: ({ result }) => {
            if (result.type === 'success') {
                // Refresh the page to show updated data
                window.location.reload();
            }
        }
    });

    const roleForm = superForm({}, {
        id: 'roleForm',
        dataType: 'json',
        resetForm: true,
        onSubmit: ({ form, cancel }) => {
            if (!roleName) {
                cancel();
            }
            form.name = roleName;
            form.description = roleDescription;
            if (editingRole) {
                form.roleId = editingRole.role_id;
            }
        },
        onResult: ({ result }) => {
            if (result.type === 'success') {
                roleModalOpen = false;
                // Refresh the page to show updated data
                window.location.reload();
            }
        }
    });

    const deleteRoleForm = superForm({}, {
        id: 'deleteRole',
        dataType: 'json',
        resetForm: true,
        onResult: ({ result }) => {
            if (result.type === 'success') {
                // Refresh the page to show updated data
                window.location.reload();
            }
        }
    });

    const assignPermissionForm = superForm({}, {
        id: 'assignPermission',
        dataType: 'json',
        resetForm: true,
        onSubmit: ({ form, data, cancel }) => {
            if (!selectedRoleForPermissions || !selectedPermission) {
                cancel();
            }
            form.roleId = selectedRoleForPermissions.role_id;
            form.permissionId = parseInt(selectedPermission);
        },
        onResult: ({ result }) => {
            if (result.type === 'success') {
                // Refresh the page to show updated data
                window.location.reload();
            }
        }
    });

    const removePermissionForm = superForm({}, {
        id: 'removePermission',
        dataType: 'json',
        resetForm: true,
        onResult: ({ result }) => {
            if (result.type === 'success') {
                // Refresh the page to show updated data
                window.location.reload();
            }
        }
    });
</script>

<div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-6">Admin Dashboard</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Users Section -->
        <Card>
            <h2 class="text-2xl font-bold mb-4">Users</h2>
            <Table>
                <TableHead>
                    <TableHeadCell>Name</TableHeadCell>
                    <TableHeadCell>Email</TableHeadCell>
                    <TableHeadCell>Roles</TableHeadCell>
                    <TableHeadCell>Actions</TableHeadCell>
                </TableHead>
                <TableBody>
                    {#each data.users as user}
                        <TableBodyRow>
                            <TableBodyCell>{user.user_name || 'N/A'}</TableBodyCell>
                            <TableBodyCell>{user.email}</TableBodyCell>
                            <TableBodyCell>{user.roles?.join(', ') || 'None'}</TableBodyCell>
                            <TableBodyCell>
                                <Button size="xs" color="blue" onclick={() => openUserRoleModal(user)}>
                                    Manage Roles
                                </Button>
                            </TableBodyCell>
                        </TableBodyRow>
                    {/each}
                </TableBody>
            </Table>
        </Card>

        <!-- Roles Section -->
        <Card>
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold">Roles</h2>
                <Button size="sm" color="blue" onclick={openCreateRoleModal}>
                    <PlusIcon class="mr-2 h-4 w-4" />
                    New Role
                </Button>
            </div>
            <Table>
                <TableHead>
                    <TableHeadCell>Name</TableHeadCell>
                    <TableHeadCell>Description</TableHeadCell>
                    <TableHeadCell>Permissions</TableHeadCell>
                    <TableHeadCell>Actions</TableHeadCell>
                </TableHead>
                <TableBody>
                    {#each data.roles as role}
                        <TableBodyRow>
                            <TableBodyCell>{role.role_name}</TableBodyCell>
                            <TableBodyCell>{role.role_description || 'N/A'}</TableBodyCell>
                            <TableBodyCell>
                                {#if role.permissions}
                                    <span class="text-xs">{role.permissions.length} permissions</span>
                                {:else}
                                    <span class="text-xs">No permissions</span>
                                {/if}
                            </TableBodyCell>
                            <TableBodyCell>
                                <div class="flex space-x-2">
                                    <Button size="xs" color="blue" onclick={() => openPermissionModal(role)}>
                                        Permissions
                                    </Button>
                                    <Button size="xs" color="light" onclick={() => openEditRoleModal(role)}>
                                        <PencilIcon class="h-4 w-4" />
                                    </Button>
                                    {#if role.role_name !== 'admin' && role.role_name !== 'manager' && role.role_name !== 'player'}
                                        <form method="POST" action="?/deleteRole" use:deleteRoleForm.enhance>
                                            <input type="hidden" name="roleId" value={role.role_id} />
                                            <Button size="xs" color="red" type="submit">
                                                <TrashIcon class="h-4 w-4" />
                                            </Button>
                                        </form>
                                    {/if}
                                </div>
                            </TableBodyCell>
                        </TableBodyRow>
                    {/each}
                </TableBody>
            </Table>
        </Card>
    </div>

    <!-- User Role Modal -->
    <Modal bind:open={userRoleModalOpen} title="Manage User Roles">
        {#if selectedUser}
            <div class="space-y-4">
                <p>Assign a role to <strong>{selectedUser.user_name || selectedUser.email}</strong></p>

                <form method="POST" action="?/assignRole" use:assignRoleForm.enhance class="space-y-4">
                    <div>
                        <Label for="roleName">Role</Label>
                        <Select id="roleName" bind:value={selectedRole}>
                            <option value="" disabled selected>Select a role</option>
                            {#each data.roles as role}
                                <option value={role.role_name}>{role.role_name}</option>
                            {/each}
                        </Select>
                    </div>
                    <Button type="submit" color="blue">Assign Role</Button>
                </form>

                <hr class="my-4" />

                <h3 class="font-bold">Current Roles</h3>
                {#if selectedUser.roles && selectedUser.roles.length > 0}
                    <ul class="space-y-2">
                        {#each selectedUser.roles as roleName}
                            <li class="flex justify-between items-center">
                                <span>{roleName}</span>
                                {#if roleName !== 'player' || selectedUser.roles.length > 1}
                                    <form method="POST" action="?/removeRole" use:removeRoleForm.enhance>
                                        <input type="hidden" name="userId" value={selectedUser.user_id} />
                                        <input type="hidden" name="roleName" value={roleName} />
                                        <Button size="xs" color="red" type="submit">Remove</Button>
                                    </form>
                                {/if}
                            </li>
                        {/each}
                    </ul>
                {:else}
                    <p class="text-gray-500">No roles assigned</p>
                {/if}
            </div>
        {/if}
    </Modal>

    <!-- Role Modal -->
    <Modal bind:open={roleModalOpen} title={editingRole ? 'Edit Role' : 'Create Role'}>
        <form method="POST" action={editingRole ? '?/updateRole' : '?/createRole'} use:roleForm.enhance class="space-y-4">
            {#if editingRole}
                <input type="hidden" name="roleId" value={editingRole.role_id} />
            {/if}
            <div>
                <Label for="name">Role Name</Label>
                <Input id="name" name="name" bind:value={roleName} required />
            </div>
            <div>
                <Label for="description">Description</Label>
                <Input id="description" name="description" bind:value={roleDescription} />
            </div>
            <Button type="submit" color="blue">{editingRole ? 'Update' : 'Create'}</Button>
        </form>
    </Modal>

    <!-- Permission Modal -->
    <Modal bind:open={permissionModalOpen} title="Manage Permissions" size="lg">
        {#if selectedRoleForPermissions}
            <div class="space-y-4">
                <p>Manage permissions for role: <strong>{selectedRoleForPermissions.role_name}</strong></p>

                <form method="POST" action="?/assignPermission" use:assignPermissionForm.enhance class="space-y-4">
                    <div>
                        <Label for="permissionId">Add Permission</Label>
                        <Select id="permissionId" bind:value={selectedPermission}>
                            <option value="" disabled selected>Select a permission</option>
                            {#each data.permissions as permission}
                                {#if !hasPermission(selectedRoleForPermissions, permission.id)}
                                    <option value={permission.id}>
                                        {permission.name} ({permission.resource}/{permission.action})
                                    </option>
                                {/if}
                            {/each}
                        </Select>
                    </div>
                    <Button type="submit" color="blue">Add Permission</Button>
                </form>

                <hr class="my-4" />

                <h3 class="font-bold">Current Permissions</h3>
                {#if selectedRoleForPermissions.permissions && selectedRoleForPermissions.permissions.length > 0}
                    <div class="max-h-96 overflow-y-auto">
                        <Table>
                            <TableHead>
                                <TableHeadCell>Name</TableHeadCell>
                                <TableHeadCell>Resource</TableHeadCell>
                                <TableHeadCell>Action</TableHeadCell>
                                <TableHeadCell>Actions</TableHeadCell>
                            </TableHead>
                            <TableBody>
                                {#each selectedRoleForPermissions.permissions as permission}
                                    <TableBodyRow>
                                        <TableBodyCell>{permission.name}</TableBodyCell>
                                        <TableBodyCell>{permission.resource}</TableBodyCell>
                                        <TableBodyCell>{permission.action}</TableBodyCell>
                                        <TableBodyCell>
                                            {#if permission.name !== 'manage_all' || selectedRoleForPermissions.role_name !== 'admin'}
                                                <form method="POST" action="?/removePermission" use:removePermissionForm.enhance>
                                                    <input type="hidden" name="roleId" value={selectedRoleForPermissions.role_id} />
                                                    <input type="hidden" name="permissionId" value={permission.id} />
                                                    <Button size="xs" color="red" type="submit">Remove</Button>
                                                </form>
                                            {/if}
                                        </TableBodyCell>
                                    </TableBodyRow>
                                {/each}
                            </TableBody>
                        </Table>
                    </div>
                {:else}
                    <p class="text-gray-500">No permissions assigned</p>
                {/if}
            </div>
        {/if}
    </Modal>
</div>