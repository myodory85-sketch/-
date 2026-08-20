/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type WaitingStatus = 'WAITING' | 'INTERVIEWED' | 'PRE_USE' | 'APPROVED' | 'WITHDRAWN';

export interface Applicant {
  id: string;
  receiptNo: string;
  name: string;
  birthDate: string;
  age: number | '';
  gender: string;
  phone: string;
  guardianName: string;
  guardianPhone: string;
  address: string;
  serviceType: string;
  requestMemo: string;
  status: WaitingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IntakeInterview {
  id: string;
  applicantId: string;
  interviewer: string;
  interviewDate: string;
  applicantName: string;
  birthDate: string;
  age: number | '';
  phone: string;
  guardianName: string;
  guardianPhone: string;
  serviceType: string;
  disabilityInfo: string;
  familyInfo: string;
  dailySupport: string;
  needs: string;
  riskNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface PreUseLog {
  id: string;
  applicantId: string;
  applicantName: string;
  preUsePeriod: string;
  recordDate: string;
  attendance: string;
  activityMemo: string;
  supportMemo: string;
  nextPlan: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentReport {
  id: string;
  applicantId: string;
  applicantName: string;
  reportDate: string;
  interviewer: string;
  summary: string;
  strengths: string;
  supportNeeds: string;
  recommendation: string;
  extraNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface PdfDocument {
  id: string;
  applicantId: string;
  applicantName: string;
  fileName: string;
  category: string;
  uploadedAt: string;
}

export interface AgencySettings {
  staff: string[];
}

export const STATUS_LABELS: Record<WaitingStatus, string> = {
  WAITING: '대기',
  INTERVIEWED: '면접완료',
  PRE_USE: '예비이용',
  APPROVED: '이용확정',
  WITHDRAWN: '철회',
};
