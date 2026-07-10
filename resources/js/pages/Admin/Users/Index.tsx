import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import {
    Mail,
    Pencil,
    Save,
    Search,
    ShieldCheck,
    Trash2,
    UserPlus,
    Users,
    X,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

type Role = 'admin' | 'teacher' | 'student';

type SchoolClass = {
    id: number;
    name: string;
    code?: string | null;
    academic_year?: string | null;
};

type ManagedUser = {
    id: number;
    name: string;
    first_name?: string | null;
    last_name?: string | null;
    email: string;
    role: Role;
    is_admin?: boolean;
    class_id?: number | null;
    created_at?: string | null;
    class?: SchoolClass | null;
    has_google?: boolean;
};

type Props = {
    users: ManagedUser[];
    classes: SchoolClass[];
    roles: Role[];
};

const roleLabels: Record<Role, string> = {
    admin: 'Administrators',
    teacher: 'Pasniedzējs',
    student: 'Students',
};

function classLabel(item?: SchoolClass | null) {
    if (!item) return 'Bez grupas';
    const code = item.code?.trim() ?? '';
    const name = item.name?.trim() ?? '';
    const label =
        code && name && code !== name ? `${code} - ${name}` : code || name;
    const year = item.academic_year ? ` (${item.academic_year})` : '';
    return `${label}${year}`;
}

function classLabelWithoutYear(item: SchoolClass) {
    const code = item.code?.trim() ?? '';
    const name = item.name?.trim() ?? '';

    return code && name && code !== name ? `${code} - ${name}` : code || name;
}

function groupClassesByYear(classes: SchoolClass[]) {
    const groups = new Map<string, SchoolClass[]>();

    classes.forEach((item) => {
        const year = item.academic_year || 'Bez mācību gada';
        groups.set(year, [...(groups.get(year) ?? []), item]);
    });

    return Array.from(groups.entries()).map(([year, items]) => ({
        year,
        items,
    }));
}

function UserForm({
    classes,
    onCreated,
}: {
    classes: SchoolClass[];
    onCreated: () => void;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        role: 'student' as Role,
        is_admin: false,
        class_id: '',
        password: '',
    });
    const groupedClasses = useMemo(() => groupClassesByYear(classes), [classes]);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        post('/admin/users', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onCreated();
            },
        });
    };

    return (
        <form onSubmit={submit} className="grid gap-4 lg:grid-cols-12">
            <div className="lg:col-span-2">
                <Label htmlFor="first_name">Vārds</Label>
                <Input
                    id="first_name"
                    value={data.first_name}
                    onChange={(event) =>
                        setData('first_name', event.target.value)
                    }
                    className="mt-2 h-11 rounded-xl"
                    required
                />
                <InputError message={errors.first_name} className="mt-1" />
            </div>

            <div className="lg:col-span-2">
                <Label htmlFor="last_name">Uzvārds</Label>
                <Input
                    id="last_name"
                    value={data.last_name}
                    onChange={(event) =>
                        setData('last_name', event.target.value)
                    }
                    className="mt-2 h-11 rounded-xl"
                    required
                />
                <InputError message={errors.last_name} className="mt-1" />
            </div>

            <div className="lg:col-span-3">
                <Label htmlFor="email">E-pasts</Label>
                <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(event) => setData('email', event.target.value)}
                    className="mt-2 h-11 rounded-xl"
                    required
                />
                <InputError message={errors.email} className="mt-1" />
            </div>

            <div className="lg:col-span-2">
                <Label htmlFor="role">Loma</Label>
                <select
                    id="role"
                    value={data.role}
                    onChange={(event) => {
                        const role = event.target.value as Role;
                        setData('role', role);
                        if (role !== 'student') setData('class_id', '');
                    }}
                    className="mt-2 h-11 w-full rounded-xl border border-input bg-white px-3 text-sm"
                >
                    {Object.entries(roleLabels).map(([role, label]) => (
                        <option key={role} value={role}>
                            {label}
                        </option>
                    ))}
                </select>
                <InputError message={errors.role} className="mt-1" />
            </div>

            <div className="lg:col-span-2">
                <Label htmlFor="class_id">Grupa</Label>
                <select
                    id="class_id"
                    value={data.class_id}
                    onChange={(event) =>
                        setData('class_id', event.target.value)
                    }
                    disabled={data.role !== 'student'}
                    className="mt-2 h-11 w-full rounded-xl border border-input bg-white px-3 text-sm disabled:bg-[#f8fbf9]"
                >
                    <option value="">Bez grupas</option>
                    {groupedClasses.map((group) => (
                        <optgroup key={group.year} label={group.year}>
                            {group.items.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {classLabelWithoutYear(item)}
                                </option>
                            ))}
                        </optgroup>
                    ))}
                </select>
                <InputError message={errors.class_id} className="mt-1" />
            </div>

            <label className="flex items-center gap-3 self-end rounded-xl border border-[#d9ded9] bg-white px-3 py-2 text-sm font-medium text-[#344137] lg:col-span-1">
                <input
                    type="checkbox"
                    checked={Boolean(data.is_admin) || data.role === 'admin'}
                    disabled={data.role === 'admin'}
                    onChange={(event) =>
                        setData('is_admin', event.target.checked)
                    }
                    className="h-4 w-4 rounded border-[#cfd8d2] text-[#1B6250]"
                />
                Admin
            </label>

            <div className="lg:col-span-1">
                <Label htmlFor="password">Parole</Label>
                <Input
                    id="password"
                    type="password"
                    value={data.password}
                    onChange={(event) =>
                        setData('password', event.target.value)
                    }
                    className="mt-2 h-11 rounded-xl"
                    required
                />
                <InputError message={errors.password} className="mt-1" />
            </div>

            <div className="lg:col-span-12">
                <Button
                    type="submit"
                    disabled={processing}
                    className="h-11 rounded-xl bg-[#1B6250] px-5 text-white hover:bg-[#164f41]"
                >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Pievienot lietotāju
                </Button>
            </div>
        </form>
    );
}

