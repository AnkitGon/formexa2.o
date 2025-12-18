<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Arr;

class UserSetting extends Model
{
    protected $fillable = [
        'user_id',
        'key',
        'value',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function getMapForUser(int $userId): array
    {
        return static::query()
            ->where('user_id', $userId)
            ->pluck('value', 'key')
            ->all();
    }

    public static function getKeysForUser(int $userId, array $keys): array
    {
        if (count($keys) === 0) {
            return [];
        }

        return static::query()
            ->where('user_id', $userId)
            ->whereIn('key', $keys)
            ->pluck('value', 'key')
            ->all();
    }

    public static function upsertForUser(int $userId, array $settings): void
    {
        $now = now();

        $rows = [];
        foreach ($settings as $key => $value) {
            $rows[] = [
                'user_id' => $userId,
                'key' => (string) $key,
                'value' => $value === null ? null : (string) $value,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        $rows = Arr::where($rows, fn ($row) => $row['key'] !== '');
        if (count($rows) === 0) {
            return;
        }

        static::query()->upsert(
            $rows,
            ['user_id', 'key'],
            ['value', 'updated_at'],
        );
    }
}
