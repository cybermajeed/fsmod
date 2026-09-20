import { FileKind } from "../lib/parser";
import { useFileIcon } from "../lib/useFileIcon";

interface FileIconProps {
  kind: FileKind;
  name: string;
  className?: string;
}

export function FileIcon({ kind, name, className = "w-5 h-5" }: FileIconProps) {
  const iconPath = useFileIcon(name, kind);

  if (!iconPath) {
    // Placeholder while icon mapping loads
    return (
      <div className={`${className} bg-gray-200/20 animate-pulse rounded`} />
    );
  }

  return (
    <img
      src={iconPath}
      alt={`${name} icon`}
      className={`${className} object-contain`}
      aria-hidden="true"
    />
  );
}
