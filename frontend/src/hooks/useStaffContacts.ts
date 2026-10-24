import { useState, useEffect, useCallback, useRef } from "react";
import { Contact, ContactStatus } from "@/types/contact";
import { contactController } from "@/controllers/contact-controller";
import { toast } from "sonner";

export function useStaffContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Pagination, Filter & Sort States
  const [page, setPage] = useState<number>(0);
  const [pageSize] = useState<number>(10);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [keyword, setKeyword] = useState<string>("");

  // Debounce 400ms cho từ khóa tìm kiếm liên hệ khách hàng
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  // Quản lý AbortController để hủy request cũ khi thay đổi từ khóa / bộ lọc
  const abortControllerRef = useRef<AbortController | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortDir, setSortDir] = useState<"DESC" | "ASC">("DESC");

  // Modal & Reply States
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState<boolean>(false);
  const [replyMessage, setReplyMessage] = useState<string>("");
  const [replyLoading, setReplyLoading] = useState<boolean>(false);
  const [replyError, setReplyError] = useState<string>("");

  const fetchContacts = useCallback(async () => {
    // 1. Hủy request đang bay trước đó để chống Race Condition
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    try {
      const statusParam =
        statusFilter === "ALL" ? undefined : (statusFilter as ContactStatus);
      const res = await contactController.getContacts(
        debouncedKeyword.trim() || undefined,
        statusParam,
        page,
        pageSize,
        "createdAt",
        sortDir,
        { signal: controller.signal }
      );

      if (res.data) {
        setContacts(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err: unknown) {
      if (err instanceof Error && (err.name === 'AbortError' || err.name === 'CanceledError')) {
        return; // Bỏ qua lỗi hủy request
      }
      // Handled via API Client Toast
    } finally {
      setLoading(false);
    }
  }, [debouncedKeyword, statusFilter, page, pageSize, sortDir]);

  useEffect(() => {
    fetchContacts();
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchContacts]);

  const handleOpenReplyModal = useCallback((contact: Contact) => {
    setSelectedContact(contact);
    setReplyMessage(contact.replyMessage || "");
    setReplyError("");
    setIsReplyModalOpen(true);
  }, []);

  const handleCloseReplyModal = useCallback(() => {
    setIsReplyModalOpen(false);
    setSelectedContact(null);
    setReplyMessage("");
    setReplyError("");
  }, []);

  const handleReplyMessageChange = useCallback((val: string) => {
    setReplyMessage(val);
    setReplyError("");
  }, []);

  const handleSendReply = useCallback(async () => {
    if (!selectedContact) return;

    const cleanReply = replyMessage ? replyMessage.trim() : "";
    // Strip empty HTML tags from RichTextEditor like <p><br></p>, &nbsp;
    const strippedText = cleanReply
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/gi, " ")
      .trim();

    // Detect if content contains inline image tags (<img src=...)
    const hasImage = /<img\s+[^>]*src=/i.test(cleanReply);

    if (!strippedText && !hasImage) {
      const msg =
        "Vui lòng nhập nội dung câu trả lời hoặc chèn hình ảnh cho khách hàng.";
      setReplyError(msg);
      // toast.error(msg);
      return;
    }

    setReplyLoading(true);
    setReplyError("");

    try {
      const res = await contactController.replyContact(selectedContact.id, {
        replyMessage: cleanReply,
      });

      if (res.data) {
        // toast.success('Đã gửi email phản hồi cho khách hàng thành công!');
        handleCloseReplyModal();
        await fetchContacts();
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        "Có lỗi xảy ra khi gửi email phản hồi. Vui lòng thử lại.";
      setReplyError(errorMsg);
      // toast.error(errorMsg);
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
    setReplyMessage: handleReplyMessageChange,
    replyLoading,
    replyError,
    openReplyModal: handleOpenReplyModal,
    closeReplyModal: handleCloseReplyModal,
    handleSendReply,
    refreshList: fetchContacts,
  };
}
