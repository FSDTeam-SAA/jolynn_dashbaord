"use client";

import React, { useEffect, useRef } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Link,
  List,
  ListOrdered,
  Underline,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const controls = [
  { command: "bold", label: "Bold", icon: Bold },
  { command: "italic", label: "Italic", icon: Italic },
  { command: "underline", label: "Underline", icon: Underline },
  { command: "insertUnorderedList", label: "Bullet list", icon: List },
  { command: "insertOrderedList", label: "Numbered list", icon: ListOrdered },
  { command: "justifyLeft", label: "Align left", icon: AlignLeft },
  { command: "justifyCenter", label: "Align center", icon: AlignCenter },
  { command: "justifyRight", label: "Align right", icon: AlignRight },
];

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const runCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    onChange(editorRef.current?.innerHTML ?? "");
  };

  const addLink = () => {
    const url = window.prompt("Enter the link URL");
    if (url) runCommand("createLink", url);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white focus-within:border-[#2b3674]">
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-slate-50 p-2">
        {controls.map(({ command, label, icon: Icon }) => (
          <button
            key={command}
            type="button"
            title={label}
            aria-label={label}
            onMouseDown={(event) => {
              event.preventDefault();
              runCommand(command);
            }}
            className="rounded p-2 text-gray-600 transition-colors hover:bg-white hover:text-[#2b3674]"
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
        <button
          type="button"
          title="Add link"
          aria-label="Add link"
          onMouseDown={(event) => {
            event.preventDefault();
            addLink();
          }}
          className="rounded p-2 text-gray-600 transition-colors hover:bg-white hover:text-[#2b3674]"
        >
          <Link className="h-4 w-4" />
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        className="min-h-[170px] px-4 py-3 text-sm text-gray-700 outline-none empty:before:pointer-events-none empty:before:text-gray-400 empty:before:content-[attr(data-placeholder)]"
      />
    </div>
  );
}
