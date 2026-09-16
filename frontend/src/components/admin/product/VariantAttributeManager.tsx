'use client';

import React, { useState } from 'react';
import { VariantAttributeGroup } from '@/hooks/useProductForm';
import { Plus, Trash2, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';

interface VariantAttributeManagerProps {
  attributeGroups: VariantAttributeGroup[];
  onAddGroup: (name: string) => void;
  onRemoveGroup: (groupId: string) => void;
  onAddValue: (groupId: string, value: string) => void;
  onRemoveValue: (groupId: string, value: string) => void;
}

export function VariantAttributeManager({
  attributeGroups,
  onAddGroup,
  onRemoveGroup,
  onAddValue,
  onRemoveValue,
}: VariantAttributeManagerProps) {
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  const handleAddValueClick = (groupId: string) => {
    const val = inputValues[groupId]?.trim();
    if (val) {
      onAddValue(groupId, val);
      setInputValues((prev) => ({ ...prev, [groupId]: '' }));
    }
  };

  const handleCreateGroupClick = () => {
    if (!newGroupName.trim()) {
      toast.error('Vui lòng nhập tên thuộc tính (VD: Trọng lượng, Độ căng dây)...');
      return;
    }
    onAddGroup(newGroupName.trim());
    setNewGroupName('');
  };

  const presetSuggestions = ['Màu sắc', 'Kích thước / Size', 'Trọng lượng', 'Độ căng dây', 'Chất liệu', 'Phân loại'];

  return (
    <div className="p-5 border border-slate-200 rounded-2xl space-y-5 bg-slate-50/50">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm font-bold text-orange-600 uppercase tracking-wider">
          <Sparkles className="w-5 h-5 text-orange-500" /> Trình sinh ma trận biến thể đa thuộc tính
        </div>

        {/* Add New Attribute Group Controls */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Tên thuộc tính mới (VD: Trọng lượng)..."
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateGroupClick())}
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
          <button
            type="button"
            onClick={handleCreateGroupClick}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Thêm Thuộc Tính
          </button>
        </div>
      </div>

      {/* Preset suggestions */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="text-slate-400 font-medium">Gợi ý nhanh:</span>
        {presetSuggestions.map((preset) => {
          const exists = attributeGroups.some((g) => g.name.toLowerCase() === preset.toLowerCase());
          if (exists) return null;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => onAddGroup(preset)}
              className="px-2.5 py-1 bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 text-slate-700 hover:text-orange-600 rounded-lg transition-colors font-medium"
            >
              + {preset}
            </button>
          );
        })}
      </div>

      {/* Render Attribute Groups List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {attributeGroups.map((group) => (
          <div
            key={group.id}
            className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 shadow-sm relative group"
          >
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                {group.name}
              </label>

              {/* Allow removing custom attribute groups (keep at least 1 group) */}
              {attributeGroups.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveGroup(group.id)}
                  className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
                  title="Xóa nhóm thuộc tính này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Input tag for adding values to this group */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={`Nhập giá trị ${group.name} (rồi nhấn Thêm hoặc Enter)...`}
                value={inputValues[group.id] || ''}
                onChange={(e) =>
                  setInputValues((prev) => ({ ...prev, [group.id]: e.target.value }))
                }
                onKeyDown={(e) =>
                  e.key === 'Enter' && (e.preventDefault(), handleAddValueClick(group.id))
                }
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
              <button
                type="button"
                onClick={() => handleAddValueClick(group.id)}
                className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
              >
                Thêm
              </button>
            </div>

            {/* Render Value Tags */}
            <div className="flex flex-wrap gap-2 pt-1 min-h-[32px]">
              {group.values.length === 0 ? (
                <span className="text-xs text-slate-400 italic">Chưa có giá trị nào được thêm...</span>
              ) : (
                group.values.map((val) => (
                  <span
                    key={val}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 text-sm font-semibold rounded-lg border border-orange-200"
                  >
                    {val}
                    <button
                      type="button"
                      onClick={() => onRemoveValue(group.id, val)}
                      className="hover:bg-orange-200/60 rounded p-0.5 transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-orange-600" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
