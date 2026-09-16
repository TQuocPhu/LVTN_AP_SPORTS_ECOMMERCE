'use client';

import React, { useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Image as ImageIcon,
  Link as LinkIcon,
  Undo,
  Redo,
  Type,
} from 'lucide-react';
import { toast } from 'sonner';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  error?: string;
}

export function RichTextEditor({ value, onChange, error }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const execCommand = (command: string, arg: string | undefined = undefined) => {
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val) {
      execCommand('fontSize', val);
    }
  };

  const handleInsertImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        toast.error('Tệp được chọn không phải là hình ảnh!');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          execCommand('insertImage', dataUrl);
          toast.success('Đã chèn ảnh vào nội dung mô tả!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInsertLink = () => {
    const url = prompt('Nhập URL liên kết:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  return (
    <div className="space-y-1">
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-orange-500/20">
        {/* Hidden File Input for Image Insertion */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleInsertImageFile}
          className="hidden"
        />

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-slate-50 border-b border-slate-200">
          {/* Font Size Select */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-sm">
            <Type className="w-4 h-4 text-slate-500" />
            <select
              onChange={handleFontSizeChange}
              defaultValue="3"
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
              title="Chọn cỡ chữ"
            >
              <option value="1">Chữ rất nhỏ (10px)</option>
              <option value="2">Chữ nhỏ (13px)</option>
              <option value="3">Chữ thường (16px)</option>
              <option value="4">Chữ vừa (18px)</option>
              <option value="5">Chữ lớn (24px)</option>
              <option value="6">Tiêu đề lớn (32px)</option>
              <option value="7">Tiêu đề cực lớn (48px)</option>
            </select>
          </div>

          <div className="w-px h-5 bg-slate-300 mx-1" />

          {/* Text Formatting */}
          <button
            type="button"
            onClick={() => execCommand('bold')}
            className="p-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            title="In đậm (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCommand('italic')}
            className="p-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            title="In nghiêng (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCommand('underline')}
            className="p-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            title="Gạch chân (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-300 mx-1" />

          {/* Headings */}
          <button
            type="button"
            onClick={() => execCommand('formatBlock', '<h1>')}
            className="p-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            title="Tiêu đề H1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCommand('formatBlock', '<h2>')}
            className="p-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            title="Tiêu đề H2"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-300 mx-1" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => execCommand('insertUnorderedList')}
            className="p-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            title="Danh sách dấu chấm"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCommand('insertOrderedList')}
            className="p-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            title="Danh sách số"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-300 mx-1" />

          {/* Insert Image & Link */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-700 hover:bg-orange-100 hover:text-orange-600 rounded-lg transition-colors"
            title="Chèn tệp ảnh từ máy tính"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleInsertLink}
            className="p-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            title="Chèn liên kết URL"
          >
            <LinkIcon className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-300 mx-1" />

          {/* Undo/Redo */}
          <button
            type="button"
            onClick={() => execCommand('undo')}
            className="p-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            title="Hoàn tác (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCommand('redo')}
            className="p-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            title="Làm lại (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Editable Area */}
        <div
          ref={editorRef}
          contentEditable
          onInput={(e) => onChange(e.currentTarget.innerHTML)}
          className="min-h-[260px] p-4 text-base text-slate-800 focus:outline-none prose max-w-none"
        />
      </div>
      {error && <p className="text-sm font-semibold text-rose-500 mt-1">{error}</p>}
    </div>
  );
}
