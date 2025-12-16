<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminRolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::firstOrCreate(
            ['slug' => 'admin'],
            ['name' => 'Admin']
        );

        $permissions = [
            'manage-users' => 'Manage Users',
            'view-admin-dashboard' => 'View Admin Dashboard',
            'edit-profile' => 'Edit Profile',
            'view-salary-slip' => 'View Salary Slip',
        ];

        $adminPermissions = [
            'manage-users',
            'view-admin-dashboard',
            'edit-profile',
            'view-salary-slip',
        ];

        $permissionIds = [];
        foreach ($permissions as $slug => $name) {
            $permission = Permission::firstOrCreate(
                ['slug' => $slug],
                ['name' => $name]
            );

            $permissionIds[$slug] = $permission->id;
        }

        $adminPermissionIds = [];
        foreach ($adminPermissions as $slug) {
            $adminPermissionIds[] = $permissionIds[$slug];
        }

        $adminRole->permissions()->syncWithoutDetaching($adminPermissionIds);

        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin',
                'password' => 'password',
            ]
        );

        $admin->roles()->syncWithoutDetaching([$adminRole->id]);
    }
}
