export default function AppLogo({
    className = '',
}: {
    className?: string;
}) {
    return (
        <img
            src="/images/ljk-logo.png"
            alt="LJK logo"
            className={className}
        />
    );
}