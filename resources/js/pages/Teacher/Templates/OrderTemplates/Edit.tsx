import TeacherLayout from '@/layouts/TeacherLayout';
import { Head, Link } from '@inertiajs/react';
import OrderTemplateForm from './OrderTemplateForm';

type EditProps = {
    template: any;
    options: any;
};

export default function Edit({ template, options }: EditProps) {
    return (
        <TeacherLayout>
            <Head title={`Rediģēt sagatavi — ${template.title}`} />

            <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight text-[#182219]">
                            Rediģēt uzdevuma sagatavi
                        </h1>
                        <p className="mt-2 text-[15px] text-[#5b6b61]">
                            Atjaunojiet scenārija tipu, noteikumus, resursus un
                            laika parametrus.
                        </p>
                    </div>

                    <Link
                        href={`/teacher/templates/order-templates/${template.id}`}
                        className="inline-flex items-center rounded-xl border border-[#d9ded9] bg-white px-4 py-2 text-sm font-medium text-[#182219] transition hover:bg-[#f7f9f7]"
                    >
                        Atpakaļ uz skatījumu
                    </Link>
                </div>

                <div className="rounded-[28px] border border-[#d9ded9] bg-[#fcfdfc] p-4 shadow-sm sm:p-6">
                    <OrderTemplateForm
                        options={options}
                        isEdit
                        id={template.id}
                        submitLabel="Saglabāt izmaiņas"
                        initialData={{
                            title: template.title ?? '',
                            scenario_type: template.scenario_type ?? 'land_transport',
                            scenario_focus: template.scenario_focus ?? 'general',
                            evaluation_mode: template.evaluation_mode ?? 'practice',
                            status: template.status ?? 'draft',
                            description: template.description ?? '',
                            student_brief: template.student_brief ?? '',
                            teacher_notes: template.teacher_notes ?? '',

                            cargo_name: template.cargo_name ?? '',
                            cargo_type: template.cargo_type ?? '',
                            cargo_amount_containers:
                                template.cargo_amount_containers ?? '',
                            cargo_amount_tons: template.cargo_amount_tons ?? '',
                            cargo_volume_m3: template.cargo_volume_m3 ?? '',
                            cargo_value: template.cargo_value ?? '',

                            temperature_mode_id: template.temperature_mode_id ?? '',
                            special_condition_id: template.special_condition_id ?? '',

                            start_location_id: template.start_location_id ?? '',
                            end_location_id: template.end_location_id ?? '',
                            start_port_id: template.start_port_id ?? '',
                            end_port_id: template.end_port_id ?? '',

                            deadline_date: template.deadline_date ?? '',
                            scenario_start_at: template.scenario_start_at ?? '',
                            deadline_at: template.deadline_at ?? '',
                            budget_limit: template.budget_limit ?? '',
                            requires_refuel_planning:
                                template.requires_refuel_planning ?? false,
                            max_trips: template.max_trips ?? '',
                            priority: template.priority ?? '',

                            scenario_config: template.scenario_config ?? null,

                            transportTemplates: template.transportTemplates ?? [],
                            transport_templates: template.transportTemplates ?? [],
                            ships: template.ships ?? [],
                            ports: template.ports ?? [],
                            landRoutes: template.landRoutes ?? [],
                            land_routes: template.landRoutes ?? [],
                        }}
                    />
                </div>
            </div>
        </TeacherLayout>
    );
}