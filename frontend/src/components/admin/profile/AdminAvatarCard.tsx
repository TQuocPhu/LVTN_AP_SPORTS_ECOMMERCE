'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { Camera, Loader2, User } from 'lucide-react';

interface AdminAvatarCardProps {
  avatarUrl: string | null;
  name: string;
  roleName: string;
  updating: boolean;
  onAvatarSelect: (file: File) => void;
}

export default function AdminAvatarCard({
  avatarUrl,
  name,
  roleName,
  updating,
  onAvatarSelect,
}: AdminAvatarCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAvatarSelect(file);
    }
  };

  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Quản Trị Viên';
      case 'STAFF':
        return 'Nhân Viên Bán Hàng';
      case 'WAREHOUSE_MANAGER':
        return 'Quản Lý Kho';
      default:
        return role || 'Quản Trị';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        id="admin-avatar-input"
      />

      {/* Avatar Container with Hover Overlay */}
      <div className="relative group cursor-pointer mb-4" onClick={() => fileInputRef.current?.click()}>
        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-slate-100 shadow-inner bg-slate-100 flex items-center justify-center relative">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={name}
              fill
              className="object-cover"
              sizes="112px"
              priority
            />
          ) : (
            <User className="w-12 h-12 text-slate-400" />
          )}

          {/* Loading spinner overlay */}
          {updating && (
            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center rounded-full z-10">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
          )}
        </div>

        {/* Hover Camera Overlay Button */}
        <button
          type="button"
          disabled={updating}
          className="absolute bottom-0 right-0 bg-orange-600 hover:bg-orange-700 text-white p-2 rounded-full shadow-md transition-transform transform group-hover:scale-110 border-2 border-white"
          title="Đổi ảnh đại diện"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      <h3 className="text-lg font-bold text-slate-900">{name}</h3>
      <p className="text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200 mt-1">
        {getRoleDisplayName(roleName)}
      </p>

      <p className="text-xs text-slate-400 mt-3">
        Nhấp vào ảnh để đổi avatar (PNG, JPG, max 5MB)
      </p>
    </div>
  );
}
