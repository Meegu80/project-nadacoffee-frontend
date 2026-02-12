import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MdArrowBack, MdSave, MdDelete, MdQuestionAnswer, MdPerson, MdAccessTime, MdEmail, MdCategory } from "react-icons/md";
import { adminInquiryApi } from "../../../api/admin.inquiry.api";
import WebEditor from "../../../components/common/WebEditor";
import { twMerge } from "tailwind-merge";
import { useAlertStore } from "../../../stores/useAlertStore"; // [추가]

function AdminInquiryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showAlert } = useAlertStore(); // [추가]
  const [answer, setAnswer] = useState("");

  const { data: inquiry, isLoading } = useQuery({
    queryKey: ["admin", "inquiries", id],
    queryFn: () => adminInquiryApi.getInquiry(Number(id)),
    enabled: !!id
  });

  useEffect(() => {
    if (inquiry?.answer) setAnswer(inquiry.answer);
  }, [inquiry]);

  const answerMutation = useMutation({
    mutationFn: () => adminInquiryApi.answerInquiry(Number(id), answer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "inquiries"] });
      // [수정] alert 대신 showAlert 모달 사용
      showAlert("답변이 성공적으로 등록되었습니다.", "성공", "success", [
        { label: "목록으로 이동", onClick: () => navigate("/admin/inquiries") },
        { label: "확인", onClick: () => {}, variant: "secondary" }
      ]);
    },
    onError: (err: any) => {
      showAlert(`답변 등록 실패: ${err.response?.data?.message || err.message}`, "오류", "error");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => adminInquiryApi.deleteInquiry(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "inquiries"] });
      showAlert("문의 내역이 삭제되었습니다.", "성공", "success");
      navigate("/admin/inquiries");
    }
  });

  if (isLoading) return <div className="py-20 text-center italic text-gray-400">Loading details...</div>;
  if (!inquiry) return <div className="py-20 text-center font-bold">문의를 찾을 수 없습니다.</div>;

  const typeLabels: any = { COMPLIMENT: '칭찬', COMPLAINT: '불만', SUGGESTION: '제안', INQUIRY: '문의' };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"><MdArrowBack size={24} /></button>
        <div>
          <h2 className="text-2xl font-black text-[#222222] tracking-tight uppercase italic">Inquiry Detail</h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">고객의 문의 내용을 확인하고 답변을 작성합니다.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-10 space-y-8">
              <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                <div className="flex items-center gap-3">
                  <span className="bg-brand-dark text-brand-yellow px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {typeLabels[inquiry.type] || inquiry.type}
                  </span>
                  <h3 className="text-2xl font-black text-brand-dark">{inquiry.title}</h3>
                </div>
                <span className={twMerge([
                  "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                  inquiry.status === 'ANSWERED' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                ])}>
                  {inquiry.status === 'ANSWERED' ? '답변완료' : '확인중'}
                </span>
              </div>
              <div className="prose prose-sm max-w-none text-gray-600 font-medium leading-relaxed min-h-[200px]" dangerouslySetInnerHTML={{ __html: inquiry.content }} />
              {inquiry.images && inquiry.images.length > 0 && (
                <div className="pt-6 border-t border-gray-50">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Attached Images</p>
                  <div className="flex gap-4 overflow-x-auto pb-4">
                    {inquiry.images.map((img: any) => (
                      <div key={img.id} className="relative group shrink-0">
                        <img src={img.url} className="w-40 h-40 rounded-3xl object-cover border border-gray-100 shadow-sm transition-transform group-hover:scale-105" alt="inquiry" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-10 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-8 bg-brand-yellow rounded-full"></div>
                <h3 className="text-lg font-black text-brand-dark">관리자 답변 작성</h3>
              </div>
              <WebEditor value={answer} onChange={setAnswer} placeholder="고객님께 전달할 답변을 입력하세요." />
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => { 
                  showAlert("정말로 이 문의를 삭제하시겠습니까?", "삭제 확인", "warning", [
                    { label: "삭제", onClick: () => deleteMutation.mutate() },
                    { label: "취소", onClick: () => {}, variant: "secondary" }
                  ]);
                }} className="px-8 py-4 bg-red-50 text-red-500 font-black rounded-2xl hover:bg-red-100 transition-all flex items-center gap-2 border border-red-100"><MdDelete size={20} /> 삭제</button>
                <button onClick={() => answerMutation.mutate()} disabled={answerMutation.isPending || !answer.trim()} className="px-12 py-4 bg-brand-dark text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl flex items-center gap-2 disabled:opacity-50"><MdSave size={20} /> {inquiry.answer ? '답변 수정' : '답변 등록'}</button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-brand-dark text-white p-10 rounded-[40px] shadow-2xl space-y-8 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-brand-yellow rounded-2xl flex items-center justify-center text-brand-dark shadow-lg"><MdPerson size={24} /></div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter">Customer</h3>
              </div>
              <div className="space-y-6">
                <div className="bg-white/5 p-5 rounded-3xl border border-white/10">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 flex items-center gap-1"><MdPerson size={12} /> 작성자</p>
                  <p className="text-lg font-bold text-white/90">{(inquiry as any).member?.name || '익명 고객'}</p>
                </div>
                <div className="bg-white/5 p-5 rounded-3xl border border-white/10">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 flex items-center gap-1"><MdEmail size={12} /> 연락처</p>
                  <p className="text-sm font-bold text-white/80">{(inquiry as any).member?.email || inquiry.email || '이메일 정보 없음'}</p>
                </div>
                <div className="bg-white/5 p-5 rounded-3xl border border-white/10">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 flex items-center gap-1"><MdAccessTime size={12} /> 작성일시</p>
                  <p className="text-sm font-bold text-white/80">{new Date(inquiry.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-brand-yellow/10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminInquiryDetail;
