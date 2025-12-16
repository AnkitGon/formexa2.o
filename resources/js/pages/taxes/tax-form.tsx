import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form } from '@inertiajs/react';

type Props = {
    mode: 'create' | 'edit';
    action: string;
    typeOptions: Record<string, string>;
    tax?: {
        id?: number;
        name?: string;
        type?: string;
        value?: number | string;
        is_active?: boolean;
    };
};

export default function TaxForm({ mode, action, typeOptions, tax }: Props) {
    return (
        <Form id="taxForm" method="post" action={action} className="space-y-6">
            {({ processing, errors }) => (
                <>
                    {mode === 'edit' && (
                        <input type="hidden" name="_method" value="PUT" />
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                required
                                defaultValue={tax?.name ?? ''}
                            />
                            <InputError message={(errors as any).name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="type">Type</Label>
                            <select
                                id="type"
                                name="type"
                                required
                                defaultValue={
                                    mode === 'create'
                                        ? 'fixed'
                                        : tax?.type ?? 'fixed'
                                }
                                className="h-9 w-full rounded-md border border-sidebar-border/70 bg-background px-3 text-sm"
                            >
                                {Object.entries(typeOptions ?? {}).map(
                                    ([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ),
                                )}
                            </select>
                            <InputError message={(errors as any).type} />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="value">Value</Label>
                            <Input
                                id="value"
                                name="value"
                                type="number"
                                step="0.01"
                                min={0}
                                required
                                defaultValue={tax?.value ?? ''}
                            />
                            <InputError message={(errors as any).value} />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            id="is_active"
                            name="is_active"
                            type="checkbox"
                            value="1"
                            defaultChecked={
                                mode === 'create' ? true : Boolean(tax?.is_active)
                            }
                            className="h-4 w-4"
                        />
                        <Label htmlFor="is_active">Active</Label>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button disabled={processing}>Save</Button>
                    </div>
                </>
            )}
        </Form>
    );
}
