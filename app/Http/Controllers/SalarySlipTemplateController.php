<?php

namespace App\Http\Controllers;

use App\Models\DocumentTemplate;
use App\Models\SalarySlip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SalarySlipTemplateController extends Controller
{
    private function requireTemplateOwner(DocumentTemplate $template): void
    {
        $userId = Auth::id();

        if (! $userId || (int) $template->user_id !== (int) $userId) {
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

        $templates = DocumentTemplate::where('document_type', 'salary_slip')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate($perPage)
            ->appends($request->query());

        return Inertia::render('salary-slip-templates/index', [
            'templates' => $templates,
            'designOptions' => [
                'classic' => 'Classic',
                'modern' => 'Modern',
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('salary-slip-templates/create', [
            'designOptions' => [
                'classic' => 'Classic',
                'modern' => 'Modern',
            ],
        ]);
    }

    public function store(Request $request)
    {
        $userId = $request->user()->id;

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'code' => [
                'required',
                'string',
                'max:255',
                'in:classic,modern',
                Rule::unique('document_templates', 'code')
                    ->where(function ($query) use ($userId) {
                        $query->where('user_id', $userId)->where('document_type', 'salary_slip');
                    }),
            ],
            'description' => 'nullable|string',
            'primary_color' => 'nullable|string|max:20',
            'secondary_color' => 'nullable|string|max:20',
            'accent_color' => 'nullable|string|max:20',
            'font_family' => 'nullable|string|max:100',
            'font_size' => 'nullable|integer|min:6|max:24',
            'line_height' => 'required|integer|min:10|max:40',
            'is_active' => 'sometimes|boolean',
        ]);

        $data['is_active'] = $request->boolean('is_active', true);
        $data['user_id'] = $userId;
        $data['document_type'] = 'salary_slip';

        DocumentTemplate::create($data);

        return redirect()->route('template.salary-slip.index');
    }

    public function edit(DocumentTemplate $template)
    {
        $this->requireTemplateOwner($template);

        return Inertia::render('salary-slip-templates/edit', [
            'template' => $template,
            'designOptions' => [
                'classic' => 'Classic',
                'modern' => 'Modern',
            ],
        ]);
    }

    public function update(Request $request, DocumentTemplate $template)
    {
        $this->requireTemplateOwner($template);
        $userId = $request->user()->id;

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'code' => [
                'required',
                'string',
                'max:255',
                'in:classic,modern',
                Rule::unique('document_templates', 'code')
                    ->ignore($template->id)
                    ->where(function ($query) use ($userId) {
                        $query->where('user_id', $userId)->where('document_type', 'salary_slip');
                    }),
            ],
            'description' => 'nullable|string',
            'primary_color' => 'nullable|string|max:20',
            'secondary_color' => 'nullable|string|max:20',
            'accent_color' => 'nullable|string|max:20',
            'font_family' => 'nullable|string|max:100',
            'font_size' => 'nullable|integer|min:6|max:24',
            'line_height' => 'nullable|integer|min:10|max:40',
            'is_active' => 'sometimes|boolean',
        ]);

        $data['is_active'] = $request->boolean('is_active', true);

        $template->update($data);

        return redirect()->route('template.salary-slip.index');
    }

    public function preview(Request $request)
    {
        $data = $request->validate([
            'code' => 'required|string|in:classic,modern',
            'primary_color' => 'nullable|string|max:20',
            'secondary_color' => 'nullable|string|max:20',
            'accent_color' => 'nullable|string|max:20',
            'font_family' => 'nullable|string|max:100',
            'font_size' => 'nullable|integer|min:6|max:24',
            'line_height' => 'nullable|integer|min:10|max:40',
        ]);

        $view = 'app.salary_slip.pdf_templates.' . $data['code'];

        if (! view()->exists($view)) {
            return response('Template view not found: ' . e($view), 404);
        }

        $template = new DocumentTemplate([
            'code' => $data['code'],
            'document_type' => 'salary_slip',
            'name' => 'Preview',
            'primary_color' => $data['primary_color'] ?? null,
            'secondary_color' => $data['secondary_color'] ?? null,
            'accent_color' => $data['accent_color'] ?? null,
            'font_family' => $data['font_family'] ?? null,
            'font_size' => $data['font_size'] ?? null,
            'line_height' => $data['line_height'] ?? null,
        ]);

        $previewMeta = [
            'heading' => 'Payslip',
            'company_name' => 'Zoonoodle Inc',
            'company_address' => "21023 Pearson Point Road\nGateway Avenue",

            'payslip_labels' => [
                'pay_period' => 'Pay Period',
                'worked_days' => 'Worked Days',
            ],
            'employee_labels' => [
                'employee_name' => 'Employee Name',
                'employee_code' => 'Employee ID',
                'designation' => 'Designation',
            ],

            'pay_period' => 'August 2021',
            'worked_days' => 26,
            'employee_name' => 'Sally Harley',
            'employee_code' => 'EMP-001',
            'designation' => 'Marketing',

            'payslip_extra' => [
                ['label' => 'Location', 'value' => 'Head Office'],
            ],
            'employee_extra' => [],

            'earnings' => [
                ['label' => 'Basic', 'amount' => 10000],
                ['label' => 'Incentive Pay', 'amount' => 1000],
                ['label' => 'House Rent Allowance', 'amount' => 400],
                ['label' => 'Meal Allowance', 'amount' => 200],
            ],
            'deductions' => [
                ['label' => 'Provident Fund', 'amount' => 1200],
                ['label' => 'Professional Tax', 'amount' => 500],
                ['label' => 'Loan', 'amount' => 400],
            ],

            'net_pay_in_words' => 'Nine Thousand Five Hundred',
        ];

        $salarySlip = new SalarySlip([
            'basic_salary' => 10000,
            'allowance_amount' => 1600,
            'deduction_amount' => 2100,
            'net_salary' => 9500,
            'meta' => $previewMeta,
        ]);

        return response()->view($view, [
            'salarySlip' => $salarySlip,
            'template' => $template,
            'is_preview' => true,
        ]);
    }

    public function destroy(DocumentTemplate $template)
    {
        $this->requireTemplateOwner($template);

        $template->delete();

        return redirect()->route('template.salary-slip.index');
    }
}
