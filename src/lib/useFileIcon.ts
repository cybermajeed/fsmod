import { useState, useEffect } from "react";

let iconMapCache: any = null;
let fetchPromise: Promise<any> | null = null;

export const getAssetUrl = (path: string) => {
  if (
    typeof chrome !== "undefined" &&
    chrome.runtime &&
    chrome.runtime.getURL
  ) {
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    return chrome.runtime.getURL(cleanPath);
  }
  return path;
};

async function fetchIconMap() {
  if (iconMapCache) return iconMapCache;
  if (!fetchPromise) {
    fetchPromise = fetch(getAssetUrl("/icons/material-icons.json"))
      .then((res) => res.json())
      .then((data) => {
        iconMapCache = data;
        return data;
      });
  }
  return fetchPromise;
}

export function useFileIcon(name: string, kind: string) {
  const [iconPath, setIconPath] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    fetchIconMap().then((map) => {
      if (!isMounted) return;

      let id = map.file;

      if (kind === "folder") {
        const folderName = name.toLowerCase();
        id = map.folderNames[folderName] || map.folder;
      } else {
        const fileName = name.toLowerCase();
        if (map.fileNames[fileName]) {
          id = map.fileNames[fileName];
        } else {
          const parts = fileName.split(".");
          let extMatched = false;
          for (let i = 1; i < parts.length; i++) {
            const ext = parts.slice(i).join(".");
            if (map.fileExtensions[ext]) {
              id = map.fileExtensions[ext];
              extMatched = true;
              break;
            }
          }
          if (!extMatched) {
            id = map.file;
          }
        }
      }

      const path = map.iconDefinitions[id]?.iconPath;
      if (path) {
        setIconPath(getAssetUrl(path));
      }
    });

    return () => {
      isMounted = false;
    };
  }, [name, kind]);

  return iconPath;
}