export default function AdminUsersIndex({ users, classes }: Props) {
    const [search, setSearch] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editData, setEditData] = useState<Record<string, string>>({});
    const groupedClasses = useMemo(() => groupClassesByYear(classes), [classes]);

    const filteredUsers = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return users;

        return users.filter((user) =>
            [
                user.name,
                user.email,
                roleLabels[user.role],
                classLabel(user.class),
            ]
                .join(' ')
                .toLowerCase()
                .includes(query),
        );
    }, [search, users]);

    const stats = useMemo(
        () => ({
            admins: users.filter((user) => user.role === 'admin').length,
            adminAccess: users.filter(
                (user) => user.role === 'admin' || user.is_admin,
            ).length,
            teachers: users.filter((user) => user.role === 'teacher').length,
            students: users.filter((user) => user.role === 'student').length,
            ungroupedStudents: users.filter(
                (user) => user.role === 'student' && !user.class_id,
            ).length,
        }),
        [users],
    );

    const startEdit = (user: ManagedUser) => {
        setEditingId(user.id);
        setEditData({
            first_name: user.first_name ?? '',
            last_name: user.last_name ?? '',
            email: user.email,
            role: user.role,
            is_admin: user.is_admin ? '1' : '0',
            class_id: user.class_id ? String(user.class_id) : '',
            password: '',
        });
    };

    const saveEdit = (user: ManagedUser) => {
        router.put(`/admin/users/${user.id}`, editData, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingId(null);
                setEditData({});
            },
        });
    };

    const destroy = (user: ManagedUser) => {
        if (!window.confirm(`Dzēst lietotāju ${user.name}?`)) return;
        router.delete(`/admin/users/${user.id}`, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Lietotāji" />

            <AdminLayout>
                <div className="space-y-5">
                    <section className="rounded-[28px] border border-[#d9ded9] bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                            <div>
                                <h1 className="text-3xl font-semibold tracking-tight text-[#182219]">
                                    Lietotāju pārvaldība
                                </h1>
                                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5f6d65]">
                                    Pārvaldi adminus, pasniedzējus, studentus un
                                    studentu grupu piesaistes.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 xl:w-[780px]">
                                <Stat label="Admini" value={stats.admins} />
                                <Stat
                                    label="Admin piekļuve"
                                    value={stats.adminAccess}
                                />
                                <Stat
                                    label="Pasniedzēji"
                                    value={stats.teachers}
                                />
                                <Stat label="Studenti" value={stats.students} />
                                <Stat
                                    label="Bez grupas"
                                    value={stats.ungroupedStudents}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="rounded-[28px] border border-[#d9ded9] bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <button
                                type="button"
                                onClick={() => setCreateOpen((open) => !open)}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1B6250] px-4 text-sm font-semibold text-white transition hover:bg-[#164f41]"
                            >
                                {createOpen ? (
                                    <X className="h-4 w-4" />
                                ) : (
                                    <UserPlus className="h-4 w-4" />
                                )}
                                {createOpen
                                    ? 'Aizvērt formu'
                                    : 'Jauns lietotājs'}
                            </button>

                            <div className="relative w-full lg:w-[420px]">
                                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#7b887f]" />
                                <input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    className="h-11 w-full rounded-xl border border-[#d9ded9] bg-white pr-4 pl-10 text-sm transition outline-none focus:border-[#166a4d] focus:ring-4 focus:ring-[#edf6f0]"
                                    placeholder="Meklēt lietotāju..."
                                />
                            </div>
                        </div>

                        {createOpen ? (
                            <div className="mt-5 rounded-2xl border border-[#d9ded9] bg-[#f8fbf9] p-4">
                                <UserForm
                                    classes={classes}
                                    onCreated={() => setCreateOpen(false)}
                                />
                            </div>
                        ) : null}
                    </section>

                    <section className="overflow-hidden rounded-[28px] border border-[#d9ded9] bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[980px] text-left text-sm">
                                <thead className="border-b border-[#eef1ee] bg-[#f8fbf9] text-xs font-semibold tracking-[0.12em] text-[#6b776f] uppercase">
                                    <tr>
                                        <th className="px-5 py-4">Lietotājs</th>
                                        <th className="px-5 py-4">Loma</th>
                                        <th className="px-5 py-4">Grupa</th>
                                        <th className="px-5 py-4">Piekļuve</th>
                                        <th className="px-5 py-4 text-right">
                                            Darbības
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#eef1ee]">
                                    {filteredUsers.map((user) => {
                                        const editing = editingId === user.id;

                                        return (
                                            <tr key={user.id}>
                                                <td className="px-5 py-4 align-top">
                                                    {editing ? (
                                                        <div className="grid gap-2 sm:grid-cols-2">
                                                            <Input
                                                                value={
                                                                    editData.first_name ??
                                                                    ''
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    setEditData(
                                                                        (
                                                                            old,
                                                                        ) => ({
                                                                            ...old,
                                                                            first_name:
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                        }),
                                                                    )
                                                                }
                                                                className="h-10 rounded-xl"
                                                            />
                                                            <Input
                                                                value={
                                                                    editData.last_name ??
                                                                    ''
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    setEditData(
                                                                        (
                                                                            old,
                                                                        ) => ({
                                                                            ...old,
                                                                            last_name:
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                        }),
                                                                    )
                                                                }
                                                                className="h-10 rounded-xl"
                                                            />
                                                            <Input
                                                                type="email"
                                                                value={
                                                                    editData.email ??
                                                                    ''
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    setEditData(
                                                                        (
                                                                            old,
                                                                        ) => ({
                                                                            ...old,
                                                                            email: event
                                                                                .target
                                                                                .value,
                                                                        }),
                                                                    )
                                                                }
                                                                className="h-10 rounded-xl sm:col-span-2"
                                                            />
                                                            <Input
                                                                type="password"
                                                                value={
                                                                    editData.password ??
                                                                    ''
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    setEditData(
                                                                        (
                                                                            old,
                                                                        ) => ({
                                                                            ...old,
                                                                            password:
                                                                                event
                                                                                    .target
                                                                                    .value,
                                                                        }),
                                                                    )
                                                                }
                                                                placeholder="Jauna parole"
                                                                className="h-10 rounded-xl sm:col-span-2"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <div className="font-semibold text-[#182219]">
                                                                {user.name}
                                                            </div>
                                                            <div className="mt-1 flex items-center gap-2 text-xs text-[#6b776f]">
                                                                <Mail className="h-3.5 w-3.5" />
                                                                {user.email}
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 align-top">
                                                    {editing ? (
                                                        <select
                                                            value={
                                                                editData.role
                                                            }
                                                            onChange={(event) =>
                                                                setEditData(
                                                                    (old) => ({
                                                                        ...old,
                                                                        role: event
                                                                            .target
                                                                            .value,
                                                                        is_admin:
                                                                            event
                                                                                .target
                                                                                .value ===
                                                                            'admin'
                                                                                ? '1'
                                                                                : old.is_admin,
                                                                        class_id:
                                                                            event
                                                                                .target
                                                                                .value ===
                                                                            'student'
                                                                                ? old.class_id
                                                                                : '',
                                                                    }),
                                                                )
                                                            }
                                                            className="h-10 w-full rounded-xl border border-input bg-white px-3"
                                                        >
                                                            {Object.entries(
                                                                roleLabels,
                                                            ).map(
                                                                ([
                                                                    role,
                                                                    label,
                                                                ]) => (
                                                                    <option
                                                                        key={
                                                                            role
                                                                        }
                                                                        value={
                                                                            role
                                                                        }
                                                                    >
                                                                        {label}
                                                                    </option>
                                                                ),
                                                            )}
                                                        </select>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-2">
                                                            <span className="inline-flex items-center rounded-full border border-[#d9ded9] bg-[#f8fbf9] px-2.5 py-1 text-xs font-semibold text-[#182219]">
                                                                {
                                                                    roleLabels[
                                                                        user
                                                                            .role
                                                                    ]
                                                                }
                                                            </span>
                                                            {user.is_admin &&
                                                            user.role !==
                                                                'admin' ? (
                                                                <span className="inline-flex items-center rounded-full border border-[#cfe3d8] bg-[#f3faf6] px-2.5 py-1 text-xs font-semibold text-[#1B6250]">
                                                                    Admin
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 align-top">
                                                    {editing ? (
                                                        <select
                                                            value={
                                                                editData.class_id
                                                            }
                                                            disabled={
                                                                editData.role !==
                                                                'student'
                                                            }
                                                            onChange={(event) =>
                                                                setEditData(
                                                                    (old) => ({
                                                                        ...old,
                                                                        class_id:
                                                                            event
                                                                                .target
                                                                                .value,
                                                                    }),
                                                                )
                                                            }
                                                            className="h-10 w-full rounded-xl border border-input bg-white px-3 disabled:bg-[#f8fbf9]"
                                                        >
                                                            <option value="">
                                                                Bez grupas
                                                            </option>
                                                            {groupedClasses.map(
                                                                (group) => (
                                                                    <optgroup
                                                                        key={
                                                                            group.year
                                                                        }
                                                                        label={
                                                                            group.year
                                                                        }
                                                                    >
                                                                        {group.items.map(
                                                                            (
                                                                                item,
                                                                            ) => (
                                                                                <option
                                                                                    key={
                                                                                        item.id
                                                                                    }
                                                                                    value={
                                                                                        item.id
                                                                                    }
                                                                                >
                                                                                    {classLabelWithoutYear(
                                                                                        item,
                                                                                    )}
                                                                                </option>
                                                                            ),
                                                                        )}
                                                                    </optgroup>
                                                                ),
                                                            )}
                                                        </select>
                                                    ) : (
                                                        <span
                                                            className={
                                                                user.role ===
                                                                    'student' &&
                                                                !user.class_id
                                                                    ? 'text-amber-700'
                                                                    : 'text-[#425347]'
                                                            }
                                                        >
                                                            {user.role ===
                                                            'student'
                                                                ? classLabel(
                                                                      user.class,
                                                                  )
                                                                : '-'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 align-top">
                                                    {editing ? (
                                                        <label className="inline-flex items-center gap-2 rounded-xl border border-[#d9ded9] bg-white px-3 py-2 text-xs font-semibold text-[#344137]">
                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    editData.role ===
                                                                        'admin' ||
                                                                    editData.is_admin ===
                                                                        '1'
                                                                }
                                                                disabled={
                                                                    editData.role ===
                                                                    'admin'
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    setEditData(
                                                                        (
                                                                            old,
                                                                        ) => ({
                                                                            ...old,
                                                                            is_admin:
                                                                                event
                                                                                    .target
                                                                                    .checked
                                                                                    ? '1'
                                                                                    : '0',
                                                                        }),
                                                                    )
                                                                }
                                                            />
                                                            Admin settings
                                                        </label>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-2 text-xs text-[#6b776f]">
                                                            <ShieldCheck className="h-3.5 w-3.5" />
                                                            {[
                                                                user.has_google
                                                                    ? 'Google'
                                                                    : 'Parole',
                                                                user.role ===
                                                                    'admin' ||
                                                                user.is_admin
                                                                    ? 'Admin'
                                                                    : null,
                                                            ]
                                                                .filter(
                                                                    Boolean,
                                                                )
                                                                .join(' + ')}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 align-top">
                                                    <div className="flex justify-end gap-2">
                                                        {editing ? (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        saveEdit(
                                                                            user,
                                                                        )
                                                                    }
                                                                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B6250] text-white"
                                                                    aria-label="Saglabāt"
                                                                >
                                                                    <Save className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setEditingId(
                                                                            null,
                                                                        )
                                                                    }
                                                                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#d9ded9] text-[#425347]"
                                                                    aria-label="Atcelt"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        startEdit(
                                                                            user,
                                                                        )
                                                                    }
                                                                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#d9ded9] text-[#425347] transition hover:bg-[#edf2ee]"
                                                                    aria-label="Rediģēt"
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        destroy(
                                                                            user,
                                                                        )
                                                                    }
                                                                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 text-red-700 transition hover:bg-red-50"
                                                                    aria-label="Dzēst"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </AdminLayout>
        </>
    );
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-2xl border border-[#d9ded9] bg-[#f8fbf9] px-3.5 py-3">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#166a4d]">
                    <Users className="h-5 w-5" />
                </div>
                <div>
                    <div className="text-xs font-medium text-[#6b776f]">
                        {label}
                    </div>
                    <div className="text-2xl leading-none font-semibold text-[#182219]">
                        {value}
                    </div>
                </div>
            </div>
        </div>
    );
}
