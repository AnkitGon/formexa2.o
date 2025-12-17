<?php

namespace App\Http\Controllers;

use App\Models\Tax;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaxController extends Controller
{
    public function index(Request $request)
    {
        $allowedPerPage = [5, 10, 15, 20, 25];
        $perPage = (int) $request->query('per_page', 10);
        if (! in_array($perPage, $allowedPerPage, true)) {
            $perPage = 10;
        }

        $taxes = Tax::orderBy('name')
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
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:fixed,percentage',
            'value' => 'required|numeric|min:0',
            'is_active' => 'sometimes|boolean',
        ]);

        $data['is_active'] = $request->boolean('is_active', true);

        Tax::create($data);

        return redirect()->route('taxes.index');
    }

    public function update(Request $request, Tax $tax)
    {
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
        $tax->delete();

        return redirect()->route('taxes.index');
    }
}
