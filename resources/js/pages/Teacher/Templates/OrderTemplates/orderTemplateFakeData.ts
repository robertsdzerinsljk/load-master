export type SelectOption = {
    id: number;
    name: string;
};

export const transportTypeOptions: SelectOption[] = [
    { id: 1, name: 'Autotransports' },
    { id: 2, name: 'Jūras transports' },
    { id: 3, name: 'Dzelzceļa transports' },
    { id: 4, name: 'Avio transports' },
];

export const temperatureModeOptions: SelectOption[] = [
    { id: 1, name: 'Ambient / Parastā temperatūra' },
    { id: 2, name: 'Chilled / Atdzesēts (+2 līdz +8°C)' },
    { id: 3, name: 'Frozen / Saldēts (-18°C)' },
];

export const specialConditionOptions: SelectOption[] = [
    { id: 1, name: 'Trausla krava' },
    { id: 2, name: 'Bīstamā krava (ADR)' },
    { id: 3, name: 'Steidzama piegāde' },
    { id: 4, name: 'Papildu apdrošināšana' },
];

export const customsDocumentOptions: SelectOption[] = [
    { id: 1, name: 'CMR' },
    { id: 2, name: 'Commercial Invoice' },
    { id: 3, name: 'Packing List' },
    { id: 4, name: 'EX-1 / Eksporta deklarācija' },
];

export const orderTemplateStatusOptions = [
    'Melnraksts',
    'Gatavs',
] as const;

export const orderTemplateList = [
    {
        id: 1,
        title: 'Pārtikas piegāde uz Vāciju',
        client: 'Baltic Food Export',
        cargo: 'Piena produkti',
        priority: 'Augsta',
        transportType: 'Autotransports',
        temperatureMode: 'Chilled / Atdzesēts (+2 līdz +8°C)',
        specialCondition: 'Steidzama piegāde',
        customsDocument: 'CMR',
        status: 'Melnraksts',
    },
    {
        id: 2,
        title: 'Rūpniecības iekārtu imports',
        client: 'Nord Machinery SIA',
        cargo: 'Metāla komponentes',
        priority: 'Vidēja',
        transportType: 'Jūras transports',
        temperatureMode: 'Ambient / Parastā temperatūra',
        specialCondition: 'Papildu apdrošināšana',
        customsDocument: 'Commercial Invoice',
        status: 'Gatavs',
    },
    {
        id: 3,
        title: 'Farmācijas krava uz Zviedriju',
        client: 'MedSupply Baltic',
        cargo: 'Medikamenti',
        priority: 'Augsta',
        transportType: 'Avio transports',
        temperatureMode: 'Chilled / Atdzesēts (+2 līdz +8°C)',
        specialCondition: 'Trausla krava',
        customsDocument: 'Packing List',
        status: 'Piešķirts',
    },
];

export const fakeStudents = [
    { id: 1, name: 'Jānis Bērziņš', group: 'LM-2' },
    { id: 2, name: 'Anna Ozola', group: 'LM-2' },
    { id: 3, name: 'Mārtiņš Liepa', group: 'LM-3' },
    { id: 4, name: 'Elīna Kalniņa', group: 'LM-3' },
];

export const fakeGroups = [
    { id: 1, name: 'LM-2', studentCount: 12 },
    { id: 2, name: 'LM-3', studentCount: 15 },
    { id: 3, name: 'LM-4', studentCount: 10 },
];