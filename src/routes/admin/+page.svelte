<script lang="ts">
    import { superForm } from 'sveltekit-superforms/client';
    import type { PageProps } from './$types';
    import { Button, Card, Input, Label, Modal, Select, Table, TableBody, TableBodyCell, TableBodyRow, TableHead, TableHeadCell } from 'flowbite-svelte';
    import { PlusIcon, TrashIcon, PencilIcon } from 'lucide-svelte';
    import { m } from "$lib/paraglide/messages";

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
    <h1 class="text-3xl font-bold mb-6">{m.admin_dashboard()}</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Users Section -->
        <Card>
            <h2 class="text-2xl font-bold mb-4">{m.admin_users()}</h2>
            <Table>
                <TableHead>
                    <TableHeadCell>{m.admin_name()}</TableHeadCell>
                    <TableHeadCell>{m.admin_email()}</TableHeadCell>
                    <TableHeadCell>{m.admin_roles_column()}</TableHeadCell>
                    <TableHeadCell>{m.admin_actions()}</TableHeadCell>
                </TableHead>
                <TableBody>
                    {#each data.users as user}
                        <TableBodyRow>
                            <TableBodyCell>{user.user_name || m.admin_na()}</TableBodyCell>
                            <TableBodyCell>{user.email}</TableBodyCell>
                            <TableBodyCell>{user.roles?.join(', ') || m.admin_none()}</TableBodyCell>
                            <TableBodyCell>
                                <Button size="xs" color="blue" onclick={() => openUserRoleModal(user)}>
                                    {m.admin_manage_roles()}
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
                <h2 class="text-2xl font-bold">{m.admin_roles()}</h2>
                <Button size="sm" color="blue" onclick={openCreateRoleModal}>
                    <PlusIcon class="mr-2 h-4 w-4" />
                    {m.admin_new_role()}
                </Button>
            </div>
            <Table>
                <TableHead>
                    <TableHeadCell>{m.admin_name()}</TableHeadCell>
                    <TableHeadCell>{m.admin_description()}</TableHeadCell>
                    <TableHeadCell>{m.admin_permissions()}</TableHeadCell>
                    <TableHeadCell>{m.admin_actions()}</TableHeadCell>
                </TableHead>
                <TableBody>
                    {#each data.roles as role}
                        <TableBodyRow>
                            <TableBodyCell>{role.role_name}</TableBodyCell>
                            <TableBodyCell>{role.role_description || m.admin_na()}</TableBodyCell>
                            <TableBodyCell>
                                {#if role.permissions}
                                    <span class="text-xs">{m.admin_permissions_count({ count: role.permissions.length })}</span>
                                {:else}
                                    <span class="text-xs">{m.admin_no_permissions()}</span>
                                {/if}
                            </TableBodyCell>
                            <TableBodyCell>
                                <div class="flex space-x-2">
                                    <Button size="xs" color="blue" onclick={() => openPermissionModal(role)}>
                                        {m.admin_permissions()}
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
    <Modal bind:open={userRoleModalOpen} title={m.admin_manage_user_roles()}>
        {#if selectedUser}
            <div class="space-y-4">
                <p>{m.admin_assign_role_to()} <strong>{selectedUser.user_name || selectedUser.email}</strong></p>

                <form method="POST" action="?/assignRole" use:assignRoleForm.enhance class="space-y-4">
                    <div>
                        <Label for="roleName">{m.admin_role()}</Label>
                        <Select id="roleName" bind:value={selectedRole}>
                            <option value="" disabled selected>{m.admin_select_role()}</option>
                            {#each data.roles as role}
                                <option value={role.role_name}>{role.role_name}</option>
                            {/each}
                        </Select>
                    </div>
                    <Button type="submit" color="blue">{m.admin_assign_role()}</Button>
                </form>

                <hr class="my-4" />

                <h3 class="font-bold">{m.admin_current_roles()}</h3>
                {#if selectedUser.roles && selectedUser.roles.length > 0}
                    <ul class="space-y-2">
                        {#each selectedUser.roles as roleName}
                            <li class="flex justify-between items-center">
                                <span>{roleName}</span>
                                {#if roleName !== 'player' || selectedUser.roles.length > 1}
                                    <form method="POST" action="?/removeRole" use:removeRoleForm.enhance>
                                        <input type="hidden" name="userId" value={selectedUser.user_id} />
                                        <input type="hidden" name="roleName" value={roleName} />
                                        <Button size="xs" color="red" type="submit">{m.admin_remove()}</Button>
                                    </form>
                                {/if}
                            </li>
                        {/each}
                    </ul>
                {:else}
                    <p class="text-gray-500">{m.admin_no_roles_assigned()}</p>
                {/if}
            </div>
        {/if}
    </Modal>

    <!-- Role Modal -->
    <Modal bind:open={roleModalOpen} title={editingRole ? m.admin_edit_role() : m.admin_create_role()}>
        <form method="POST" action={editingRole ? '?/updateRole' : '?/createRole'} use:roleForm.enhance class="space-y-4">
            {#if editingRole}
                <input type="hidden" name="roleId" value={editingRole.role_id} />
            {/if}
            <div>
                <Label for="name">{m.admin_role_name()}</Label>
                <Input id="name" name="name" bind:value={roleName} required />
            </div>
            <div>
                <Label for="description">{m.admin_description()}</Label>
                <Input id="description" name="description" bind:value={roleDescription} />
            </div>
            <Button type="submit" color="blue">{editingRole ? m.admin_update() : m.admin_create()}</Button>
        </form>
    </Modal>

    <!-- Permission Modal -->
    <Modal bind:open={permissionModalOpen} title={m.admin_manage_permissions()} size="lg">
        {#if selectedRoleForPermissions}
            <div class="space-y-4">
                <p>{m.admin_manage_permissions_for_role()} <strong>{selectedRoleForPermissions.role_name}</strong></p>

                <form method="POST" action="?/assignPermission" use:assignPermissionForm.enhance class="space-y-4">
                    <div>
                        <Label for="permissionId">{m.admin_add_permission()}</Label>
                        <Select id="permissionId" bind:value={selectedPermission}>
                            <option value="" disabled selected>{m.admin_select_permission()}</option>
                            {#each data.permissions as permission}
                                {#if !hasPermission(selectedRoleForPermissions, permission.id)}
                                    <option value={permission.id}>
                                        {permission.name} ({permission.resource}/{permission.action})
                                    </option>
                                {/if}
                            {/each}
                        </Select>
                    </div>
                    <Button type="submit" color="blue">{m.admin_add_permission()}</Button>
                </form>

                <hr class="my-4" />

                <h3 class="font-bold">{m.admin_current_permissions()}</h3>
                {#if selectedRoleForPermissions.permissions && selectedRoleForPermissions.permissions.length > 0}
                    <div class="max-h-96 overflow-y-auto">
                        <Table>
                            <TableHead>
                                <TableHeadCell>{m.admin_name()}</TableHeadCell>
                                <TableHeadCell>{m.admin_resource()}</TableHeadCell>
                                <TableHeadCell>{m.admin_action()}</TableHeadCell>
                                <TableHeadCell>{m.admin_actions()}</TableHeadCell>
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
                                                    <Button size="xs" color="red" type="submit">{m.admin_remove()}</Button>
                                                </form>
                                            {/if}
                                        </TableBodyCell>
                                    </TableBodyRow>
                                {/each}
                            </TableBody>
                        </Table>
                    </div>
                {:else}
                    <p class="text-gray-500">{m.admin_no_permissions_assigned()}</p>
                {/if}
            </div>
        {/if}
    </Modal>
</div>
