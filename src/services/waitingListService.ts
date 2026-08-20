/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Applicant, AssessmentReport, IntakeInterview, PdfDocument, PreUseLog, AgencySettings } from '@/types';

const STORAGE_KEY = 'waiting_list_records_v1';
const DEFAULT_STAFF = ['김상담', '이사회복지사', '박팀장'];

interface Store {
  applicants: Applicant[];
  intakes: IntakeInterview[];
  preUseLogs: PreUseLog[];
  reports: AssessmentReport[];
  pdfs: PdfDocument[];
  settings: AgencySettings;
}

const emptyStore = (): Store => ({
  applicants: [],
  intakes: [],
  preUseLogs: [],
  reports: [],
  pdfs: [],
  settings: { staff: DEFAULT_STAFF },
});

const readStore = (): Store => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return emptyStore();
    return { ...emptyStore(), ...JSON.parse(stored) };
  } catch {
    return emptyStore();
  }
};

const writeStore = (store: Store) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

const now = () => new Date().toISOString();

export const calculateAge = (birthDate: string): number | '' => {
  if (!birthDate) return '';
  const birth = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return '';
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age >= 0 ? age : '';
};

export const WaitingListService = {
  getStore: readStore,
  getApplicants: () => readStore().applicants,
  getSettings: () => readStore().settings,

  generateReceiptNo(year = new Date().getFullYear()): string {
    const prefix = `${year}-`;
    const maxSeq = readStore().applicants
      .map((applicant) => applicant.receiptNo)
      .filter((receiptNo) => receiptNo.startsWith(prefix))
      .map((receiptNo) => Number(receiptNo.replace(prefix, '')))
      .filter((seq) => Number.isFinite(seq))
      .reduce((max, seq) => Math.max(max, seq), 0);
    return `${year}-${String(maxSeq + 1).padStart(3, '0')}`;
  },

  saveApplicant(input: Omit<Applicant, 'id' | 'age' | 'createdAt' | 'updatedAt'> & { id?: string }): Applicant {
    const store = readStore();
    const existing = input.id ? store.applicants.find((item) => item.id === input.id) : undefined;
    const record: Applicant = {
      ...input,
      id: existing?.id || crypto.randomUUID(),
      age: calculateAge(input.birthDate),
      createdAt: existing?.createdAt || now(),
      updatedAt: now(),
    };
    store.applicants = existing
      ? store.applicants.map((item) => (item.id === record.id ? record : item))
      : [record, ...store.applicants];
    writeStore(store);
    return record;
  },

  deleteApplicant(id: string) {
    const store = readStore();
    store.applicants = store.applicants.filter((item) => item.id !== id);
    store.intakes = store.intakes.filter((item) => item.applicantId !== id);
    store.preUseLogs = store.preUseLogs.filter((item) => item.applicantId !== id);
    store.reports = store.reports.filter((item) => item.applicantId !== id);
    store.pdfs = store.pdfs.filter((item) => item.applicantId !== id);
    writeStore(store);
  },

  saveIntake(record: Omit<IntakeInterview, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) {
    const store = readStore();
    const existing = record.id ? store.intakes.find((item) => item.id === record.id) : undefined;
    const next = { ...record, id: existing?.id || crypto.randomUUID(), createdAt: existing?.createdAt || now(), updatedAt: now() };
    store.intakes = existing ? store.intakes.map((item) => (item.id === next.id ? next : item)) : [next, ...store.intakes];
    store.applicants = store.applicants.map((item) => item.id === record.applicantId ? { ...item, status: 'INTERVIEWED', updatedAt: now() } : item);
    writeStore(store);
    return next;
  },

  savePreUseLog(record: Omit<PreUseLog, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) {
    const store = readStore();
    const existing = record.id ? store.preUseLogs.find((item) => item.id === record.id) : undefined;
    const next = { ...record, id: existing?.id || crypto.randomUUID(), createdAt: existing?.createdAt || now(), updatedAt: now() };
    store.preUseLogs = existing ? store.preUseLogs.map((item) => (item.id === next.id ? next : item)) : [next, ...store.preUseLogs];
    store.applicants = store.applicants.map((item) => item.id === record.applicantId ? { ...item, status: 'PRE_USE', updatedAt: now() } : item);
    writeStore(store);
    return next;
  },

  saveReport(record: Omit<AssessmentReport, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) {
    const store = readStore();
    const existing = record.id ? store.reports.find((item) => item.id === record.id) : undefined;
    const next = { ...record, id: existing?.id || crypto.randomUUID(), createdAt: existing?.createdAt || now(), updatedAt: now() };
    store.reports = existing ? store.reports.map((item) => (item.id === next.id ? next : item)) : [next, ...store.reports];
    writeStore(store);
    return next;
  },

  addPdf(applicantId: string, files: File[], category: string) {
    const store = readStore();
    const applicant = store.applicants.find((item) => item.id === applicantId);
    if (!applicant) throw new Error('대상자를 먼저 선택해주세요.');
    const pdfs = files.map((file) => ({ id: crypto.randomUUID(), applicantId, applicantName: applicant.name, fileName: file.name, category, uploadedAt: now() }));
    store.pdfs = [...pdfs, ...store.pdfs];
    writeStore(store);
    return pdfs;
  },

  saveStaff(staff: string[]) {
    const store = readStore();
    store.settings.staff = Array.from(new Set(staff.map((item) => item.trim()).filter(Boolean)));
    writeStore(store);
    return store.settings;
  },
};
