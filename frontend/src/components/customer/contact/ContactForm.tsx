'use client';

import React from 'react';
import { CreateContactRequest } from '@/types/contact';
import { FormErrors } from '@/hooks/useCustomerContact';
import { User, Mail, Phone, MessageSquare, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ContactFormProps {
  formData: CreateContactRequest;
  errors: FormErrors;
  loading: boolean;
  submitSuccess: boolean;
  onChange: (field: keyof CreateContactRequest, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ContactForm({
  formData,
  errors,
  loading,
  submitSuccess,
  onChange,
  onSubmit,
}: ContactFormProps) {
  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-orange-500" />
          <span>Gửi Thắc Mắc & Góp Ý</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Vui lòng điền thông tin bên dưới, ban quản trị AP Sports sẽ phản hồi qua email của bạn trong thời gian sớm nhất.
        </p>
      </div>

      {submitSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-bold flex items-start gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong>Gửi liên hệ thành công!</strong>
            <p className="font-normal text-xs mt-0.5 text-emerald-700 dark:text-emerald-300/80">
              Cảm ơn bạn đã liên hệ với AP Sports. Chúng tôi đã nhận được thông tin và sẽ kiểm tra phản hồi qua email của bạn sớm nhất.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Name Field */}
          <div className="space-y-1.5">
            <label htmlFor="contact-name" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Họ và tên <span className="text-orange-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                id="contact-name"
                type="text"
                placeholder="Nguyễn Văn A"
                value={formData.name}
                onChange={(e) => onChange('name', e.target.value)}
                disabled={loading}
                className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.name
                    ? 'border-red-500 focus:ring-red-500/20'
                    : 'border-slate-300 dark:border-slate-700 focus:border-orange-500 focus:ring-orange-500/20'
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-[11px] font-bold text-red-500 flex items-center gap-1 animate-fade-in">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <label htmlFor="contact-email" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Địa chỉ Email <span className="text-orange-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                id="contact-email"
                type="email"
                placeholder="nguyenvana@gmail.com"
                value={formData.email}
                onChange={(e) => onChange('email', e.target.value)}
                disabled={loading}
                className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.email
                    ? 'border-red-500 focus:ring-red-500/20'
                    : 'border-slate-300 dark:border-slate-700 focus:border-orange-500 focus:ring-orange-500/20'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] font-bold text-red-500 flex items-center gap-1 animate-fade-in">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>
        </div>

        {/* Phone Field */}
        <div className="space-y-1.5">
          <label htmlFor="contact-phone" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Số điện thoại liên hệ <span className="text-slate-400 font-normal">(Không bắt buộc)</span>
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              id="contact-phone"
              type="tel"
              placeholder="0988 123 456"
              value={formData.phone}
              onChange={(e) => onChange('phone', e.target.value)}
              disabled={loading}
              className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                errors.phone
                  ? 'border-red-500 focus:ring-red-500/20'
                  : 'border-slate-300 dark:border-slate-700 focus:border-orange-500 focus:ring-orange-500/20'
              }`}
            />
          </div>
          {errors.phone && (
            <p className="text-[11px] font-bold text-red-500 flex items-center gap-1 animate-fade-in">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{errors.phone}</span>
            </p>
          )}
        </div>

        {/* Message Content Field */}
        <div className="space-y-1.5">
          <label htmlFor="contact-message" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Nội dung câu hỏi / ý kiến góp ý <span className="text-orange-500">*</span>
          </label>
          <textarea
            id="contact-message"
            rows={5}
            placeholder="Nhập chi tiết thắc mắc, tư vấn sản phẩm hoặc ý kiến đóng góp của bạn..."
            value={formData.message}
            onChange={(e) => onChange('message', e.target.value)}
            disabled={loading}
            className={`w-full p-3.5 text-xs sm:text-sm font-semibold rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
              errors.message
                ? 'border-red-500 focus:ring-red-500/20'
                : 'border-slate-300 dark:border-slate-700 focus:border-orange-500 focus:ring-orange-500/20'
            }`}
          />
          {errors.message && (
            <p className="text-[11px] font-bold text-red-500 flex items-center gap-1 animate-fade-in">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{errors.message}</span>
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            id="submit-contact-button"
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-95 disabled:opacity-60 disabled:active:scale-100 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Đang gửi thông tin liên hệ...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Gửi Thông Tin Liên Hệ</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
