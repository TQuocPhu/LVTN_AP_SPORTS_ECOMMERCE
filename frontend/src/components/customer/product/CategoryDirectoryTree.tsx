'use client';

import React, { useState } from 'react';
import { CategoryResponse } from '@/types/category';
import { Folder, FolderOpen, ChevronRight, ChevronDown, Tag, Layers } from 'lucide-react';

interface CategoryDirectoryTreeProps {
  categoryTree: CategoryResponse[];
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null, name: string | null) => void;
}

interface TreeNodeProps {
  category: CategoryResponse;
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null, name: string | null) => void;
  level: number;
}

function TreeNode({ category, selectedCategoryId, onSelectCategory, level }: TreeNodeProps) {
  const hasChildren = category.children && category.children.length > 0;
  const isSelected = selectedCategoryId === category.id;
  const [expanded, setExpanded] = useState<boolean>(true);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleSelect = () => {
    onSelectCategory(category.id, category.name);
  };

  const paddingLeft = `${level * 14 + 10}px`;

  return (
    <div className="select-none">
      <div
        onClick={handleSelect}
        style={{ paddingLeft }}
        className={`group flex items-center justify-between py-2 pr-3 my-0.5 rounded-xl text-xs font-medium cursor-pointer transition-all duration-200 ${
          isSelected
            ? 'bg-orange-500 text-white font-semibold shadow-md shadow-orange-500/20'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {hasChildren ? (
            <button
              onClick={handleToggle}
              className={`p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${
                isSelected ? 'text-white' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {expanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          ) : (
            <span className="w-3.5 inline-block" />
          )}

          {hasChildren ? (
            expanded ? (
              <FolderOpen className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-amber-500'}`} />
            ) : (
              <Folder className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-amber-500'}`} />
            )
          ) : (
            <Tag className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
          )}

          <span className="truncate">{category.name}</span>
        </div>

        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
            isSelected
              ? 'bg-white/20 text-white'
              : 'bg-slate-200/70 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
          }`}
          title={`Danh mục "${category.name}" hiện có ${category.productCount ?? 0} sản phẩm`}
        >
          {category.productCount ?? 0}
        </span>
      </div>

      {hasChildren && expanded && (
        <div className="relative before:absolute before:left-4 before:top-0 before:bottom-2 before:w-px before:bg-slate-200 dark:before:bg-slate-800">
          {category.children.map((child) => (
            <TreeNode
              key={child.id}
              category={child}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={onSelectCategory}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoryDirectoryTree({
  categoryTree,
  selectedCategoryId,
  onSelectCategory,
}: CategoryDirectoryTreeProps) {
  const isAllSelected = selectedCategoryId === null;

  return (
    <div className="space-y-1">
      {/* Root item: Tất cả danh mục */}
      <div
        onClick={() => onSelectCategory(null, null)}
        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
          isAllSelected
            ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
        }`}
      >
        <Layers className={`w-4 h-4 ${isAllSelected ? 'text-white' : 'text-orange-500'}`} />
        <span>Tất cả danh mục</span>
      </div>

      {/* Category Tree Nodes */}
      <div className="pt-1">
        {categoryTree.map((cat) => (
          <TreeNode
            key={cat.id}
            category={cat}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={onSelectCategory}
            level={0}
          />
        ))}
      </div>
    </div>
  );
}
