'use client';

import React from 'react';
import { useStaffSupportChat } from '@/hooks/useStaffSupportChat';
import SupportQueueListUI from '@/components/admin/support-chat/SupportQueueListUI';
import SupportChatRoomUI from '@/components/admin/support-chat/SupportChatRoomUI';
import SupportCustomerDetailUI from '@/components/admin/support-chat/SupportCustomerDetailUI';
import ReportCustomerModalUI from '@/components/admin/support-chat/ReportCustomerModalUI';
import ResolveConversationModalUI from '@/components/admin/support-chat/ResolveConversationModalUI';
import { ShieldAlert, Loader2 } from 'lucide-react';

export default function AdminSupportChatPage() {
  const {
    user,
    // Hàng đợi & ca
    queueTab,
    setQueueTab,
    waitingQueue,
    myConversations,
    historyConversations,
    activeConversation,
    messages,
    isLoadingQueue,
    isLoadingMessages,
    isAccepting,
    isResolving,
    errorMessage,
    selectConversation,
    acceptConversation,
    resolveConversation,
    refreshQueue,
    // Chat input & image upload
    chatInputText,
    setChatInputText,
    previewImageModalUrl,
    setPreviewImageModalUrl,
    selectedImagePreview,
    isSending,
    isUploadingImage,
    messagesEndRef,
    handleSelectImage,
    clearSelectedImage,
    handleSendChatMessage,
    // Modal Báo cáo vi phạm
    isReportModalOpen,
    isReporting,
    reportReason,
    setReportReason,
    reportFiles,
    reportPreviews,
    openReportModal,
    closeReportModal,
    handleReportFileChange,
    removeReportFile,
    handleReportSubmit,
    handleQuickReport,
    revealedMessageIds,
    toggleRevealOriginalContent,
    // Modal Hoàn tất ca (Thay cho window.confirm)
    isResolveModalOpen,
    openResolveModal,
    closeResolveModal,
    // AI Smart Reply (Agent 5)
    aiSuggestions,
    isLoadingAiSuggestions,
    handleFetchAiSuggestions,
    handleApplyAiSuggestion,
  } = useStaffSupportChat();

  // Kiểm tra quyền SUPPORT_LIVE_CHAT hoặc ADMIN
  const hasAccess =
    user?.roleName === 'ADMIN' ||
    (user?.permissions && user.permissions.includes('SUPPORT_LIVE_CHAT'));

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 text-slate-600">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500 mr-2" />
        <span>Đang kiểm tra quyền truy cập...</span>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 text-center space-y-3">
        <ShieldAlert className="w-12 h-12 text-red-500" />
        <h3 className="font-bold text-base text-slate-900">Không Có Quyền Truy Cập</h3>
        <p className="text-xs text-slate-500 max-w-md">
          Tài khoản của bạn chưa được cấp quyền &ldquo;SUPPORT_LIVE_CHAT&rdquo; để phản hồi trực tiếp khách hàng. Vui lòng liên hệ Quản trị viên hệ thống để được phân quyền.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-50 text-slate-800">
      {/* CỘT 1: HÀNG ĐỢI & CA ĐANG PHỤ TRÁCH (Pure Presentation) */}
      <SupportQueueListUI
        tab={queueTab}
        waitingQueue={waitingQueue}
        myConversations={myConversations}
        historyConversations={historyConversations}
        activeConversation={activeConversation}
        isLoading={isLoadingQueue}
        isAccepting={isAccepting}
        onTabChange={setQueueTab}
        onSelect={selectConversation}
        onAccept={acceptConversation}
        onRefresh={refreshQueue}
      />

      {/* CỘT 2: PHÒNG CHAT TRỰC TUYẾN (Pure Presentation) */}
      <SupportChatRoomUI
        conversation={activeConversation}
        messages={messages}
        inputText={chatInputText}
        previewModalImg={previewImageModalUrl}
        isLoadingMessages={isLoadingMessages}
        isSending={isSending}
        isUploadingImage={isUploadingImage}
        isResolving={isResolving}
        selectedImagePreview={selectedImagePreview}
        messagesEndRef={messagesEndRef}
        aiSuggestions={aiSuggestions}
        isLoadingAiSuggestions={isLoadingAiSuggestions}
        onFetchAiSuggestions={handleFetchAiSuggestions}
        onApplyAiSuggestion={handleApplyAiSuggestion}
        onInputChange={(e) => setChatInputText(e.target.value)}
        onOpenPreviewModal={(url) => setPreviewImageModalUrl(url)}
        onClosePreviewModal={() => setPreviewImageModalUrl(null)}
        onSelectImage={handleSelectImage}
        onClearImage={clearSelectedImage}
        onSubmit={handleSendChatMessage}
        onOpenResolveModal={openResolveModal}
        onOpenReportModal={openReportModal}
        revealedMessageIds={revealedMessageIds}
        onToggleRevealOriginalContent={toggleRevealOriginalContent}
        onQuickReport={handleQuickReport}
      />

      {/* CỘT 3: THÔNG TIN KHÁCH HÀNG & ĐƠN HÀNG (Pure Presentation) */}
      <SupportCustomerDetailUI conversation={activeConversation} />

      {/* MODAL BÁO CÁO VI PHẠM (Pure Presentation) */}
      <ReportCustomerModalUI
        isOpen={isReportModalOpen}
        isReporting={isReporting}
        customerName={activeConversation?.customerName || 'Khách hàng'}
        reason={reportReason}
        files={reportFiles}
        previews={reportPreviews}
        errorMessage={errorMessage}
        onReasonChange={(e) => setReportReason(e.target.value)}
        onQuickReasonSelect={(preset) => setReportReason(preset)}
        onFileChange={handleReportFileChange}
        onRemoveFile={removeReportFile}
        onClose={closeReportModal}
        onSubmit={handleReportSubmit}
      />

      {/* MODAL XÁC NHẬN HOÀN TẤT CA TƯ VẤN (Pure Presentation) */}
      <ResolveConversationModalUI
        isOpen={isResolveModalOpen}
        isResolving={isResolving}
        conversationId={activeConversation?.id}
        customerName={activeConversation?.customerName}
        onClose={closeResolveModal}
        onConfirm={resolveConversation}
      />
    </div>
  );
}
