<?php

namespace App\Http\Controllers;

use App\Models\Tax;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TaxController extends Controller
{
    private function requireTaxOwner(Tax $tax): void
    {
        $userId = Auth::id();

        if (! $userId || (int) $tax->user_id !== (int) $userId) {
            abort(404);
        }
    }

    public function index(Request $request)
    {
        $allowedPerPage = [5, 10, 15, 20, 25];
        $perPage = (int) $request->query('per_page', 10);
        if (! in_array($perPage, $allowedPerPage, true)) {
            $perPage = 10;
        }

        $taxes = Tax::where('user_id', $request->user()->id)
            ->latest()
            ->paginate($perPage)
            ->appends($request->query());

        return Inertia::render('taxes/index', [
            'taxes' => $taxes,
            'typeOptions' => [
                'fixed' => 'Fixed',
                'percentage' => 'Percentage',
            ],
        ]);
    }

    public function store(Request $request)
    {
        $userId = $request->user()->id;

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:fixed,percentage',
            'value' => 'required|numeric|min:0',
            'is_active' => 'sometimes|boolean',
        ]);

        $data['is_active'] = $request->boolean('is_active', true);
        $data['user_id'] = $userId;

        Tax::create($data);

        return redirect()->route('taxes.index');
    }

    public function update(Request $request, Tax $tax)
    {
        $this->requireTaxOwner($tax);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:fixed,percentage',
            'value' => 'required|numeric|min:0',
            'is_active' => 'sometimes|boolean',
        ]);

        $data['is_active'] = $request->boolean('is_active', true);

        $tax->update($data);

        return redirect()->route('taxes.index');
    }

    public function destroy(Tax $tax)
    {
        $this->requireTaxOwner($tax);

        $tax->delete();

        return redirect()->route('taxes.index');
    }
}
