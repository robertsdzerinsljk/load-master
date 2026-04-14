import { Users } from 'lucide-react';

type EmptyStudentsStateProps = {
    text: string;
};

export default function EmptyStudentsState({ text }: EmptyStudentsStateProps) {
    return (
        <div className="flex min-h-[420px] items-center justify-center">
            <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                    <Users className="h-12 w-12 text-[#b9c3bc]" strokeWidth={1.8} />
                </div>

                <p className="mt-4 text-[16px] text-[#5e6e64]">{text}</p>
            </div>
        </div>
    );
}