'use client';

import { useState, useEffect, useCallback } from 'react';
import { Contact, ContactStatus } from '@/types/contact';
import { contactController } from '@/controllers/contact-controller';

export function useStaffContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Pagination, Filter & Sort States
  const [page, setPage] = useState<number>(0);
  const [pageSize] = useState<number>(10);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [keyword, setKeyword] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortDir, setSortDir] = useState<'DESC' | 'ASC'>('DESC');

  // Modal & Reply States
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState<boolean>(false);
  const [replyMessage, setReplyMessage] = useState<string>('');
  const [replyLoading, setReplyLoading] = useState<boolean>(false);
  const [replyError, setReplyError] = useState<string>('');

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = statusFilter === 'ALL' ? undefined : (statusFilter as ContactStatus);
      const res = await contactController.getContacts(
        keyword.trim() || undefined,
        statusParam,
        page,
        pageSize,
        'createdAt',
        sortDir
      );

      if (res.data) {
        setContacts(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch {
      // Handled via API Client Toast
    } finally {
      setLoading(false);
    }
  }, [keyword, statusFilter, page, pageSize, sortDir]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleOpenReplyModal = useCallback((contact: Contact) => {
    setSelectedContact(contact);
    setReplyMessage(contact.replyMessage || '');
    setReplyError('');
    setIsReplyModalOpen(true);
  }, []);

  const handleCloseReplyModal = useCallback(() => {
    setIsReplyModalOpen(false);
    setSelectedContact(null);
    setReplyMessage('');
    setReplyError('');
  }, []);

  const handleSendReply = useCallback(async () => {
    if (!selectedContact) return;

    const cleanReply = replyMessage ? replyMessage.trim() : '';
    // Strip empty HTML tags from RichTextEditor like <p><br></p>
    const strippedText = cleanReply.replace(/<[^>]*>/g, '').trim();

    if (!strippedText) {
      setReplyError('Vui lòng nhập nội dung câu trả lời cho khách hàng.');
      return;
    }

    setReplyLoading(true);
    setReplyError('');

    try {
      const res = await contactController.replyContact(selectedContact.id, {
        replyMessage: cleanReply,
      });

      if (res.data) {
        handleCloseReplyModal();
        await fetchContacts();
      }
    } catch {
      setReplyError('Có lỗi xảy ra khi gửi email phản hồi. Vui lòng thử lại.');
    } finally {
      setReplyLoading(false);
    }
  }, [selectedContact, replyMessage, handleCloseReplyModal, fetchContacts]);

  return {
    contacts,
    loading,
    page,
    setPage,
    pageSize,
    totalElements,
    keyword,
    setKeyword,
    statusFilter,
    setStatusFilter,
    sortDir,
    setSortDir,
    selectedContact,
    isReplyModalOpen,
    replyMessage,
    setReplyMessage,
    replyLoading,
    replyError,
    openReplyModal: handleOpenReplyModal,
    closeReplyModal: handleCloseReplyModal,
    handleSendReply,
    refreshList: fetchContacts,
  };
}
