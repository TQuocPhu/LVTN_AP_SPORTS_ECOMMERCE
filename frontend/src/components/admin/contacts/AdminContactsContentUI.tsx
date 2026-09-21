'use client';

import React from 'react';
import { useStaffContacts } from '@/hooks/useStaffContacts';
import { ContactTable } from './ContactTable';
import { ReplyContactModal } from './ReplyContactModal';
import { Mail, MessageSquare } from 'lucide-react';

export function AdminContactsContentUI() {
  const {
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
    openReplyModal,
    closeReplyModal,
    handleSendReply,
    refreshList,
  } = useStaffContacts();

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Mail className="w-8 h-8 text-orange-500" />
            <span>Quản Lý Thắc Mắc & Liên Hệ Khách Hàng</span>
          </h1>
          <p className="text-xs text-slate-500">
            Tiếp nhận câu hỏi, phản hồi thắc mắc khách hàng trực tiếp qua Email HTML chuyên nghiệp
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold">
          <MessageSquare className="w-4 h-4 text-orange-500" />
          <span>Tổng số yêu cầu: <strong>{totalElements}</strong></span>
        </div>
      </div>

      {/* Main Table */}
      <ContactTable
        contacts={contacts}
        loading={loading}
        totalElements={totalElements}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        keyword={keyword}
        onKeywordChange={setKeyword}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortDir={sortDir}
        onSortDirChange={setSortDir}
        onOpenReplyModal={openReplyModal}
        onRefresh={refreshList}
      />

      {/* Reply Modal */}
      <ReplyContactModal
        isOpen={isReplyModalOpen}
        onClose={closeReplyModal}
        contact={selectedContact}
        replyMessage={replyMessage}
        onReplyMessageChange={setReplyMessage}
        loading={replyLoading}
        error={replyError}
        onSubmit={handleSendReply}
      />
    </div>
  );
}
