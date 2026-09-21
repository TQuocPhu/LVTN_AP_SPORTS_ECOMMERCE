'use client';

import React from 'react';
import { useCustomerContact } from '@/hooks/useCustomerContact';
import { ContactInfoCards } from './ContactInfoCards';
import { ContactForm } from './ContactForm';
import { ContactMap } from './ContactMap';
import PageHeaderBanner from '@/components/ui/PageHeaderBanner';

export function CustomerContactContentUI() {
  const {
    formData,
    errors,
    loading,
    submitSuccess,
    handleChange,
    handleSubmit,
  } = useCustomerContact();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
      {/* Page Header Banner */}
      <PageHeaderBanner
        title="Liên Hệ & Hỗ Trợ AP Sports"
        subtitle="Chúng tôi luôn sẵn sàng lắng nghe, tư vấn và giải đáp mọi thắc mắc của bạn về các sản phẩm dụng cụ thể thao"
        breadcrumbs={[
          { label: 'Liên hệ', href: '/contact' },
        ]}
      />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 mt-8 relative z-10">
        {/* Top Section: 3 Contact Info Cards */}
        <ContactInfoCards />

        {/* Middle Section: Contact Form */}
        <ContactForm
          formData={formData}
          errors={errors}
          loading={loading}
          submitSuccess={submitSuccess}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />

        {/* Bottom Section: Location Map */}
        <ContactMap />
      </div>
    </div>
  );
}
