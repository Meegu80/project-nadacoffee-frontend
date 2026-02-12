import React, { useState, useEffect } from 'react';
import {
  User, CheckCircle, ChevronRight, MessageSquare, Clock, Trash2, Edit3, ArrowLeft, ImagePlus, Loader2, X, ChevronLeft, Filter
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useAlertStore } from '../../stores/useAlertStore';
import { motion, AnimatePresence } from 'framer-motion';
import WebEditor from '../../components/common/WebEditor';
import { inquiryApi, type InquiryType, type InquiryStatus, type InquiryItem } from '../../api/inquiry.api';
import { uploadImage } from '../../api/upload.api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { twMerge } from 'tailwind-merge';

const Contact: React.FC = () => {
  const { user } = useAuthStore();
  const { showAlert } = useAlertStore();
  const queryClient = useQueryClient();
  
  const [viewMode, setViewMode] = useState<'form' | 'list' | 'detail'>('form');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<InquiryType | ''>('');
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | ''>('');

  const [formData, setFormData] = useState({
    type: 'COMPLIMENT' as InquiryType,
    email: '',
    title: '',
    content: '',
    images: [] as string[],
    agree: false
  });

  // 1. 내 문의 목록 조회
  const { data: inquiryData, isLoading: isListLoading } = useQuery({
    queryKey: ['inquiries', 'me', page, typeFilter, statusFilter],
    queryFn: () => inquiryApi.getMyInquiries({ page, limit: 10, type: typeFilter || undefined, status: statusFilter || undefined }),
    enabled: !!user
  });

  // 2. 문의 상세 조회
  const { data: selectedInquiry, isLoading: isDetailLoading } = useQuery({
    queryKey: ['inquiries', 'detail', selectedId],
    queryFn: () => inquiryApi.getInquiryDetail(selectedId!),
    enabled: !!selectedId && viewMode === 'detail'
  });

  useEffect(() => {
    if (user?.email) setFormData(prev => ({ ...prev, email: user.email }));
  }, [user]);

  // 3. 문의 등록/수정 Mutation
  const submitMutation = useMutation({
    mutationFn: (body: any) => {
      if (editId) return inquiryApi.updateInquiry(editId, body);
      return inquiryApi.createInquiry(body);
    },
    onSuccess: () => {
      setIsSuccessModalOpen(true);
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      setFormData({ ...formData, title: '', content: '', images: [], agree: false });
      setEditId(null);
    },
    onError: (err: any) => showAlert(`처리 실패: ${err.response?.data?.message || err.message}`, "오류", "error")
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => inquiryApi.deleteInquiry(id),
    onSuccess: () => {
      showAlert("문의 내역이 삭제되었습니다.", "성공", "success");
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      setViewMode('list');
      setSelectedId(null);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agree) return showAlert("개인정보 수집 및 이용에 동의해주세요.", "알림", "warning");
    if (formData.content.length < 5) return showAlert("내용은 최소 5자 이상 입력해주세요.", "알림", "warning");
    submitMutation.mutate({ type: formData.type, title: formData.title, content: formData.content, images: formData.images });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadImage(file, 'inquiries');
      setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
    } catch (error) { showAlert("이미지 업로드에 실패했습니다.", "오류", "error"); } finally { setIsUploading(false); }
  };

  const handleEditStart = (inquiry: InquiryItem) => {
    setEditId(inquiry.id);
    setFormData({
      type: inquiry.type,
      email: user?.email || '',
      title: inquiry.title,
      content: inquiry.content,
      images: inquiry.images.map(img => img.url),
      agree: true
    });
    setViewMode('form');
  };

  const typeLabels: Record<InquiryType, string> = {
    COMPLIMENT: '칭찬', COMPLAINT: '불만', SUGGESTION: '제안', INQUIRY: '문의'
  };

  return (
    <div className="bg-white min-h-screen pt-10 pb-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between border-b-2 border-brand-dark pb-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-brand-dark italic uppercase tracking-tighter">Contact Us</h1>
            <p className="text-gray-500 mt-2 text-sm font-medium">나다커피를 이용하시면서 느끼신 불편사항이나 제안사항을 남겨주세요.</p>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button onClick={() => { setViewMode('form'); setEditId(null); setFormData({...formData, title: '', content: '', images: [], agree: false}); }} className={twMerge(["px-6 py-2 rounded-lg text-xs font-black transition-all", viewMode === 'form' ? 'bg-white text-brand-dark shadow-sm' : 'text-gray-400'])}>문의하기</button>
            <button onClick={() => setViewMode('list')} className={twMerge(["px-6 py-2 rounded-lg text-xs font-black transition-all", viewMode !== 'form' ? 'bg-white text-brand-dark shadow-sm' : 'text-gray-400'])}>내 문의내역</button>
          </div>
        </div>

        <AnimatePresence mode='wait'>
          {viewMode === 'form' ? (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl overflow-hidden">
                  <div className="p-8 md:p-12 space-y-10">
                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center border-b border-gray-50 pb-10">
                      <div className="flex items-center gap-4 bg-brand-dark text-white px-6 py-3 rounded-2xl shadow-lg">
                        <User size={20} className="text-brand-yellow" />
                        <span className="text-lg font-black tracking-tight">{user?.name || '로그인 필요'}</span>
                      </div>
                      <div className="flex-1 w-full space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">회신 받을 이메일</label>
                        <input type="email" required value={formData.email} className="w-full p-4 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 font-bold text-sm" readOnly />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">문의 구분 <span className="text-red-500">*</span></label>
                      <div className="flex flex-wrap gap-4">
                        {(Object.keys(typeLabels) as InquiryType[]).map((type) => (
                          <label key={type} className={twMerge(["flex-1 min-w-[100px] flex items-center justify-center py-4 rounded-2xl border-2 cursor-pointer transition-all font-black text-sm", formData.type === type ? 'border-brand-dark bg-brand-dark text-white shadow-lg' : 'border-gray-50 bg-gray-50 text-gray-400 hover:bg-gray-100'])}>
                            <input type="radio" name="type" className="hidden" checked={formData.type === type} onChange={() => setFormData({ ...formData, type })} />{typeLabels[type]}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">제목 <span className="text-red-500">*</span></label>
                      <input type="text" required value={formData.title} className="w-full p-4 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 font-bold text-sm" onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                    </div>
                    <div className="space-y-4">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">내용 <span className="text-red-500">*</span></label>
                      <WebEditor value={formData.content} onChange={(content) => setFormData({ ...formData, content })} placeholder="문의하실 내용을 상세히 입력해주세요." />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">이미지 첨부</label>
                      <div className="flex flex-wrap gap-4">
                        {formData.images.map((url, idx) => (
                          <div key={idx} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-gray-100 group">
                            <img src={url} className="w-full h-full object-cover" alt="upload" />
                            <button type="button" onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"><X size={20} /></button>
                          </div>
                        ))}
                        {formData.images.length < 5 && (
                          <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-brand-yellow hover:bg-brand-yellow/5 transition-all text-gray-400">
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                            {isUploading ? <Loader2 size={24} className="animate-spin" /> : <ImagePlus size={24} />}
                            <span className="text-[10px] font-black uppercase">Add Photo</span>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-[30px] p-8 border border-gray-100">
                  <h3 className="text-lg font-black text-brand-dark mb-4">개인정보 수집 및 이용 동의</h3>
                  <div className="w-full h-32 overflow-y-auto p-4 text-xs text-gray-400 leading-relaxed mb-6 bg-white rounded-2xl font-medium border border-gray-100">
                    (주)나다커피는 고객님의 문의사항에 대한 답변 및 안내를 위해 아래와 같이 개인정보를 수집 및 이용합니다.
                  </div>
                  <div className="flex justify-center">
                    <label className="flex items-center gap-3 cursor-pointer font-black text-brand-dark">
                      <input type="checkbox" required checked={formData.agree} onChange={(e) => setFormData({ ...formData, agree: e.target.checked })} className="w-6 h-6 accent-brand-dark rounded-lg" />
                      개인정보 수집 및 이용에 동의합니다.
                    </label>
                  </div>
                </div>
                <div className="flex justify-center gap-4">
                  <button type="button" onClick={() => setViewMode('list')} className="px-16 py-5 bg-gray-100 text-gray-400 font-black rounded-2xl hover:bg-gray-200 transition-all">취소</button>
                  <button type="submit" disabled={submitMutation.isPending} className="px-16 py-5 bg-brand-dark text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl disabled:opacity-50">{submitMutation.isPending ? '전송 중...' : editId ? '수정완료' : '작성완료'}</button>
                </div>
              </form>
            </motion.div>
          ) : viewMode === 'list' ? (
            <motion.div key="list" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="flex flex-wrap gap-4 bg-gray-50 p-6 rounded-[30px] border border-gray-100">
                <div className="flex items-center gap-2 mr-4"><Filter size={18} className="text-gray-400" /><span className="text-xs font-black text-gray-400 uppercase tracking-widest">Filters</span></div>
                <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value as any); setPage(1); }} className="bg-white border-none rounded-xl px-4 py-2 text-xs font-bold shadow-sm focus:ring-2 focus:ring-brand-yellow">
                  <option value="">모든 유형</option>
                  {Object.entries(typeLabels).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                </select>
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as any); setPage(1); }} className="bg-white border-none rounded-xl px-4 py-2 text-xs font-bold shadow-sm focus:ring-2 focus:ring-brand-yellow">
                  <option value="">모든 상태</option>
                  <option value="PENDING">확인중</option>
                  <option value="ANSWERED">답변완료</option>
                </select>
              </div>
              {isListLoading ? <div className="py-20 text-center italic text-gray-400">Loading...</div> : !inquiryData?.data || inquiryData.data.length === 0 ? (
                <div className="bg-white rounded-[40px] p-20 text-center border border-dashed border-gray-200"><MessageSquare size={48} className="mx-auto mb-4 text-gray-200" /><p className="text-gray-400 font-bold">문의 내역이 없습니다.</p></div>
              ) : (
                <>
                  <div className="space-y-6">
                    {inquiryData.data.map((item) => (
                      <div key={item.id} onClick={() => { setSelectedId(item.id); setViewMode('detail'); }} className="bg-white rounded-[30px] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-brand-dark group-hover:bg-brand-yellow transition-colors"><MessageSquare size={24} /></div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-[10px] font-black text-brand-yellow bg-brand-dark px-2 py-0.5 rounded-full uppercase tracking-widest">{typeLabels[item.type]}</span>
                              <span className="text-xs font-bold text-gray-300 flex items-center gap-1"><Clock size={12} /> {new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-xl font-black text-brand-dark">{item.title}</h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={twMerge(["px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest", item.status === 'ANSWERED' ? 'bg-green-50 text-green-500' : 'bg-gray-100 text-gray-400'])}>{item.status === 'ANSWERED' ? '답변완료' : '확인중'}</span>
                          <ChevronRight size={20} className="text-gray-200 group-hover:text-brand-dark transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                  {inquiryData.pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-12">
                      <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={20} /></button>
                      {Array.from({ length: inquiryData.pagination.totalPages }, (_, i) => i + 1).map(num => (
                        <button key={num} onClick={() => setPage(num)} className={twMerge(["w-8 h-8 rounded-lg font-black text-xs transition-all", page === num ? "bg-brand-dark text-white shadow-lg" : "text-gray-400 hover:bg-gray-50"])}>{num}</button>
                      ))}
                      <button onClick={() => setPage(p => Math.min(inquiryData.pagination.totalPages, p + 1))} disabled={page === inquiryData.pagination.totalPages} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={20} /></button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          ) : (
            <motion.div key="detail" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-8">
              <button onClick={() => setViewMode('list')} className="flex items-center gap-2 text-gray-400 hover:text-brand-dark font-bold transition-colors mb-4"><ArrowLeft size={20} /> 목록으로 돌아가기</button>
              {isDetailLoading ? <div className="py-20 text-center italic text-gray-400">Loading details...</div> : selectedInquiry ? (
                <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl overflow-hidden">
                  <div className="p-10 md:p-16 space-y-10">
                    <div className="flex items-center justify-between border-b border-gray-50 pb-8">
                      <div className="space-y-2">
                        <span className="text-xs font-black text-brand-yellow bg-brand-dark px-3 py-1 rounded-full uppercase tracking-widest">{typeLabels[selectedInquiry.type]}</span>
                        <h2 className="text-3xl md:text-4xl font-black text-brand-dark">{selectedInquiry.title}</h2>
                        <p className="text-sm text-gray-400 font-bold flex items-center gap-2 mt-2"><Clock size={14} /> 작성일: {new Date(selectedInquiry.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className={twMerge(["px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest", selectedInquiry.status === 'ANSWERED' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'])}>{selectedInquiry.status === 'ANSWERED' ? '답변완료' : '확인중'}</div>
                    </div>
                    <div className="prose prose-lg max-w-none text-gray-600 font-medium leading-relaxed min-h-[200px]" dangerouslySetInnerHTML={{ __html: selectedInquiry.content }} />
                    {selectedInquiry.images?.length > 0 && (
                      <div className="flex gap-4 overflow-x-auto pb-4">
                        {selectedInquiry.images.map((img: any, i: number) => (<img key={i} src={img.url || img} className="w-32 h-32 rounded-2xl object-cover border border-gray-100 shadow-sm" alt="inquiry" />))}
                      </div>
                    )}
                    {selectedInquiry.answer && (
                      <div className="bg-gray-50 rounded-[30px] p-10 border border-brand-yellow/20 relative">
                        <div className="absolute -top-4 left-10 bg-brand-yellow text-brand-dark px-4 py-1 rounded-full text-xs font-black shadow-sm">NADA ANSWER</div>
                        <div className="prose prose-sm max-w-none text-brand-dark font-bold leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedInquiry.answer }} />
                      </div>
                    )}
                    <div className="pt-10 border-t border-gray-50 flex justify-end gap-4">
                      {/* [수정] 답변 전까지만 수정 버튼 노출 */}
                      {selectedInquiry.status === 'PENDING' && (
                        <button onClick={() => handleEditStart(selectedInquiry)} className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 font-black rounded-xl hover:bg-gray-200 transition-all"><Edit3 size={18} /> 수정하기</button>
                      )}
                      <button onClick={() => { if(window.confirm('삭제하시겠습니까?')) deleteMutation.mutate(selectedInquiry.id) }} className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-500 font-black rounded-xl hover:bg-red-100 transition-all"><Trash2 size={18} /> 삭제하기</button>
                    </div>
                  </div>
                </div>
              ) : <div className="py-20 text-center text-gray-400 font-bold">상세 정보를 불러올 수 없습니다.</div>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isSuccessModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white w-full max-w-sm rounded-[40px] overflow-hidden shadow-2xl text-center p-10">
              <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={48} /></div>
              <h2 className="text-2xl font-black text-brand-dark mb-2">{editId ? '수정 완료!' : '접수 완료!'}</h2>
              <p className="text-gray-500 font-medium mb-8">고객님의 소중한 의견이<br />정상적으로 {editId ? '수정' : '접수'}되었습니다.</p>
              <button onClick={() => { setIsSuccessModalOpen(false); setViewMode('list'); }} className="w-full py-4 bg-brand-dark text-white rounded-2xl font-black text-lg hover:bg-black transition-all shadow-xl">확인</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const NutritionItem = ({ label, value, unit }: any) => (
  <div className="flex flex-col"><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</span><div className="flex items-baseline gap-0.5"><span className="text-2xl font-black text-brand-dark">{value}</span><span className="text-xs font-bold text-gray-400">{unit}</span></div></div>
);

export default Contact;
