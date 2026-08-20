/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { LayoutDashboard, ClipboardList, FileText, Search, Settings, Trash2, Users, Menu } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { WaitingListService, calculateAge } from '@/services/waitingListService';
import { Applicant, AssessmentReport, IntakeInterview, PreUseLog, STATUS_LABELS } from '@/types';

type Tab = 'dashboard' | 'application' | 'intake' | 'preuse' | 'assessment' | 'search' | 'settings';

type Store = ReturnType<typeof WaitingListService.getStore>;

const today = () => format(new Date(), 'yyyy-MM-dd');
const emptyApplicant = (): Omit<Applicant, 'id' | 'age' | 'createdAt' | 'updatedAt'> & { id?: string } => ({
  receiptNo: WaitingListService.generateReceiptNo(),
  name: '',
  birthDate: '',
  gender: '',
  phone: '',
  guardianName: '',
  guardianPhone: '',
  address: '',
  serviceType: '',
  requestMemo: '',
  status: 'WAITING',
});

const pdfExamples = ['홍길동_개인정보동의서.pdf', '홍길동_예비이용기간확인서.pdf', '홍길동_복지카드사본.pdf'];

export default function App() {
  const [store, setStore] = useState<Store>(WaitingListService.getStore());
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [applicantForm, setApplicantForm] = useState(emptyApplicant());
  const [selectedApplicantId, setSelectedApplicantId] = useState('');
  const [query, setQuery] = useState('');
  const [staffText, setStaffText] = useState(store.settings.staff.join('\n'));
  const [pdfCategory, setPdfCategory] = useState('개인정보동의서');

  const selectedApplicant = store.applicants.find((item) => item.id === selectedApplicantId);
  const latestIntake = [...store.intakes].find((item) => item.applicantId === selectedApplicantId);

  const [intakeForm, setIntakeForm] = useState<Omit<IntakeInterview, 'id' | 'createdAt' | 'updatedAt'>>({
    applicantId: '', interviewer: '', interviewDate: today(), applicantName: '', birthDate: '', age: '', phone: '', guardianName: '', guardianPhone: '', serviceType: '', disabilityInfo: '', familyInfo: '', dailySupport: '', needs: '', riskNotes: '',
  });
  const [preUseForm, setPreUseForm] = useState<Omit<PreUseLog, 'id' | 'createdAt' | 'updatedAt'>>({
    applicantId: '', applicantName: '', preUsePeriod: '', recordDate: today(), attendance: '참석', activityMemo: '', supportMemo: '', nextPlan: '',
  });
  const [reportForm, setReportForm] = useState<Omit<AssessmentReport, 'id' | 'createdAt' | 'updatedAt'>>({
    applicantId: '', applicantName: '', reportDate: today(), interviewer: '', summary: '', strengths: '', supportNeeds: '', recommendation: '', extraNotes: '',
  });

  const refresh = () => setStore(WaitingListService.getStore());

  useEffect(() => {
    if (!selectedApplicant) return;
    setIntakeForm((prev) => ({ ...prev, applicantId: selectedApplicant.id, applicantName: selectedApplicant.name, birthDate: selectedApplicant.birthDate, age: selectedApplicant.age, phone: selectedApplicant.phone, guardianName: selectedApplicant.guardianName, guardianPhone: selectedApplicant.guardianPhone, serviceType: selectedApplicant.serviceType }));
    setPreUseForm((prev) => ({ ...prev, applicantId: selectedApplicant.id, applicantName: selectedApplicant.name }));
    setReportForm((prev) => ({ ...prev, applicantId: selectedApplicant.id, applicantName: selectedApplicant.name, interviewer: latestIntake?.interviewer || prev.interviewer, summary: latestIntake ? `${latestIntake.needs}\n${latestIntake.dailySupport}`.trim() : prev.summary, supportNeeds: latestIntake?.needs || prev.supportNeeds, extraNotes: latestIntake?.riskNotes || prev.extraNotes }));
  }, [selectedApplicantId, selectedApplicant, latestIntake]);

  const stats = useMemo(() => ({
    total: store.applicants.length,
    waiting: store.applicants.filter((item) => item.status === 'WAITING').length,
    preUse: store.applicants.filter((item) => item.status === 'PRE_USE').length,
    pdfs: store.pdfs.length,
  }), [store]);

  const searchRows = store.applicants.filter((applicant) => {
    const pdfNames = store.pdfs.filter((pdf) => pdf.applicantId === applicant.id).map((pdf) => pdf.fileName).join(' ');
    const text = `${applicant.receiptNo} ${applicant.name} ${applicant.phone} ${applicant.serviceType} ${pdfNames}`.toLowerCase();
    return text.includes(query.toLowerCase());
  });

  const chooseApplicant = (id: string) => setSelectedApplicantId(id);

  const saveApplicant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantForm.name.trim() || !applicantForm.birthDate || !applicantForm.phone.trim()) {
      toast.error('이용인명, 생년월일, 연락처는 필수입니다.');
      return;
    }
    WaitingListService.saveApplicant(applicantForm);
    toast.success('이용인 신청서가 저장되었습니다.');
    setApplicantForm(emptyApplicant());
    refresh();
  };

  const deleteApplicant = () => {
    if (!applicantForm.id) return toast.error('삭제할 신청서를 먼저 선택해주세요.');
    if (!window.confirm('해당 이용인의 신청서, 면접지, 일지, 보고서, PDF 기록을 모두 삭제할까요?')) return;
    WaitingListService.deleteApplicant(applicantForm.id);
    setApplicantForm(emptyApplicant());
    setSelectedApplicantId('');
    refresh();
    toast.success('삭제되었습니다.');
  };

  const saveIntake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intakeForm.applicantId || !intakeForm.interviewer) return toast.error('면접 대상자와 면접자를 선택해주세요.');
    WaitingListService.saveIntake(intakeForm);
    refresh();
    toast.success('인테이크 면접지가 저장되었습니다.');
  };

  const savePreUse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!preUseForm.applicantId || !preUseForm.recordDate) return toast.error('대상자와 기록 날짜를 확인해주세요.');
    WaitingListService.savePreUseLog(preUseForm);
    refresh();
    toast.success('예비이용일지가 저장되었습니다.');
  };

  const saveReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportForm.applicantId) return toast.error('대상자를 선택해주세요.');
    WaitingListService.saveReport(reportForm);
    refresh();
    toast.success('사정보고서가 저장되었습니다.');
  };

  const uploadPdfs = (files: FileList | null) => {
    if (!selectedApplicantId) return toast.error('PDF를 연결할 대상자를 먼저 선택해주세요.');
    const selectedFiles = Array.from(files || []).filter((file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
    if (selectedFiles.length === 0) return toast.error('PDF 파일만 업로드할 수 있습니다.');
    WaitingListService.addPdf(selectedApplicantId, selectedFiles, pdfCategory);
    refresh();
    toast.success(`${selectedFiles.length}개 PDF 파일명이 등록되었습니다.`);
  };

  const NavItem = ({ id, icon: Icon, label }: { id: Tab; icon: React.ElementType; label: string }) => (
    <button onClick={() => { setActiveTab(id); setIsSidebarOpen(false); }} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition ${activeTab === id ? 'bg-blue-700 text-white shadow-lg shadow-blue-100' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'}`}>
      <Icon size={19} /><span className="font-medium">{label}</span>
    </button>
  );

  const ApplicantPicker = () => (
    <div className="space-y-2">
      <Label>대상자 선택</Label>
      <select className="min-h-11 w-full rounded-md border border-input bg-white px-3 text-sm" value={selectedApplicantId} onChange={(e) => chooseApplicant(e.target.value)}>
        <option value="">대상자를 선택하세요</option>
        {store.applicants.map((applicant) => <option key={applicant.id} value={applicant.id}>{applicant.receiptNo} · {applicant.name}</option>)}
      </select>
    </div>
  );

  return <div className="flex min-h-screen bg-slate-50 text-slate-950">
    <Toaster position="top-right" />
    <aside className={`fixed inset-y-0 left-0 z-50 w-72 border-r bg-white transition-transform lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex h-full flex-col p-6">
        <div className="mb-8 rounded-2xl bg-blue-700 p-4 text-white"><p className="text-xs opacity-80">개인정보 보호형</p><h1 className="text-xl font-bold">이용인 대기자관리</h1></div>
        <nav className="space-y-2">
          <NavItem id="dashboard" icon={LayoutDashboard} label="대시보드" />
          <NavItem id="application" icon={ClipboardList} label="이용인 신청서" />
          <NavItem id="intake" icon={Users} label="인테이크 면접지" />
          <NavItem id="preuse" icon={FileText} label="예비이용일지" />
          <NavItem id="assessment" icon={FileText} label="사정보고서" />
          <NavItem id="search" icon={Search} label="통합조회/PDF" />
          <NavItem id="settings" icon={Settings} label="기관설정" />
        </nav>
      </div>
    </aside>
    <main className="flex-1 overflow-hidden">
      <header className="sticky top-0 z-10 flex min-h-16 items-center justify-between border-b bg-white px-5">
        <button className="lg:hidden" onClick={() => setIsSidebarOpen((v) => !v)}><Menu /></button>
        <div><h2 className="text-lg font-bold">{({ dashboard:'대시보드', application:'이용인 신청서', intake:'인테이크 면접지', preuse:'예비이용일지', assessment:'사정보고서', search:'통합조회/PDF 보관함', settings:'기관설정' } as Record<Tab,string>)[activeTab]}</h2><p className="text-xs text-slate-500">민감정보는 권한이 있는 담당자만 열람하세요.</p></div>
      </header>
      <div className="h-[calc(100vh-4rem)] overflow-y-auto p-5 lg:p-8">
        {activeTab === 'dashboard' && <section className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card><CardHeader><CardDescription>전체 대기자</CardDescription><CardTitle className="text-3xl">{stats.total}</CardTitle></CardHeader></Card>
            <Card><CardHeader><CardDescription>대기</CardDescription><CardTitle className="text-3xl">{stats.waiting}</CardTitle></CardHeader></Card>
            <Card><CardHeader><CardDescription>예비이용</CardDescription><CardTitle className="text-3xl">{stats.preUse}</CardTitle></CardHeader></Card>
            <Card><CardHeader><CardDescription>보관 PDF</CardDescription><CardTitle className="text-3xl">{stats.pdfs}</CardTitle></CardHeader></Card>
          </div>
          <Card><CardHeader><CardTitle>빠른 업무</CardTitle><CardDescription>최근 접수 및 최근 PDF 리스트는 개인정보 노출을 줄이기 위해 대시보드에서 표시하지 않습니다.</CardDescription></CardHeader><CardContent className="grid gap-3 md:grid-cols-4"><Button onClick={() => setActiveTab('application')}>신청서 작성</Button><Button variant="outline" onClick={() => setActiveTab('intake')}>면접지 작성</Button><Button variant="outline" onClick={() => setActiveTab('search')}>통합조회</Button><Button variant="outline" onClick={() => setActiveTab('settings')}>종사자 등록</Button></CardContent></Card>
        </section>}

        {activeTab === 'application' && <form onSubmit={saveApplicant} className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <Card><CardHeader><CardTitle>이용인 신청서</CardTitle><CardDescription>접수번호는 {new Date().getFullYear()}-001 형식으로 자동 부과됩니다. 생년월일 입력 시 연령이 자동 계산됩니다.</CardDescription></CardHeader><CardContent className="grid gap-4 md:grid-cols-2">
            <div><Label>접수번호</Label><Input value={applicantForm.receiptNo} readOnly /></div>
            <div><Label>이용인명 *</Label><Input value={applicantForm.name} onChange={(e) => setApplicantForm({ ...applicantForm, name: e.target.value })} /></div>
            <div><Label>생년월일 *</Label><Input type="date" value={applicantForm.birthDate} onChange={(e) => setApplicantForm({ ...applicantForm, birthDate: e.target.value })} /></div>
            <div><Label>연령</Label><Input value={calculateAge(applicantForm.birthDate)} readOnly /></div>
            <div><Label>성별</Label><Input value={applicantForm.gender} onChange={(e) => setApplicantForm({ ...applicantForm, gender: e.target.value })} /></div>
            <div><Label>연락처 *</Label><Input value={applicantForm.phone} onChange={(e) => setApplicantForm({ ...applicantForm, phone: e.target.value })} /></div>
            <div><Label>보호자명</Label><Input value={applicantForm.guardianName} onChange={(e) => setApplicantForm({ ...applicantForm, guardianName: e.target.value })} /></div>
            <div><Label>보호자 연락처</Label><Input value={applicantForm.guardianPhone} onChange={(e) => setApplicantForm({ ...applicantForm, guardianPhone: e.target.value })} /></div>
            <div className="md:col-span-1"><Label>주소</Label><Input className="max-w-md" value={applicantForm.address} onChange={(e) => setApplicantForm({ ...applicantForm, address: e.target.value })} /></div>
            <div><Label>희망 서비스</Label><Input value={applicantForm.serviceType} onChange={(e) => setApplicantForm({ ...applicantForm, serviceType: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>신청 사유/상담 메모</Label><textarea className="min-h-28 w-full rounded-md border p-3" value={applicantForm.requestMemo} onChange={(e) => setApplicantForm({ ...applicantForm, requestMemo: e.target.value })} /></div>
            <div className="md:col-span-2 flex flex-col gap-2 sm:flex-row"><Button type="submit">저장</Button><Button type="button" variant="outline" onClick={() => setApplicantForm(emptyApplicant())}>새 신청서</Button><Button type="button" variant="destructive" onClick={deleteApplicant}><Trash2 size={16} className="mr-2" />삭제</Button></div>
          </CardContent></Card>
          <Card><CardHeader><CardTitle>신청서 선택</CardTitle><CardDescription>기존 신청서를 수정하거나 삭제할 수 있습니다.</CardDescription></CardHeader><CardContent className="space-y-2">{store.applicants.map((applicant) => <button type="button" key={applicant.id} className="w-full rounded-lg border p-3 text-left hover:bg-blue-50" onClick={() => { setApplicantForm(applicant); setSelectedApplicantId(applicant.id); }}><b>{applicant.receiptNo}</b> {applicant.name}<p className="text-xs text-slate-500">{applicant.phone}</p></button>)}</CardContent></Card>
        </form>}

        {activeTab === 'intake' && <form onSubmit={saveIntake} className="space-y-5"><Card><CardHeader><CardTitle>인테이크 면접지</CardTitle><CardDescription>대상자를 선택하면 신청서의 중복 정보가 자동으로 불러와집니다.</CardDescription></CardHeader><CardContent className="grid gap-4 md:grid-cols-2"><ApplicantPicker /><div><Label>면접자</Label><select className="min-h-11 w-full rounded-md border px-3" value={intakeForm.interviewer} onChange={(e) => setIntakeForm({ ...intakeForm, interviewer: e.target.value })}><option value="">면접자 선택</option>{store.settings.staff.map((staff) => <option key={staff}>{staff}</option>)}</select></div><div><Label>면접일</Label><Input type="date" value={intakeForm.interviewDate} onChange={(e) => setIntakeForm({ ...intakeForm, interviewDate: e.target.value })} /></div><div><Label>자동 불러온 기본정보</Label><Input value={`${intakeForm.applicantName} / ${intakeForm.age}세 / ${intakeForm.phone}`} readOnly /></div>{(['disabilityInfo','familyInfo','dailySupport','needs','riskNotes'] as const).map((key) => <div className="md:col-span-2" key={key}><Label>{({ disabilityInfo:'장애·질환 정보', familyInfo:'가족 및 지원체계', dailySupport:'일상생활 지원 필요', needs:'주요 욕구', riskNotes:'위험 및 특이사항' })[key]}</Label><textarea className="min-h-24 w-full rounded-md border p-3" value={intakeForm[key]} onChange={(e) => setIntakeForm({ ...intakeForm, [key]: e.target.value })} /></div>)}<Button>면접지 저장</Button></CardContent></Card></form>}

        {activeTab === 'preuse' && <form onSubmit={savePreUse} className="space-y-5"><Card><CardHeader><CardTitle>예비이용일지</CardTitle><CardDescription>예비이용기간은 기본정보에, 실제 기록 날짜는 별도 항목에 입력합니다.</CardDescription></CardHeader><CardContent className="grid gap-4 md:grid-cols-2"><ApplicantPicker /><div><Label>예비이용기간</Label><Input placeholder="예: 2026-09-01 ~ 2026-09-14" value={preUseForm.preUsePeriod} onChange={(e) => setPreUseForm({ ...preUseForm, preUsePeriod: e.target.value })} /></div><div><Label>기록 날짜</Label><Input type="date" value={preUseForm.recordDate} onChange={(e) => setPreUseForm({ ...preUseForm, recordDate: e.target.value })} /></div><div><Label>출결</Label><Input value={preUseForm.attendance} onChange={(e) => setPreUseForm({ ...preUseForm, attendance: e.target.value })} /></div>{(['activityMemo','supportMemo','nextPlan'] as const).map((key) => <div className="md:col-span-2" key={key}><Label>{({ activityMemo:'활동 내용', supportMemo:'지원 내용/관찰', nextPlan:'다음 계획' })[key]}</Label><textarea className="min-h-24 w-full rounded-md border p-3" value={preUseForm[key]} onChange={(e) => setPreUseForm({ ...preUseForm, [key]: e.target.value })} /></div>)}<Button>일지 저장</Button></CardContent></Card></form>}

        {activeTab === 'assessment' && <form onSubmit={saveReport} className="space-y-5"><Card><CardHeader><CardTitle>사정보고서</CardTitle><CardDescription>인테이크 면접지의 중복 내용은 자동 삽입되며, 추가 기입해도 기존 내용이 덮어쓰이지 않도록 편집 가능합니다.</CardDescription></CardHeader><CardContent className="grid gap-4 md:grid-cols-2"><ApplicantPicker /><div><Label>보고일</Label><Input type="date" value={reportForm.reportDate} onChange={(e) => setReportForm({ ...reportForm, reportDate: e.target.value })} /></div>{(['summary','strengths','supportNeeds','recommendation','extraNotes'] as const).map((key) => <div className="md:col-span-2" key={key}><Label>{({ summary:'종합 요약', strengths:'강점', supportNeeds:'지원 필요사항', recommendation:'판정 및 권고', extraNotes:'추가 메모' })[key]}</Label><textarea className="min-h-24 w-full rounded-md border p-3" value={reportForm[key]} onChange={(e) => setReportForm({ ...reportForm, [key]: e.target.value })} /></div>)}<Button>보고서 저장</Button></CardContent></Card></form>}

        {activeTab === 'search' && <section className="space-y-5"><Card><CardHeader><CardTitle>PDF 보관함</CardTitle><CardDescription>PDF 원본은 브라우저 저장소에 보관하지 않고 파일명 메타데이터만 기록합니다. 파일명 예시: {pdfExamples.join(', ')}</CardDescription></CardHeader><CardContent className="grid gap-4 md:grid-cols-3"><ApplicantPicker /><div><Label>문서 분류</Label><Input value={pdfCategory} onChange={(e) => setPdfCategory(e.target.value)} /></div><div><Label>PDF 업로드</Label><Input type="file" accept="application/pdf" multiple onChange={(e) => uploadPdfs(e.target.files)} /></div></CardContent></Card><Card><CardHeader><CardTitle>통합조회</CardTitle><CardDescription>이용인 정보와 실제 저장된 PDF 파일명까지 함께 검색합니다.</CardDescription></CardHeader><CardContent><Input className="mb-4" placeholder="이름, 접수번호, 연락처, 파일명 검색" value={query} onChange={(e) => setQuery(e.target.value)} /><Table><TableHeader><TableRow><TableHead>접수번호</TableHead><TableHead>이름</TableHead><TableHead>상태</TableHead><TableHead>PDF 파일명</TableHead></TableRow></TableHeader><TableBody>{searchRows.map((applicant) => <TableRow key={applicant.id}><TableCell>{applicant.receiptNo}</TableCell><TableCell>{applicant.name}</TableCell><TableCell><Badge>{STATUS_LABELS[applicant.status]}</Badge></TableCell><TableCell>{store.pdfs.filter((pdf) => pdf.applicantId === applicant.id).map((pdf) => pdf.fileName).join(', ') || '등록된 PDF 없음'}</TableCell></TableRow>)}</TableBody></Table></CardContent></Card></section>}

        {activeTab === 'settings' && <Card><CardHeader><CardTitle>기관설정</CardTitle><CardDescription>종사자를 줄바꿈으로 등록하면 인테이크 면접자의 선택 목록에 반영됩니다.</CardDescription></CardHeader><CardContent className="space-y-4"><textarea className="min-h-56 w-full rounded-md border p-3" value={staffText} onChange={(e) => setStaffText(e.target.value)} /><Button onClick={() => { WaitingListService.saveStaff(staffText.split('\n')); refresh(); toast.success('종사자 목록이 저장되었습니다.'); }}>종사자 저장</Button></CardContent></Card>}
      </div>
    </main>
  </div>;
}
