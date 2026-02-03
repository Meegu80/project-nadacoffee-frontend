import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { 
  Bold, Italic, List, ListOrdered, ImageIcon, 
  Undo, Redo, Heading1, Heading2, Quote, User, CheckCircle, ChevronRight, MessageSquare, Clock, Trash2, Edit3, ArrowLeft
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';

// 에디터 툴바 컴포넌트
const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("이미지 크기는 2MB를 초과할 수 없습니다.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        editor.chain().focus().setImage({ src }).run();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-200 text-brand-dark' : 'text-gray-400'}`}><Bold size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-200 text-brand-dark' : 'text-gray-400'}`}><Italic size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 text-brand-dark' : 'text-gray-400'}`}><Heading1 size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 text-brand-dark' : 'text-gray-400'}`}><Heading2 size={18} /></button>
      <div className="w-[1px] h-6 bg-gray-200 mx-1 self-center" />
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-200 text-brand-dark' : 'text-gray-400'}`}><List size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-200 text-brand-dark' : 'text-gray-400'}`}><ListOrdered size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('blockquote') ? 'bg-gray-200 text-brand-dark' : 'text-gray-400'}`}><Quote size={18} /></button>
      <div className="w-[1px] h-6 bg-gray-200 mx-1 self-center" />
      <label className="p-2 rounded hover:bg-gray-200 text-gray-400 cursor-pointer">
        <ImageIcon size={18} /><input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
      </label>
      <div className="flex-1" />
      <button type="button" onClick={() => editor.chain().focus().undo().run()} className="p-2 rounded hover:bg-gray-200 text-gray-400"><Undo size={18} /></button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} className="p-2 rounded hover:bg-gray-200 text-gray-400"><Redo size={18} /></button>
    </div>
  );
};

