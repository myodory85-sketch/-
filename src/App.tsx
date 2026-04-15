/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Send, 
  History, 
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DocumentService } from '@/services/documentService';
import { DocumentRecord, DOCUMENT_TYPE_LABELS, STATUS_LABELS } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Toaster, toast } from 'sonner';
import { format } from 'date-fns';

export default function App() {
  const [records, setRecords] = useState<DocumentRecord[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Form states
  const [internalForm, setInternalForm] = useState({ title: '', drafter: '', date: format(new Date(), 'yyyy-MM-dd'), approvalLine: '' });
  const [officialForm, setOfficialForm] = useState({ title: '', recipient: '', date: format(new Date(), 'yyyy-MM-dd') });

  useEffect(() => {
    setRecords(DocumentService.getRecords());
  }, []);

  const refreshRecords = () => {
    setRecords(DocumentService.getRecords());
  };

  const handleCreateInternal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalForm.title || !internalForm.drafter) {
      toast.error('제목과 기안자를 입력해주세요.');
      return;
    }
    const record = DocumentService.createInternalDraft(internalForm);
    toast.success(`내부결제가 등록되었습니다. 문서번호: ${record.docNo}`);
    setInternalForm({ title: '', drafter: '', date: format(new Date(), 'yyyy-MM-dd'), approvalLine: '' });
    refreshRecords();
    setActiveTab('history');
  };

  const handleCreateOfficial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!officialForm.title || !officialForm.recipient) {
      toast.error('제목과 수신처를 입력해주세요.');
      return;
    }
    const record = DocumentService.createOfficialLetter(officialForm);
    toast.success(`공문이 발행되었습니다. 문서번호: ${record.docNo}`);
    setOfficialForm({ title: '', recipient: '', date: format(new Date(), 'yyyy-MM-dd') });
    refreshRecords();
    setActiveTab('history');
  };

  const filteredRecords = records.filter(r => {
    const matchesSearch = 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.docNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.drafter && r.drafter.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.recipient && r.recipient.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: records.length,
    pending: records.filter(r => r.status === 'PENDING').length,
    issued: records.filter(r => r.status === 'ISSUED').length,
  };

  const NavItem = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 w-full text-left ${
        activeTab === id 
          ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-200' 
          : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans text-zinc-900">
      <Toaster position="top-right" />
      
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-zinc-200 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-10 px-2">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white font-bold italic">D</div>
            <h1 className="text-xl font-bold tracking-tight">DocuFlow</h1>
          </div>

          <nav className="space-y-2 flex-1">
            <NavItem id="dashboard" icon={LayoutDashboard} label="대시보드" />
            <NavItem id="internal" icon={FileText} label="내부결제 기안" />
            <NavItem id="official" icon={Send} label="공문 시행" />
            <NavItem id="history" icon={History} label="색인 목록" />
          </nav>

          <div className="mt-auto pt-6 border-t border-zinc-100">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 font-semibold">
                AD
              </div>
              <div>
                <p className="text-sm font-semibold">관리자</p>
                <p className="text-xs text-zinc-500">admin@docuflow.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-bottom border-zinc-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 hover:bg-zinc-100 rounded-md">
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-semibold">
              {activeTab === 'dashboard' && '대시보드'}
              {activeTab === 'internal' && '내부결제 기안'}
              {activeTab === 'official' && '공문 시행'}
              {activeTab === 'history' && '색인 목록'}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <Input 
                placeholder="문서 검색..." 
                className="pl-10 w-64 bg-zinc-50 border-zinc-200 focus:bg-white transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button size="sm" className="bg-zinc-900 hover:bg-zinc-800">
              <Plus size={16} className="mr-2" /> 새 문서
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border-none shadow-sm bg-white">
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-2">
                        <FileText size={14} /> 전체 문서
                      </CardDescription>
                      <CardTitle className="text-3xl font-bold">{stats.total}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="border-none shadow-sm bg-white">
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-2 text-amber-600">
                        <Clock size={14} /> 승인 대기
                      </CardDescription>
                      <CardTitle className="text-3xl font-bold">{stats.pending}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="border-none shadow-sm bg-white">
                    <CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-2 text-emerald-600">
                        <CheckCircle2 size={14} /> 발행 완료
                      </CardDescription>
                      <CardTitle className="text-3xl font-bold">{stats.issued}</CardTitle>
                    </CardHeader>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="border-none shadow-sm bg-white">
                    <CardHeader>
                      <CardTitle className="text-lg">최근 등록 문서</CardTitle>
                      <CardDescription>가장 최근에 생성된 5개의 문서입니다.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {records.slice(0, 5).map((record) => (
                          <div key={record.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-50 transition-colors border border-zinc-100">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${record.type === 'INTERNAL' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                {record.type === 'INTERNAL' ? <FileText size={18} /> : <Send size={18} />}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{record.title}</p>
                                <p className="text-xs text-zinc-500">{record.docNo} • {format(new Date(record.createdAt), 'MM-dd HH:mm')}</p>
                              </div>
                            </div>
                            <Badge variant={record.status === 'PENDING' ? 'outline' : 'secondary'} className="text-[10px]">
                              {STATUS_LABELS[record.status]}
                            </Badge>
                          </div>
                        ))}
                        {records.length === 0 && (
                          <div className="text-center py-10 text-zinc-400">
                            <AlertCircle className="mx-auto mb-2 opacity-20" size={40} />
                            <p>등록된 문서가 없습니다.</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-sm bg-white">
                    <CardHeader>
                      <CardTitle className="text-lg">빠른 실행</CardTitle>
                      <CardDescription>자주 사용하는 문서 양식을 바로 작성하세요.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <Button variant="outline" className="h-24 flex flex-col gap-2 border-dashed border-2 hover:border-zinc-900 hover:bg-zinc-50" onClick={() => setActiveTab('internal')}>
                        <FileText size={24} />
                        <span>내부결제 기안</span>
                      </Button>
                      <Button variant="outline" className="h-24 flex flex-col gap-2 border-dashed border-2 hover:border-zinc-900 hover:bg-zinc-50" onClick={() => setActiveTab('official')}>
                        <Send size={24} />
                        <span>공문 시행</span>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}

            {activeTab === 'internal' && (
              <motion.div
                key="internal"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl mx-auto"
              >
                <Card className="border-none shadow-md">
                  <CardHeader className="bg-zinc-900 text-white rounded-t-xl">
                    <CardTitle>내부결제 기안 작성</CardTitle>
                    <CardDescription className="text-zinc-400">내부 결제를 위한 기안서를 작성하고 번호를 생성합니다.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <form onSubmit={handleCreateInternal} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="title">문서 제목</Label>
                        <Input 
                          id="title" 
                          placeholder="예: 2024년 상반기 비품 구매 건" 
                          value={internalForm.title}
                          onChange={(e) => setInternalForm({ ...internalForm, title: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="drafter">기안자</Label>
                          <Input 
                            id="drafter" 
                            placeholder="성함 입력" 
                            value={internalForm.drafter}
                            onChange={(e) => setInternalForm({ ...internalForm, drafter: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="date">기안 일자</Label>
                          <Input 
                            id="date" 
                            type="date" 
                            value={internalForm.date}
                            onChange={(e) => setInternalForm({ ...internalForm, date: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="approvalLine">결제선 (선택)</Label>
                        <Input 
                          id="approvalLine" 
                          placeholder="예: 팀장 - 본부장 - 대표이사" 
                          value={internalForm.approvalLine}
                          onChange={(e) => setInternalForm({ ...internalForm, approvalLine: e.target.value })}
                        />
                      </div>
                      <div className="pt-4 flex gap-3">
                        <Button type="submit" className="flex-1 bg-zinc-900 py-6">승인 및 저장</Button>
                        <Button type="button" variant="outline" className="py-6" onClick={() => setActiveTab('dashboard')}>취소</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'official' && (
              <motion.div
                key="official"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl mx-auto"
              >
                <Card className="border-none shadow-md">
                  <CardHeader className="bg-zinc-900 text-white rounded-t-xl">
                    <CardTitle>공문 시행문 작성</CardTitle>
                    <CardDescription className="text-zinc-400">외부 기관 발송을 위한 공문을 작성하고 번호를 생성합니다.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <form onSubmit={handleCreateOfficial} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="off-title">공문 제목</Label>
                        <Input 
                          id="off-title" 
                          placeholder="예: 협력사 간담회 참석 요청의 건" 
                          value={officialForm.title}
                          onChange={(e) => setOfficialForm({ ...officialForm, title: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="recipient">수신처</Label>
                          <Input 
                            id="recipient" 
                            placeholder="기관명 또는 부서명" 
                            value={officialForm.recipient}
                            onChange={(e) => setOfficialForm({ ...officialForm, recipient: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="off-date">발행 일자</Label>
                          <Input 
                            id="off-date" 
                            type="date" 
                            value={officialForm.date}
                            onChange={(e) => setOfficialForm({ ...officialForm, date: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="pt-4 flex gap-3">
                        <Button type="submit" className="flex-1 bg-zinc-900 py-6">발행 및 저장</Button>
                        <Button type="button" variant="outline" className="py-6" onClick={() => setActiveTab('dashboard')}>취소</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">색인 목록</h3>
                    <p className="text-zinc-500">전체 문서의 이력을 확인하고 관리할 수 있습니다.</p>
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px] h-9 bg-white">
                        <SelectValue placeholder="상태 필터" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">전체 상태</SelectItem>
                        <SelectItem value="PENDING">승인대기</SelectItem>
                        <SelectItem value="ISSUED">발행완료</SelectItem>
                        <SelectItem value="APPROVED">승인완료</SelectItem>
                        <SelectItem value="REJECTED">반려됨</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={() => {
                      const csv = [
                        ['등록일시', '구분', '문서번호', '제목', '기안/수신', '날짜', '상태'].join(','),
                        ...records.map(r => [
                          r.createdAt,
                          DOCUMENT_TYPE_LABELS[r.type],
                          r.docNo,
                          `"${r.title}"`,
                          r.type === 'INTERNAL' ? r.drafter : r.recipient,
                          r.date,
                          STATUS_LABELS[r.status]
                        ].join(','))
                      ].join('\n');
                      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                      const link = document.createElement('a');
                      link.href = URL.createObjectURL(blob);
                      link.download = `docuflow_index_${format(new Date(), 'yyyyMMdd')}.csv`;
                      link.click();
                    }}>
                      CSV 내보내기
                    </Button>
                  </div>
                </div>

                <Card className="border-none shadow-sm overflow-hidden">
                  <Table>
                    <TableHeader className="bg-zinc-50">
                      <TableRow>
                        <TableHead className="w-[180px]">등록일시</TableHead>
                        <TableHead className="w-[100px]">구분</TableHead>
                        <TableHead className="w-[150px]">문서번호</TableHead>
                        <TableHead>제목</TableHead>
                        <TableHead className="w-[150px]">기안/수신</TableHead>
                        <TableHead className="w-[120px]">날짜</TableHead>
                        <TableHead className="w-[100px] text-right">상태</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.map((record) => (
                        <TableRow key={record.id} className="hover:bg-zinc-50/50 transition-colors">
                          <TableCell className="text-xs text-zinc-500 font-mono">
                            {format(new Date(record.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px] font-normal">
                              {DOCUMENT_TYPE_LABELS[record.type]}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono font-medium text-xs">
                            {record.docNo}
                          </TableCell>
                          <TableCell className="font-medium">
                            {record.title}
                          </TableCell>
                          <TableCell className="text-sm">
                            {record.type === 'INTERNAL' ? record.drafter : record.recipient}
                          </TableCell>
                          <TableCell className="text-sm text-zinc-500">
                            {record.date}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge 
                              className={`text-[10px] ${
                                record.status === 'PENDING' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' : 
                                record.status === 'ISSUED' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' :
                                'bg-zinc-100 text-zinc-700 hover:bg-zinc-100'
                              }`}
                            >
                              {STATUS_LABELS[record.status]}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredRecords.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="h-64 text-center text-zinc-400">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <Search size={32} className="opacity-20" />
                              <p>검색 결과가 없습니다.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
