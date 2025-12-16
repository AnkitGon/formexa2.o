<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user()->loadMissing('roles');

        if ($user->roles->contains('slug', 'admin')) {
            return Inertia::render('dashboard/admin');
        }

        if ($user->roles->contains('slug', 'user')) {
            return Inertia::render('dashboard/user');
        }

        abort(403);
    }
}
