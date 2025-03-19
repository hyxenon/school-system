<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    public function handle(Request $request, Closure $next, string $role)
    {
        $user = auth()->user();

        if ($role === 'professor' && !$user->employee) {
            return redirect()->route('dashboard')->with('error', 'Unauthorized access');
        }

        if ($role === 'student' && !$user->student) {
            return redirect()->route('dashboard')->with('error', 'Unauthorized access');
        }

        return $next($request);
    }
}
