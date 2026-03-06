interface Props {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  [key: string]: any; // Allow aria-label and other props
}
export default function IconButton(props: Props) {
  const {
    children,
    onClick = (event: React.MouseEvent<HTMLButtonElement>) => {},
    className = "",
    ...rest
  } = props;
  return (
    <button
      onClick={onClick}
      className={`focus:outline-none focus:border-none hover:bg-gray-400 hover:bg-opacity-25 p-2 rounded-full inline-flex items-center ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
