<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = [
            [
                'department_code' => 'CBA',
                'name' => 'College of Business Administration',
                'courses' => [
                    ['course_code' => 'BSBA', 'name' => 'Bachelor of Science in Business Administration'],
                    ['course_code' => 'BSA', 'name' => 'Bachelor of Science in Accountancy'],
                    ['course_code' => 'BSM', 'name' => 'Bachelor of Science in Marketing'],
                ],
            ],
            [
                'department_code' => 'CAS',
                'name' => 'College of Arts and Sciences',
                'courses' => [
                    ['course_code' => 'ABComm', 'name' => 'Bachelor of Arts in Communication'],
                    ['course_code' => 'BSPsy', 'name' => 'Bachelor of Science in Psychology'],
                    ['course_code' => 'BSEng', 'name' => 'Bachelor of Science in English'],
                ],
            ],
            [
                'department_code' => 'CHS',
                'name' => 'College of Health Sciences',
                'courses' => [
                    ['course_code' => 'BSN', 'name' => 'Bachelor of Science in Nursing'],
                    ['course_code' => 'BSPT', 'name' => 'Bachelor of Science in Physical Therapy'],
                    ['course_code' => 'BSMT', 'name' => 'Bachelor of Science in Medical Technology'],
                ],
            ],
            [
                'department_code' => 'COE',
                'name' => 'College of Education',
                'courses' => [
                    ['course_code' => 'BSEd', 'name' => 'Bachelor of Secondary Education'],
                    ['course_code' => 'BEEd', 'name' => 'Bachelor of Elementary Education'],
                    ['course_code' => 'BTVTEd', 'name' => 'Bachelor of Technical-Vocational Teacher Education'],
                ],
            ],
        ];

        foreach ($departments as $dept) {
            $department = Department::create([
                'department_code' => $dept['department_code'],
                'name' => $dept['name'],
            ]);

            foreach ($dept['courses'] as $course) {
                Course::create([
                    'course_code' => $course['course_code'],
                    'name' => $course['name'],
                    'department_id' => $department->id,
                ]);
            }
        }

        // 30 teachers
        $teacherNames = [
            'John Doe',
            'Jane Smith',
            'Michael Johnson',
            'Emily Davis',
            'William Brown',
            'Jessica Wilson',
            'Daniel Martinez',
            'Sarah Anderson',
            'Matthew Thomas',
            'Laura Taylor',
            'David Moore',
            'Sophia White',
            'James Harris',
            'Olivia Martin',
            'Benjamin Thompson',
            'Emma Garcia',
            'Christopher Rodriguez',
            'Ava Clark',
            'Joshua Lewis',
            'Mia Walker',
            'Andrew Hall',
            'Isabella Allen',
            'Ethan Young',
            'Charlotte King',
            'Alexander Wright',
            'Amelia Scott',
            'Henry Green',
            'Lucas Adams',
            'Grace Baker',
            'Mason Nelson'
        ];

        $departmentIds = Department::whereIn('department_code', ['CBA', 'CAS', 'CHS', 'COE'])->pluck('id')->toArray();

        foreach ($teacherNames as $index => $teacherName) {
            $teacherUser = User::create([
                'name' => $teacherName,
                'email' => 'teacher' . ($index + 2) . '@gmail.com',
                'password' => Hash::make('testing123'),
            ]);

            Employee::create([
                'user_id' => $teacherUser->id,
                'department_id' => $departmentIds[$index % count($departmentIds)],
                'position' => 'professor',
                'salary' => 45000.00,
                'isActive' => true
            ]);
        }



        // Create Subjects


        $subjects = [
            ['code' => 'BIO101', 'name' => 'Biology 101', 'credits' => 3, 'description' => 'Introduction to Biology', 'course_id' => null],
            ['code' => 'CHM101', 'name' => 'Chemistry 101', 'credits' => 3, 'description' => 'Basic Chemistry concepts', 'course_id' => null],
            ['code' => 'PHY101', 'name' => 'Physics 101', 'credits' => 3, 'description' => 'Fundamentals of Physics', 'course_id' => null],
            ['code' => 'MTH101', 'name' => 'Mathematics 101', 'credits' => 3, 'description' => 'Basic Mathematics', 'course_id' => null],
            ['code' => 'ITPE1', 'name' => 'IT Elective 1', 'credits' => 3, 'description' => 'IT Elective 1', 'course_id' => 1],
            ['code' => 'ITPE2', 'name' => 'IT Elective 2', 'credits' => 3, 'description' => 'IT Elective 2', 'course_id' => 1],
            ['code' => 'CS101', 'name' => 'Introduction to Computer Science', 'credits' => 3, 'description' => 'Basic concepts in computing and programming', 'course_id' => 1],
            ['code' => 'PROG1', 'name' => 'Programming 1', 'credits' => 3, 'description' => 'Fundamentals of programming', 'course_id' => 1],
            ['code' => 'PROG2', 'name' => 'Programming 2', 'credits' => 3, 'description' => 'Advanced programming concepts', 'course_id' => 1],
            ['code' => 'DBMS', 'name' => 'Database Management Systems', 'credits' => 3, 'description' => 'Relational databases and SQL', 'course_id' => 1],
            ['code' => 'NET101', 'name' => 'Computer Networking', 'credits' => 3, 'description' => 'Fundamentals of computer networks', 'course_id' => 1],
            ['code' => 'OS101', 'name' => 'Operating Systems', 'credits' => 3, 'description' => 'Principles of operating systems', 'course_id' => 1],
            ['code' => 'WEBDEV', 'name' => 'Web Development', 'credits' => 3, 'description' => 'Frontend and backend web development', 'course_id' => 1],
            ['code' => 'MOBDEV', 'name' => 'Mobile App Development', 'credits' => 3, 'description' => 'Development of mobile applications', 'course_id' => 1],
            ['code' => 'CAPSTONE', 'name' => 'Capstone Project', 'credits' => 3, 'description' => 'Final project integrating IT knowledge', 'course_id' => 1],
        ];

        foreach ($subjects as $subject) {
            Subject::create([
                'code' => $subject['code'],
                'name' => $subject['name'],
                'credits' => $subject['credits'],
                'description' => $subject['description'],
                'course_id' => $subject['course_id']
            ]);
        }
    }
}
