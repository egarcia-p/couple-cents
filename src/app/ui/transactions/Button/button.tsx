interface Props {
  children: React.ReactNode;
  type?: "submit" | "button" | "reset";
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  className?: string;
  variant?: "primary" | "ghost";
  title?: string;
}
export default function Button(props: Props) {
  const { type = "button", children, onClick, className = "", variant = "primary", title } = props;

  const baseClasses =
    variant === "ghost"
      ? "flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 shadow-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
      : "bg-primary hover:bg-primary-light text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline";

  return (
    <button
      className={`${baseClasses} ${className}`}
      type={type}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}
