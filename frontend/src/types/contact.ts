export type ContactStatus = 'pending' | 'replied';

export interface Contact {
  id: number;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: ContactStatus;
  replyMessage?: string;
  repliedByUserId?: number;
  repliedByName?: string;
  repliedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateContactRequest {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface ReplyContactRequest {
  replyMessage: string;
}
