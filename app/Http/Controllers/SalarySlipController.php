<?php

namespace App\Http\Controllers;

use App\Models\DocumentTemplate;
use App\Models\SalarySlip;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SalarySlipController extends Controller
{
    private function normalizeMeta(array $meta): array
    {
        $payslipFields = $meta['payslip_fields'] ?? [];
        $employeeFields = $meta['employee_fields'] ?? [];

        unset($meta['payslip_fields'], $meta['employee_fields']);

        $payslipLabels = [];
        if (is_array($payslipFields)) {
            foreach ($payslipFields as $item) {
                if (! is_array($item)) {
                    continue;
                }

                $key = trim((string) ($item['key'] ?? ''));
                $label = trim((string) ($item['label'] ?? ''));
                $value = $item['value'] ?? null;

                if ($key === '' || $label === '') {
                    continue;
                }

                $payslipLabels[$key] = $label;
                $meta[$key] = $value;
            }
        }

        $employeeLabels = [];
        if (is_array($employeeFields)) {
            foreach ($employeeFields as $item) {
                if (! is_array($item)) {
                    continue;
                }

                $key = trim((string) ($item['key'] ?? ''));
                $label = trim((string) ($item['label'] ?? ''));
                $value = $item['value'] ?? null;

                if ($key === '' || $label === '') {
                    continue;
                }

                $employeeLabels[$key] = $label;
                $meta[$key] = $value;
            }
        }

        if (! empty($payslipLabels)) {
            $meta['payslip_labels'] = $payslipLabels;
        }
        if (! empty($employeeLabels)) {
            $meta['employee_labels'] = $employeeLabels;
        }

        $payslipExtra = $meta['payslip_extra'] ?? [];
        if (! is_array($payslipExtra)) {
            $payslipExtra = [];
        }
        $payslipExtra = array_values(array_filter($payslipExtra, function ($item) {
            if (! is_array($item)) {
                return false;
            }

            return trim((string) ($item['label'] ?? '')) !== '';
        }));
        $meta['payslip_extra'] = $payslipExtra;

        $employeeExtra = $meta['employee_extra'] ?? [];
        if (! is_array($employeeExtra)) {
            $employeeExtra = [];
        }
        $employeeExtra = array_values(array_filter($employeeExtra, function ($item) {
            if (! is_array($item)) {
                return false;
            }

            return trim((string) ($item['label'] ?? '')) !== '';
        }));
        $meta['employee_extra'] = $employeeExtra;

        $earnings = $meta['earnings'] ?? [];
        if (! is_array($earnings)) {
            $earnings = [];
        }
        $earnings = array_values(array_filter($earnings, function ($item) {
            if (! is_array($item)) {
                return false;
            }

            return trim((string) ($item['label'] ?? '')) !== '';
        }));
        $meta['earnings'] = $earnings;

        $deductions = $meta['deductions'] ?? [];
        if (! is_array($deductions)) {
            $deductions = [];
        }
        $deductions = array_values(array_filter($deductions, function ($item) {
            if (! is_array($item)) {
                return false;
            }

            return trim((string) ($item['label'] ?? '')) !== '';
        }));
        $meta['deductions'] = $deductions;

        return $meta;
    }

    public function index(Request $request)
    {
        $allowedPerPage = [5, 10, 15, 20, 25];
        $perPage = (int) $request->query('per_page', 10);
        if (! in_array($perPage, $allowedPerPage, true)) {
            $perPage = 10;
        }

        $salarySlips = SalarySlip::with('template')
            ->latest()
            ->paginate($perPage)
            ->appends($request->query());

        return Inertia::render('salary-slip/index', [
            'salarySlips' => $salarySlips,
        ]);
    }

    public function create()
    {
        $templates = DocumentTemplate::where('document_type', 'salary_slip')
            ->active()
            ->orderBy('name')
            ->get();

        return Inertia::render('salary-slip/create', [
            'templates' => $templates,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'document_template_id' => 'required|exists:document_templates,id',
            'basic_salary' => 'required|numeric',
            'allowance_amount' => 'required|numeric',
            'deduction_amount' => 'required|numeric',
            'meta' => 'nullable|array',

            'meta.heading' => 'nullable|string|max:255',
            'meta.company_name' => 'nullable|string|max:255',
            'meta.company_address' => 'nullable|string',

            'meta.employer_signature' => 'nullable|string',
            'meta.employee_signature' => 'nullable|string',

            'meta.net_pay_in_words' => 'nullable|string|max:255',

            'meta.payslip_fields' => 'nullable|array',
            'meta.payslip_fields.*.key' => 'nullable|string|max:255',
            'meta.payslip_fields.*.label' => 'nullable|string|max:255',
            'meta.payslip_fields.*.value' => 'nullable|string|max:255',

            'meta.employee_fields' => 'nullable|array',
            'meta.employee_fields.*.key' => 'nullable|string|max:255',
            'meta.employee_fields.*.label' => 'nullable|string|max:255',
            'meta.employee_fields.*.value' => 'nullable|string|max:255',

            'meta.payslip_extra' => 'nullable|array',
            'meta.payslip_extra.*.label' => 'nullable|string|max:255',
            'meta.payslip_extra.*.value' => 'nullable|string|max:255',

            'meta.employee_extra' => 'nullable|array',
            'meta.employee_extra.*.label' => 'nullable|string|max:255',
            'meta.employee_extra.*.value' => 'nullable|string|max:255',

            'meta.earnings' => 'nullable|array',
            'meta.earnings.*.label' => 'nullable|string|max:255',
            'meta.earnings.*.amount' => 'nullable|numeric',

            'meta.deductions' => 'nullable|array',
            'meta.deductions.*.label' => 'nullable|string|max:255',
            'meta.deductions.*.amount' => 'nullable|numeric',
        ]);

        $meta = $request->input('meta', []);
        if (! is_array($meta)) {
            $meta = [];
        }

        $data['meta'] = $this->normalizeMeta($meta);

        $basic = (float) ($data['basic_salary'] ?? 0);
        $allowance = (float) ($data['allowance_amount'] ?? 0);
        $deduction = (float) ($data['deduction_amount'] ?? 0);

        $data['net_salary'] = $basic + $allowance - $deduction;

        SalarySlip::create($data);

        return redirect()->route('salary-slip.index');
    }

    public function preview(Request $request)
    {
        $templateId = $request->input('document_template_id');
        if (! $templateId) {
            return response('Please select a template.', 422);
        }

        $template = DocumentTemplate::where('document_type', 'salary_slip')
            ->whereKey($templateId)
            ->first();

        if (! $template) {
            return response('Template not found.', 404);
        }

        $view = 'app.salary_slip.pdf_templates.' . $template->code;
        if (! view()->exists($view)) {
            return response('Template view not found: ' . e($view), 404);
        }

        $basic = (float) ($request->input('basic_salary') ?: 0);
        $allowance = (float) ($request->input('allowance_amount') ?: 0);
        $deduction = (float) ($request->input('deduction_amount') ?: 0);

        $meta = $request->input('meta', []);
        if (! is_array($meta)) {
            $meta = [];
        }

        $meta = $this->normalizeMeta($meta);

        $salarySlip = new SalarySlip([
            'basic_salary' => $basic,
            'allowance_amount' => $allowance,
            'deduction_amount' => $deduction,
            'net_salary' => $basic + $allowance - $deduction,
            'meta' => $meta,
        ]);

        return response()->view($view, [
            'salarySlip' => $salarySlip,
            'template' => $template,
            'is_preview' => true,
        ]);
    }

    public function edit(SalarySlip $salarySlip)
    {
        $templates = DocumentTemplate::where('document_type', 'salary_slip')
            ->active()
            ->orderBy('name')
            ->get();

        return Inertia::render('salary-slip/edit', [
            'salarySlip' => $salarySlip->loadMissing('template'),
            'templates' => $templates,
        ]);
    }

    public function update(Request $request, SalarySlip $salarySlip)
    {
        $data = $request->validate([
            'document_template_id' => 'required|exists:document_templates,id',
            'basic_salary' => 'required|numeric',
            'allowance_amount' => 'required|numeric',
            'deduction_amount' => 'required|numeric',
            'meta' => 'nullable|array',

            'meta.heading' => 'nullable|string|max:255',
            'meta.company_name' => 'nullable|string|max:255',
            'meta.company_address' => 'nullable|string',

            'meta.employer_signature' => 'nullable|string',
            'meta.employee_signature' => 'nullable|string',

            'meta.net_pay_in_words' => 'nullable|string|max:255',

            'meta.payslip_fields' => 'nullable|array',
            'meta.payslip_fields.*.key' => 'nullable|string|max:255',
            'meta.payslip_fields.*.label' => 'nullable|string|max:255',
            'meta.payslip_fields.*.value' => 'nullable|string|max:255',

            'meta.employee_fields' => 'nullable|array',
            'meta.employee_fields.*.key' => 'nullable|string|max:255',
            'meta.employee_fields.*.label' => 'nullable|string|max:255',
            'meta.employee_fields.*.value' => 'nullable|string|max:255',

            'meta.payslip_extra' => 'nullable|array',
            'meta.payslip_extra.*.label' => 'nullable|string|max:255',
            'meta.payslip_extra.*.value' => 'nullable|string|max:255',

            'meta.employee_extra' => 'nullable|array',
            'meta.employee_extra.*.label' => 'nullable|string|max:255',
            'meta.employee_extra.*.value' => 'nullable|string|max:255',

            'meta.earnings' => 'nullable|array',
            'meta.earnings.*.label' => 'nullable|string|max:255',
            'meta.earnings.*.amount' => 'nullable|numeric',

            'meta.deductions' => 'nullable|array',
            'meta.deductions.*.label' => 'nullable|string|max:255',
            'meta.deductions.*.amount' => 'nullable|numeric',
        ]);

        if ($request->exists('meta')) {
            $meta = $request->input('meta', []);
            if (! is_array($meta)) {
                $meta = [];
            }

            $data['meta'] = $this->normalizeMeta($meta);
        }

        $basic = (float) ($data['basic_salary'] ?? 0);
        $allowance = (float) ($data['allowance_amount'] ?? 0);
        $deduction = (float) ($data['deduction_amount'] ?? 0);

        $data['net_salary'] = $basic + $allowance - $deduction;

        $salarySlip->update($data);

        return redirect()->route('salary-slip.index');
    }

    public function destroy(SalarySlip $salarySlip)
    {
        $salarySlip->delete();

        return redirect()->route('salary-slip.index');
    }

    public function showPdf(SalarySlip $salarySlip)
    {
        if (! class_exists(\Barryvdh\DomPDF\Facade\Pdf::class)) {
            abort(500, 'PDF library is not installed. Run composer require barryvdh/laravel-dompdf');
        }

        $salarySlip->loadMissing('template');

        if (! $salarySlip->template || ! $salarySlip->template->code) {
            abort(500, 'Salary slip template is not configured.');
        }

        $view = 'app.salary_slip.pdf_templates.' . $salarySlip->template->code;

        if (! view()->exists($view)) {
            abort(500, 'Salary slip template view not found: ' . $view);
        }

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView($view, [
            'salarySlip' => $salarySlip,
            'template' => $salarySlip->template,
        ]);

        return $pdf->stream('salary-slip-' . $salarySlip->id . '.pdf');
    }

    public function downloadPdf(SalarySlip $salarySlip)
    {
        if (! class_exists(\Barryvdh\DomPDF\Facade\Pdf::class)) {
            abort(500, 'PDF library is not installed. Run composer require barryvdh/laravel-dompdf');
        }

        $salarySlip->loadMissing('template');

        if (! $salarySlip->template || ! $salarySlip->template->code) {
            abort(500, 'Salary slip template is not configured.');
        }

        $view = 'app.salary_slip.pdf_templates.' . $salarySlip->template->code;

        if (! view()->exists($view)) {
            abort(500, 'Salary slip template view not found: ' . $view);
        }

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView($view, [
            'salarySlip' => $salarySlip,
            'template' => $salarySlip->template,
        ]);

        return $pdf->download('salary-slip-' . $salarySlip->id . '.pdf');
    }
}
