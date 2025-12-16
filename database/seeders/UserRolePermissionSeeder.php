<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserRolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $userRole = Role::firstOrCreate(
            ['slug' => 'user'],
            ['name' => 'User']
        );

        $permissions = [
            'view-dashboard' => 'View Dashboard',
            'edit-profile' => 'Edit Profile',
            'view-salary-slip' => 'View Salary Slip',
        ];

        $permissionIds = [];
        foreach ($permissions as $slug => $name) {
            $permission = Permission::firstOrCreate(
                ['slug' => $slug],
                ['name' => $name]
            );

            $permissionIds[] = $permission->id;
        }

        $userRole->permissions()->syncWithoutDetaching($permissionIds);

        $user = User::firstOrCreate(
            ['email' => 'user@example.com'],
            [
                'name' => 'Ankit User',
                'password' => 'password',
            ]
        );

        $user->assignRolePermission('user');
    }
}
