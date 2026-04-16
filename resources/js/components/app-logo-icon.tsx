export default function AppLogoIcon({
    className = '',
}: {
    className?: string;
}) {
    return (
        <img
            src="/images/ljk-logo-icon.svg"
            alt="LJK logo"
            className={className}
        />
    );
}