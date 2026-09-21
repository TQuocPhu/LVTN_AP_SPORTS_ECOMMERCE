'use client';

import { useState, useCallback } from 'react';
import { CreateContactRequest } from '@/types/contact';
import { contactController } from '@/controllers/contact-controller';

export interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

export function useCustomerContact() {
  const [formData, setFormData] = useState<CreateContactRequest>({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  const validate = (data: CreateContactRequest): FormErrors => {
    const errs: FormErrors = {};

    if (!data.name || !data.name.trim()) {
      errs.name = 'Vui lòng nhập họ và tên của bạn';
    }

    if (!data.email || !data.email.trim()) {
      errs.email = 'Vui lòng nhập địa chỉ email';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email.trim())) {
        errs.email = 'Địa chỉ email không đúng định dạng (VD: name@example.com)';
      }
    }

    if (data.phone && data.phone.trim()) {
      const phoneRegex = /^[0-9+()\s-]{8,15}$/;
      if (!phoneRegex.test(data.phone.trim())) {
        errs.phone = 'Số điện thoại không hợp lệ';
      }
    }

    if (!data.message || !data.message.trim()) {
      errs.message = 'Vui lòng nhập nội dung liên hệ';
    } else if (data.message.trim().length < 5) {
      errs.message = 'Nội dung liên hệ phải có ít nhất 5 ký tự';
    }

    return errs;
  };

  const handleChange = useCallback((field: keyof CreateContactRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setSubmitSuccess(false);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const res = await contactController.submitContact({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || undefined,
        message: formData.message.trim(),
      });

      if (res.data) {
        setSubmitSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: '',
        });
      }
    } catch {
      // Error handles via API Client Toast
    } finally {
      setLoading(false);
    }
  }, [formData]);

  return {
    formData,
    errors,
    loading,
    submitSuccess,
    handleChange,
    handleSubmit,
  };
}
