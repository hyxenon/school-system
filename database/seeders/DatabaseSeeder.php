<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Employee;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();
        User::factory()->create([
            'name' => "Justine Santos",
            'email' => 'registrar1@gmail.com',
            'type' => 'employee',

        ]);

        User::factory()->create([
            'name' => "justine santos",
            'email' => 'professor1@gmail.com',
            'type' => 'employee',

        ]);


        Department::factory()->create([
            'name' => "College of Engineering and Technology",
            'department_code' => "CECT",
        ]);


        Employee::factory()->create([
            'user_id' => 1,
            'salary' => 0,
            'position' => 'registrar',
            'isActive' => true
        ]);

        Employee::factory()->create([
            'user_id' => 2,
            'salary' => 0,
            'position' => 'professor',
            'isActive' => true
        ]);


        $this->call(DepartmentSeeder::class);
    }
}
