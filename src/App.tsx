import { useEffect, useState, useMemo } from "react";
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
} from "react-resizable-panels";
import { parseDirectory, FileEntry } from "./lib/parser";
import { FileIcon } from "./components/FileIcon";
import { PreviewPane } from "./components/PreviewPane";
import {
  Search,
  Moon,
  Sun,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";

export default function App() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<FileEntry | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [previewLocked, setPreviewLocked] = useState(false);
  const defaultColWidths = { name: 400, type: 128, size: 128, date: 160 };
  const [colWidths, setColWidths] = useState(defaultColWidths);
  const [sortColumn, setSortColumn] =
    useState<keyof typeof defaultColWidths>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    setFiles(parseDirectory());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (
      typeof (window as any).chrome !== "undefined" &&
      (window as any).chrome.storage
    ) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).chrome.storage.sync.get(
        ["theme", "colWidths", "previewLocked"],
        (result: any) => {
          if (
            result.theme &&
            (result.theme === "light" || result.theme === "dark")
          ) {
            setTheme(result.theme);
          }
          if (result.colWidths) {
            setColWidths((prev) => ({ ...prev, ...result.colWidths }));
          }
          if (typeof result.previewLocked === "boolean") {
            setPreviewLocked(result.previewLocked);
          }
        },
      );
    } else {
      const savedWidths = localStorage.getItem("colWidths");
      if (savedWidths) {
        try {
          setColWidths((prev) => ({ ...prev, ...JSON.parse(savedWidths) }));
        } catch (e) {}
      }
      const savedPreviewLocked = localStorage.getItem("previewLocked");
      if (savedPreviewLocked !== null) {
        setPreviewLocked(savedPreviewLocked === "true");
      }
    }
  }, []);

  const handleResizeMouseDown = (
    e: React.MouseEvent,
    col: keyof typeof defaultColWidths,
  ) => {
    e.preventDefault();
    const startX = e.pageX;
    const startWidth = colWidths[col];
    const maxAllowedWidth = window.innerWidth - 100;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(
        80,
        Math.min(maxAllowedWidth, startWidth + (moveEvent.pageX - startX)),
      );
      setColWidths((prev) => ({ ...prev, [col]: newWidth }));
    };

    const onMouseUp = (upEvent: MouseEvent) => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      const finalWidth = Math.max(
        80,
        Math.min(maxAllowedWidth, startWidth + (upEvent.pageX - startX)),
      );

      setColWidths((prev) => {
        const updated = { ...prev, [col]: finalWidth };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (
          typeof (window as any).chrome !== "undefined" &&
          (window as any).chrome.storage
        ) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).chrome.storage.sync.set({ colWidths: updated });
        } else {
          localStorage.setItem("colWidths", JSON.stringify(updated));
        }
        return updated;
      });
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  const togglePreviewLock = () => {
    setPreviewLocked((prev) => {
      const next = !prev;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (
        typeof (window as any).chrome !== "undefined" &&
        (window as any).chrome.storage
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).chrome.storage.sync.set({ previewLocked: next });
      } else {
        localStorage.setItem("previewLocked", String(next));
      }
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === "p") {
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        ) {
          return;
        }
        e.preventDefault();
        togglePreviewLock();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSortClick = (col: keyof typeof defaultColWidths) => {
    if (sortColumn === col) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDirection("asc");
    }
  };

  const parseSize = (sizeStr: string): number => {
    if (!sizeStr) return -1;
    const match = sizeStr.match(/^([\d.]+)\s*(B|kB|MB|GB|TB|PB)/i);
    if (!match) return -1;
    const val = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    const multipliers: Record<string, number> = {
      B: 1,
      KB: 1024,
      MB: 1024 * 1024,
      GB: 1024 * 1024 * 1024,
      TB: 1024 * 1024 * 1024 * 1024,
    };
    return val * (multipliers[unit] || 1);
  };

  const parseDate = (dateStr: string): number => {
    if (!dateStr) return -1;
    const d = Date.parse(dateStr);
    return isNaN(d) ? -1 : d;
  };

  const filtered = useMemo(() => {
    let result = files;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((f) => f.name.toLowerCase().includes(q));
    }
    return result.sort((a, b) => {
      // Folders always first
      if (a.kind === "folder" && b.kind !== "folder") return -1;
      if (b.kind === "folder" && a.kind !== "folder") return 1;

      let cmp = 0;
      if (sortColumn === "name") {
        cmp = a.name.localeCompare(b.name);
      } else if (sortColumn === "type") {
        cmp = a.rawType.localeCompare(b.rawType);
      } else if (sortColumn === "size") {
        cmp = parseSize(a.size) - parseSize(b.size);
      } else if (sortColumn === "date") {
        cmp = parseDate(a.date) - parseDate(b.date);
      }

      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [files, search, sortColumn, sortDirection]);

  const handleRowClick = (e: React.MouseEvent, file: FileEntry) => {
    e.preventDefault();

    if (e.ctrlKey || e.metaKey) {
      window.open(file.url, "_blank");
      return;
    }

    if (file.kind === "folder") {
      if (e.shiftKey) {
        // Do nothing on shift+click on folder
        return;
      }
      // Single click on folder: open it
      window.location.href = file.url;
    } else {
      if (previewLocked || e.shiftKey) {
        // Shift+click on file or if preview lock is enabled: open in preview bar
        setSelected(file);
      } else {
        // Single click on file: open in same tab
        window.location.href = file.url;
      }
    }
  };

  const handleOpenExternally = (file: FileEntry) => {
    window.open(file.url, "_blank");
  };

  return (
    <div className="flex justify-start bg-muted/20 min-h-screen">
      <div className="flex flex-col h-screen w-full max-w-[1600px] bg-background text-foreground overflow-hidden font-sans selection:bg-primary/20 border-r border-border shadow-xl">
        {/* Toolbar */}
        <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-card shadow-sm z-20">
          <div className="relative flex items-center w-full max-w-md">
            <Search
              size={16}
              className="absolute left-3 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Search this folder..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-muted/50 hover:bg-muted border border-transparent hover:border-border rounded-md text-sm w-full focus:bg-background focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-all"
            />
          </div>

          <div className="flex items-center gap-2 ml-4">
            <button
              className={`p-2 hover:bg-muted rounded-md transition-colors ${
                previewLocked ? "text-primary" : "text-muted-foreground"
              }`}
              onClick={togglePreviewLock}
              title={`Toggle Preview Lock (Shift+P)`}
            >
              {previewLocked ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
            <button
              className="p-2 hover:bg-muted rounded-md text-muted-foreground transition-colors"
              onClick={() => {
                const next = theme === "light" ? "dark" : "light";
                setTheme(next);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if (
                  typeof (window as any).chrome !== "undefined" &&
                  (window as any).chrome.storage
                ) {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (window as any).chrome.storage.sync.set({ theme: next });
                }
              }}
              title={`Toggle Theme`}
            >
              {theme === "light" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <PanelGroup orientation="horizontal" className="flex-1 overflow-hidden">
          <Panel
            defaultSize={selected ? 60 : 100}
            minSize={30}
            className="flex flex-col h-full bg-background overflow-hidden relative"
          >
            <div className="flex-1 overflow-auto">
              <table className="w-full min-w-max text-sm text-left border-collapse table-fixed">
                <thead className="sticky top-0 bg-background/95 backdrop-blur border-b border-border z-10 text-muted-foreground select-none">
                  <tr>
                    {(["name", "type", "size", "date"] as const).map((col) => {
                      const labels = {
                        name: "Name",
                        type: "Type",
                        size: "Size",
                        date: "Modified",
                      };
                      return (
                        <th
                          key={col}
                          className="px-6 py-3 font-medium relative group cursor-pointer hover:bg-muted/50 transition-colors"
                          style={{ width: colWidths[col] }}
                          onClick={() => handleSortClick(col)}
                        >
                          <div className="flex items-center gap-1">
                            {labels[col]}
                            {sortColumn === col &&
                              (sortDirection === "asc" ? (
                                <ChevronUp size={14} />
                              ) : (
                                <ChevronDown size={14} />
                              ))}
                          </div>
                          <div
                            onMouseDown={(e) => handleResizeMouseDown(e, col)}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 group-hover:bg-border transition-colors z-20"
                          />
                        </th>
                      );
                    })}
                    <th className="w-full"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((f) => (
                    <tr
                      key={f.url}
                      className={`border-b border-border/30 cursor-pointer select-none transition-colors ${
                        selected?.url === f.url
                          ? "bg-primary/10"
                          : "hover:bg-muted/40"
                      }`}
                      onClick={(e) => handleRowClick(e, f)}
                    >
                      <td className="px-6 py-3 flex items-center gap-3 overflow-hidden">
                        <FileIcon kind={f.kind} name={f.name} />
                        <a
                          href={f.url}
                          className="truncate font-medium flex-1 min-w-0 text-foreground visited:text-muted-foreground/60 transition-colors"
                          onClick={(e) => e.preventDefault()}
                        >
                          {f.name}
                        </a>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground truncate">
                        {f.rawType}
                      </td>
                      <td className="px-6 py-3 text-muted-foreground truncate">
                        {f.size}
                      </td>
                      <td className="px-6 py-3 text-muted-foreground truncate">
                        {f.date}
                      </td>
                      <td></td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-16 text-muted-foreground"
                      >
                        {search
                          ? "No files match your search."
                          : "This folder is empty."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>

          {selected && (
            <>
              <PanelResizeHandle className="w-[1px] bg-border hover:w-1 hover:bg-primary/50 transition-all cursor-col-resize z-10" />
              <Panel
                defaultSize={40}
                minSize={20}
                className="h-full bg-card flex flex-col shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-20"
              >
                <PreviewPane
                  file={selected}
                  onClose={() => setSelected(null)}
                  onOpen={() => handleOpenExternally(selected)}
                />
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>
    </div>
  );
}
