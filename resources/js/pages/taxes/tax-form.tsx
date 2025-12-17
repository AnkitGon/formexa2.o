import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Form } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

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
    const nameRef = useRef<HTMLInputElement | null>(null);
    const [isActive, setIsActive] = useState<boolean>(
        mode === 'create' ? true : Boolean(tax?.is_active),
    );
    const [taxType, setTaxType] = useState<string>(
        mode === 'create' ? 'fixed' : String(tax?.type ?? 'fixed'),
    );

    useEffect(() => {
        const el = nameRef.current;
        if (!el) {
            return;
        }

        try {
            el.focus();
            const len = el.value.length;
            el.setSelectionRange(len, len);
        } catch {
        }
    }, []);

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
                                ref={nameRef}
                            />
                            <InputError message={(errors as any).name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="type">Type</Label>
                            <input type="hidden" name="type" value={taxType} />
                            <Select
                                value={taxType}
                                onValueChange={(v) => setTaxType(v)}
                            >
                                <SelectTrigger id="type" className="h-9">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(typeOptions ?? {}).map(
                                        ([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ),
                                    )}
                                </SelectContent>
                            </Select>
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
                            type="hidden"
                            name="is_active"
                            value={isActive ? '1' : '0'}
                        />
                        <Checkbox
                            id="is_active"
                            checked={isActive}
                            onCheckedChange={(v) => setIsActive(v === true)}
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
