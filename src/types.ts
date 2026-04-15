/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DocumentType = 'INTERNAL' | 'OFFICIAL';

export type DocumentStatus = 'PENDING' | 'ISSUED' | 'APPROVED' | 'REJECTED';

export interface DocumentRecord {
  id: string;
  type: DocumentType;
  docNo: string;
  title: string;
  drafter?: string;
  recipient?: string;
  date: string;
  approvalLine?: string;
  status: DocumentStatus;
  createdAt: string;
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  INTERNAL: '내부결제',
  OFFICIAL: '공문',
};

export const STATUS_LABELS: Record<DocumentStatus, string> = {
  PENDING: '승인대기',
  ISSUED: '발행완료',
  APPROVED: '승인완료',
  REJECTED: '반려됨',
};
