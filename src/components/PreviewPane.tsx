import { X, ExternalLink } from "lucide-react";
import { FileEntry } from "../lib/parser";
import { FileIcon } from "./FileIcon";
import { AudioPlayer } from "./AudioPlayer";
import { VideoPlayer } from "./VideoPlayer";

interface Props {
  file: FileEntry;
  onClose: () => void;
  onOpen: () => void;
}

export function PreviewPane({ file, onClose, onOpen }: Props) {
  const renderPreview = () => {
    switch (file.kind) {
      case "image":
        return (
          <div className="flex-1 flex items-center justify-center p-4 bg-muted/5">
            <div className="relative max-w-full max-h-full">
              <img
                src={file.url}
                alt={file.name}
                className="max-w-full max-h-full object-contain shadow-sm border border-border/50 rounded"
                style={{
                  backgroundImage:
                    "repeating-conic-gradient(var(--border) 0% 25%, transparent 0% 50%)",
                  backgroundSize: "16px 16px",
                }}
              />
            </div>
          </div>
        );
      case "audio":
        return <AudioPlayer url={file.url} name={file.name} />;
      case "video":
        return <VideoPlayer url={file.url} />;
      case "pdf":
        return (
          <iframe
            key={file.url}
            src={file.url}
            className="w-full h-full border-0"
            title={file.name}
          />
        );
      case "text":
      case "code":
        return (
          <iframe
            key={file.url}
            src={file.url}
            className="w-full h-full border-0 bg-white dark:invert dark:hue-rotate-180"
            title={file.name}
          />
        );
      case "folder":
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 bg-muted/5">
            <FileIcon kind="folder" name={file.name} className="w-24 h-24" />
            <h3 className="text-lg font-medium">{file.name}</h3>
            <p className="text-sm text-muted-foreground">{file.rawType}</p>
            <button
              onClick={onOpen}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 text-sm font-medium transition-colors"
            >
              Open Folder
            </button>
          </div>
        );
      default:
        return (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 bg-muted/5">
            <FileIcon kind={file.kind} name={file.name} className="w-24 h-24" />
            <h3 className="text-lg font-medium">{file.name}</h3>
            <p className="text-sm text-muted-foreground">Preview unavailable</p>
            <button
              onClick={onOpen}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 text-sm font-medium transition-colors"
            >
              Open File
            </button>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-card">
      <div className="flex items-center justify-between p-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2 truncate px-2">
          <FileIcon
            kind={file.kind}
            name={file.name}
            className="w-4 h-4 shrink-0"
          />
          <span className="text-sm font-medium truncate">{file.name}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onOpen}
            className="p-1.5 hover:bg-muted rounded text-muted-foreground transition-colors"
            title="Open externally"
          >
            <ExternalLink size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded text-muted-foreground transition-colors"
            title="Close preview"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col relative bg-background">
        {renderPreview()}
      </div>
    </div>
  );
}