const Contact: React.FC = () => {
  const { user } = useAuthStore();
  const [viewMode, setViewMode] = useState<'form' | 'list' | 'detail'>('form');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [editId, setEditId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    category: '칭찬',
    email: '',
    title: '',
    agree: false
  });

  const [inquiries, setInquiries] = useState([
    { id: 1, category: '문의', title: '배송은 언제쯤 오나요?', content: '<p>배송이 너무 늦어지고 있어요. 확인 부탁드립니다.</p>', date: '2026.01.28', status: '답변완료' },
    { id: 2, category: '칭찬', title: '커피 맛이 정말 일품입니다!', content: '<p>매일 아침 나다커피로 시작해요. 정말 맛있습니다!</p>', date: '2026.01.25', status: '확인중' },
  ]);

  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: { class: 'max-w-[400px] w-full rounded-xl shadow-lg my-6 mx-auto block border-4 border-white' },
      }),
    ],
    content: '',
  });

  // [복구] 모달 닫기 및 화면 전환 함수
  const handleModalClose = () => {
    setIsSuccessModalOpen(false);
    setViewMode('list');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agree) {
      alert("개인정보 수집 및 이용에 동의해주세요.");
      return;
    }

    const content = editor?.getHTML();
    if (!content || content === '<p></p>') {
      alert("내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editId) {
        setInquiries(inquiries.map(item => item.id === editId ? { ...item, ...formData, content } : item));
        alert("문의가 수정되었습니다.");
        setEditId(null);
        setViewMode('list');
      } else {
        setIsSuccessModalOpen(true);
        const newInquiry = {
          id: Date.now(),
          category: formData.category,
          title: formData.title,
          content: content,
          date: new Date().toLocaleDateString(),
          status: '확인중'
        };
        setInquiries([newInquiry, ...inquiries]);
      }
      setFormData({ ...formData, title: '', agree: false });
      editor?.commands.setContent('');
    } catch (error: any) {
      alert("오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('정말로 이 문의 내역을 삭제하시겠습니까?')) {
      setInquiries(inquiries.filter(item => item.id !== id));
      alert('삭제되었습니다.');
      setViewMode('list');
    }
  };

  const handleEditStart = (item: any) => {
    setEditId(item.id);
    setFormData({
      category: item.category,
      email: user?.email || '',
      title: item.title,
      agree: true
    });
    editor?.commands.setContent(item.content);
    setViewMode('form');
  };

  return (
    <div className="bg-white min-h-screen pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-4">
        
        <div className="flex items-center justify-between border-b-2 border-brand-dark pb-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-brand-dark italic uppercase tracking-tighter">Contact Us</h1>
            <p className="text-gray-500 mt-2 text-sm font-medium">나다커피를 이용하시면서 느끼신 불편사항이나 제안사항을 남겨주세요.</p>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button onClick={() => { setViewMode('form'); setEditId(null); }} className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${viewMode === 'form' ? 'bg-white text-brand-dark shadow-sm' : 'text-gray-400'}`}>문의하기</button>
            <button onClick={() => setViewMode('list')} className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${viewMode === 'list' || viewMode === 'detail' ? 'bg-white text-brand-dark shadow-sm' : 'text-gray-400'}`}>내 문의내역</button>
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
                        <input type="email" required value={formData.email} className="w-full p-4 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 font-bold text-sm" onChange={(e) => setFormData({...formData, email: e.target.value})} />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">문의 구분 <span className="text-red-500">*</span></label>
                      <div className="flex flex-wrap gap-4">
                        {['칭찬', '불만', '제안', '문의'].map((item) => (
                          <label key={item} className={`flex-1 min-w-[100px] flex items-center justify-center py-4 rounded-2xl border-2 cursor-pointer transition-all font-black text-sm ${formData.category === item ? 'border-brand-dark bg-brand-dark text-white shadow-lg' : 'border-gray-50 bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>
                            <input type="radio" name="category" className="hidden" checked={formData.category === item} onChange={() => setFormData({...formData, category: item})} />{item}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">제목 <span className="text-red-500">*</span></label>
                      <input type="text" required value={formData.title} className="w-full p-4 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-yellow/20 font-bold text-sm" onChange={(e) => setFormData({...formData, title: e.target.value})} />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">내용 <span className="text-red-500">*</span></label>
                      <div className="border border-gray-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-yellow/20 transition-all">
                        <MenuBar editor={editor} />
                        <div className="p-6 min-h-[400px] prose prose-sm max-w-none focus:outline-none"><EditorContent editor={editor} /></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-[30px] p-8 border border-gray-100">
                  <h3 className="text-lg font-black text-brand-dark mb-4">개인정보 수집 및 이용 동의</h3>
                  <div className="w-full h-32 overflow-y-auto p-4 text-xs text-gray-400 leading-relaxed mb-6 bg-white rounded-2xl font-medium border border-gray-100">
                    (주)나다커피는 고객님의 문의사항에 대한 답변 및 안내를 위해 아래와 같이 개인정보를 수집 및 이용합니다.<br/><br/>
                    1. 수집항목: 작성자명, 이메일, 연락처<br/>
                    2. 수집목적: 고객문의 접수 및 결과 회신<br/>
                    3. 보유기간: 목적 달성 후 즉시 파기<br/><br/>
                    고객님은 개인정보 수집 및 이용에 동의하지 않을 권리가 있으며, 동의 거부 시 문의 접수가 제한될 수 있습니다.
                  </div>
                  <div className="flex justify-center">
                    <label className="flex items-center gap-3 cursor-pointer font-black text-brand-dark">
                      <input type="checkbox" required checked={formData.agree} onChange={(e) => setFormData({...formData, agree: e.target.checked})} className="w-6 h-6 accent-brand-dark rounded-lg" />
                      개인정보 수집 및 이용에 동의합니다.
                    </label>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <button type="button" onClick={() => setViewMode('list')} className="px-16 py-5 bg-gray-100 text-gray-400 font-black rounded-2xl hover:bg-gray-200 transition-all">취소</button>
                  <button type="submit" disabled={isSubmitting} className="px-16 py-5 bg-brand-dark text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl disabled:opacity-50">{isSubmitting ? '전송 중...' : editId ? '수정완료' : '작성완료'}</button>
                </div>
              </form>
            </motion.div>
          ) : viewMode === 'list' ? (
            <motion.div key="list" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              {inquiries.map((item) => (
                <div key={item.id} onClick={() => { setSelectedInquiry(item); setViewMode('detail'); }} className="bg-white rounded-[30px] p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-brand-dark group-hover:bg-brand-yellow transition-colors"><MessageSquare size={24} /></div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-black text-brand-yellow bg-brand-dark px-2 py-0.5 rounded-full uppercase tracking-widest">{item.category}</span>
                        <span className="text-xs font-bold text-gray-300 flex items-center gap-1"><Clock size={12} /> {item.date}</span>
                      </div>
                      <h3 className="text-xl font-black text-brand-dark">{item.title}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${item.status === '답변완료' ? 'bg-green-50 text-green-500' : 'bg-gray-100 text-gray-400'}`}>{item.status}</span>
                    <ChevronRight size={20} className="text-gray-200 group-hover:text-brand-dark transition-colors" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div key="detail" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-8">
              <button onClick={() => setViewMode('list')} className="flex items-center gap-2 text-gray-400 hover:text-brand-dark font-bold transition-colors mb-4"><ArrowLeft size={20} /> 목록으로 돌아가기</button>
              <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl overflow-hidden">
                <div className="p-10 md:p-16 space-y-10">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-8">
                    <div className="space-y-2">
                      <span className="text-xs font-black text-brand-yellow bg-brand-dark px-3 py-1 rounded-full uppercase tracking-widest">{selectedInquiry.category}</span>
                      <h2 className="text-3xl md:text-4xl font-black text-brand-dark">{selectedInquiry.title}</h2>
                      <p className="text-sm text-gray-400 font-bold flex items-center gap-2 mt-2"><Clock size={14} /> 작성일: {selectedInquiry.date}</p>
                    </div>
                    <div className={`px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest ${selectedInquiry.status === '답변완료' ? 'bg-green-50 text-green-500' : 'bg-gray-50 text-gray-400'}`}>{selectedInquiry.status}</div>
                  </div>
                  <div className="prose prose-lg max-w-none text-gray-600 font-medium leading-relaxed min-h-[300px]" dangerouslySetInnerHTML={{ __html: selectedInquiry.content }} />
                  <div className="pt-10 border-t border-gray-50 flex justify-between items-center">
                    <div className="flex items-center gap-3 text-gray-400 font-bold text-sm"><User size={18} /> 작성자: {user?.name}</div>
                    <div className="flex gap-3">
                      <button onClick={() => handleEditStart(selectedInquiry)} className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-600 font-black rounded-xl hover:bg-gray-200 transition-all"><Edit3 size={18} /> 수정</button>
                      <button onClick={() => handleDelete(selectedInquiry.id)} className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-500 font-black rounded-xl hover:bg-red-100 transition-all"><Trash2 size={18} /> 삭제</button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 성공 모달 */}
      <AnimatePresence>
        {isSuccessModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white w-full max-w-sm rounded-[40px] overflow-hidden shadow-2xl text-center p-10">
              <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={48} /></div>
              <h2 className="text-2xl font-black text-brand-dark mb-2">접수 완료!</h2>
              <p className="text-gray-500 font-medium mb-8">고객님의 소중한 의견이<br/>정상적으로 접수되었습니다.</p>
              <button onClick={handleModalClose} className="w-full py-4 bg-brand-dark text-white rounded-2xl font-black text-lg hover:bg-black transition-all shadow-xl">확인</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .ProseMirror { min-height: 350px; outline: none; }
        .ProseMirror p.is-editor-empty:first-child::before { content: '문의하실 내용을 상세히 입력해주세요.'; float: left; color: #adb5bd; pointer-events: none; height: 0; }
        .ProseMirror img { max-width: 400px !important; height: auto !important; margin: 24px auto !important; display: block; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); }
      `}</style>
    </div>
  );
};

export default Contact;
