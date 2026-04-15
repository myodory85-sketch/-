/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DocumentRecord, DocumentType } from '../types';
import { format } from 'date-fns';

const STORAGE_KEY = 'docuflow_records';

export const DocumentService = {
  getRecords(): DocumentRecord[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveRecord(record: DocumentRecord) {
    const records = this.getRecords();
    records.unshift(record);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  },

  generateDocNo(type: DocumentType): string {
    const records = this.getRecords();
    const year = format(new Date(), 'yyyy');
    const prefix = type === 'INTERNAL' ? 'INT' : 'EXT';
    
    // Filter records of the same type and year to get the next sequence number
    const sameTypeRecords = records.filter(r => r.type === type && r.docNo.includes(year));
    const nextSeq = (sameTypeRecords.length + 1).toString().padStart(3, '0');
    
    return `${prefix}-${year}-${nextSeq}`;
  },

  createInternalDraft(data: { title: string; drafter: string; date: string; approvalLine: string }): DocumentRecord {
    const docNo = this.generateDocNo('INTERNAL');
    const record: DocumentRecord = {
      id: crypto.randomUUID(),
      type: 'INTERNAL',
      docNo,
      title: data.title,
      drafter: data.drafter,
      date: data.date,
      approvalLine: data.approvalLine,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    this.saveRecord(record);
    return record;
  },

  createOfficialLetter(data: { title: string; recipient: string; date: string }): DocumentRecord {
    const docNo = this.generateDocNo('OFFICIAL');
    const record: DocumentRecord = {
      id: crypto.randomUUID(),
      type: 'OFFICIAL',
      docNo,
      title: data.title,
      recipient: data.recipient,
      date: data.date,
      status: 'ISSUED',
      createdAt: new Date().toISOString(),
    };
    this.saveRecord(record);
    return record;
  }
};
