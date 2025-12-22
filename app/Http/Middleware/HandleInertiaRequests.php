<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Models\UserSetting;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $user = $request->user();
        if ($user) {
            $user->loadMissing('roles');
        }

        $ttlSeconds = 300;

        $brandingKeys = ['logo_dark', 'logo_light', 'favicon', 'favicon_v'];

        $userBranding = $user
            ? Cache::remember(
                "user_settings:{$user->id}:branding",
                $ttlSeconds,
                fn () => UserSetting::getKeysForUser($user->id, $brandingKeys),
            )
            : [];

        $adminId = null;
        if ($user && $user->roles && $user->roles->contains('slug', 'admin')) {
            $adminId = $user->id;
        } else {
            $adminId = Cache::remember(
                'user_settings:admin_id',
                $ttlSeconds,
                fn () => User::query()
                    ->whereHas('roles', function ($query) {
                        $query->where('slug', 'admin');
                    })
                    ->orderBy('id')
                    ->value('id'),
            );
        }

        $adminBranding = $adminId
            ? Cache::remember(
                'user_settings:' . ((int) $adminId) . ':branding',
                $ttlSeconds,
                fn () => UserSetting::getKeysForUser((int) $adminId, $brandingKeys),
            )
            : [];

        $salarySlipMetaKeys = [
            'company_name',
            'company_address',
            'date_format',
            'time_format',
            'default_currency',
            'currency_symbol_position',
        ];

        $userSalarySlipDefaults = $user
            ? Cache::remember(
                "user_settings:{$user->id}:salary_slip_defaults",
                $ttlSeconds,
                fn () => UserSetting::getKeysForUser($user->id, $salarySlipMetaKeys),
            )
            : [];

        $adminSalarySlipDefaults = $adminId
            ? Cache::remember(
                'user_settings:' . ((int) $adminId) . ':salary_slip_defaults',
                $ttlSeconds,
                fn () => UserSetting::getKeysForUser((int) $adminId, $salarySlipMetaKeys),
            )
            : [];

        $resolveBrandingUrl = function (string $key) use ($userBranding, $adminBranding): ?string {
            $path = $userBranding[$key] ?? $adminBranding[$key] ?? null;
            return $path ? asset('storage/'.$path) : null;
        };

        $resolveBrandingVersion = function () use ($userBranding, $adminBranding): ?string {
            $v = $userBranding['favicon_v'] ?? $adminBranding['favicon_v'] ?? null;
            if (is_string($v) && $v !== '') {
                return $v;
            }
            if (is_numeric($v)) {
                return (string) $v;
            }

            $path = $userBranding['favicon'] ?? $adminBranding['favicon'] ?? null;
            if (!$path) {
                return null;
            }

            try {
                return Storage::disk('public')->exists($path)
                    ? (string) Storage::disk('public')->lastModified($path)
                    : null;
            } catch (\Throwable $e) {
                return null;
            }
        };

        $resolveSettingValue = function (string $key) use ($userSalarySlipDefaults, $adminSalarySlipDefaults): ?string {
            return $userSalarySlipDefaults[$key] ?? $adminSalarySlipDefaults[$key] ?? null;
        };

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'csrf_token' => csrf_token(),
            'auth' => [
                'user' => $user,
            ],
            'branding' => [
                'logo_dark_url' => $resolveBrandingUrl('logo_dark'),
                'logo_light_url' => $resolveBrandingUrl('logo_light'),
                'favicon_url' => $resolveBrandingUrl('favicon'),
                'favicon_v' => $resolveBrandingVersion(),
            ],
            'settingsDefaults' => [
                'company_name' => $resolveSettingValue('company_name'),
                'company_address' => $resolveSettingValue('company_address'),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
