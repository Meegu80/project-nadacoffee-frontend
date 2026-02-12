import { useState } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { MdSearch, MdChevronLeft, MdChevronRight, MdOutlineChevronRight, MdFilterList } from "react-icons/md";
import { adminInquiryApi } from "../../../api/admin.inquiry.api";
import { twMerge } from "tailwind-merge";

function AdminInquiryList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // 1. 관리자용 문의 목록 조회 (검색어 및 필터 연동)
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "inquiries", page, search, statusFilter, typeFilter],
    queryFn: () => adminInquiryApi.getInquiries({ 
      page, 
      limit: 10, 
      search: search || undefined,
      status: (statusFilter as any) || undefined,
      type: (typeFilter as any) || undefined
    }),
  });

  const typeLabels: any = { 
    COMPLIMENT: '칭찬', 
    COMPLAINT: '불만', 
    SUGGESTION: '제안', 
    INQUIRY: '문의' 
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#222222] tracking-tight uppercase italic">Inquiry Management</h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">고객들의 1:1 문의 내역을 통합 관리합니다.</p>
        </div>
      </div>

      {/* 검색 및 필터 바 */}
      <div className="bg-white p-8 rounded-[30px] border border-gray-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="제목, 내용, 작성자 이름/이메일 검색..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-brand-yellow font-bold text-sm"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={typeFilter} 
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="bg-gray-50 border-none rounded-xl px-4 py-3 text-xs font-black text-gray-500 focus:ring-2 focus:ring-brand-yellow"
            >
              <option value="">모든 유형</option>
              {Object.entries(typeLabels).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
            </select>
            <select 
              value={statusFilter} 
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-gray-50 border-none rounded-xl px-4 py-3 text-xs font-black text-gray-500 focus:ring-2 focus:ring-brand-yellow"
            >
              <option value="">모든 상태</option>
              <option value="PENDING">확인중</option>
              <option value="ANSWERED">답변완료</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[30px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
              <tr>
                <th className="px-6 py-4 w-20">ID</th>
                <th className="px-6 py-4 w-24">Type</th>
                <th className="px-6 py-4">Title & Content</th>
                <th className="px-6 py-4 w-32 text-center">Status</th>
                <th className="px-6 py-4 w-32 text-center">Date</th>
                <th className="px-6 py-4 w-24 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={6} className="py-20 text-center text-gray-400 font-bold italic">Loading inquiries...</td></tr>
              ) : !data?.data || data.data.length === 0 ? (
                <tr><td colSpan={6} className="py-20 text-center text-gray-400 font-bold">검색 결과가 없습니다.</td></tr>
              ) : (
                data.data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 text-xs font-mono text-gray-400">#{item.id}</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-black text-gray-500">{typeLabels[item.type]}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#222222] truncate max-w-xs">{item.title}</span>
                        <span className="text-[10px] text-gray-400 truncate max-w-xs">{item.content.replace(/<[^>]*>/g, '')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={twMerge(["px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", item.status === 'ANSWERED' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'])}>
                        {item.status === 'ANSWERED' ? '답변완료' : '확인중'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-center">
                      <Link to={`/admin/inquiries/${item.id}`} className="inline-flex items-center gap-1 text-xs font-black text-brand-dark hover:text-brand-yellow transition-colors">
                        상세보기 <MdOutlineChevronRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="px-6 py-6 border-t border-gray-50 bg-gray-50/30 flex items-center justify-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-xl hover:bg-white text-gray-400 disabled:opacity-30 transition-all border border-transparent hover:border-gray-100"><MdChevronLeft size={20} /></button>
            <span className="text-xs font-black text-[#222222] bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm italic">Page {page} / {data.pagination.totalPages}</span>
            <button onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))} disabled={page === data.pagination.totalPages} className="p-2 rounded-xl hover:bg-white text-gray-400 disabled:opacity-30 transition-all border border-transparent hover:border-gray-100"><MdChevronRight size={20} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminInquiryList;
