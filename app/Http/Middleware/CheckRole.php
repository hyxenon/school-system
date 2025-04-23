<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    public function handle(Request $request, Closure $next, string $role)
    {
        $user = auth()->user();


        if ($role === 'studentAndProfessor') {

            if ($user->employee) {
                if ($user->employee->position !== 'professor') {
                    return redirect()->route('dashboard')->with('error', 'Unauthorized access');
                }
            }
        }

        // Check for employee roles
        if (in_array($role, ['professor', 'registrar', 'treasurer', 'program head', 'hr', 'student'])) {
            // First check if user is an employee
            if (!$user->employee) {
                return redirect()->route('dashboard')->with('error', 'Unauthorized access');
            }

            // Then check if employee has the correct position
            if ($user->employee->position !== $role) {
                return redirect()->route('dashboard')->with('error', 'Unauthorized access');
            }
        }


        return $next($request);
    }
}
