import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { memberApi } from '../../api/member.api';
import { User, Mail, Phone, Award, Calendar, ShieldCheck } from 'lucide-react';

const MyPage: React.FC = () => {
  const { data: member, isLoading, isError } = useQuery({
    queryKey: ['member', 'me'],
    queryFn: memberApi.getMe,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-yellow"></div>
      </div>
    );
  }

  if (isError || !member) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 font-bold">내 정보를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header Section */}
        <div className="bg-brand-dark px-8 py-12 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-black mb-2">MY PAGE</h1>
            <p className="text-white/60 font-medium">나다커피와 함께하는 소중한 회원님의 정보입니다.</p>
          </div>
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
            <User size={200} />
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            
            {/* Profile Info */}
            <div className="space-y-8">
              <h2 className="text-xl font-black text-brand-dark border-b-4 border-brand-yellow w-fit pb-1 mb-6">기본 정보</h2>
              
              <div className="flex items-center gap-4">
                <div className="bg-gray-50 p-3 rounded-2xl text-brand-dark">
                  <User size={24} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">이름</p>
                  <p className="text-lg font-bold text-brand-dark">{member.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-gray-50 p-3 rounded-2xl text-brand-dark">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">이메일</p>
                  <p className="text-lg font-bold text-brand-dark">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-gray-50 p-3 rounded-2xl text-brand-dark">
                  <Phone size={24} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">연락처</p>
                  <p className="text-lg font-bold text-brand-dark">{member.phone}</p>
                </div>
              </div>
            </div>

            {/* Membership Info */}
            <div className="space-y-8">
              <h2 className="text-xl font-black text-brand-dark border-b-4 border-brand-yellow w-fit pb-1 mb-6">회원 혜택</h2>
              
              <div className="flex items-center gap-4">
                <div className="bg-brand-yellow/10 p-3 rounded-2xl text-brand-yellow">
                  <Award size={24} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">회원 등급</p>
                  <p className="text-lg font-black text-brand-yellow">{member.grade}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-gray-50 p-3 rounded-2xl text-brand-dark">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">계정 권한</p>
                  <p className="text-lg font-bold text-brand-dark">{member.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-gray-50 p-3 rounded-2xl text-brand-dark">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">가입일</p>
                  <p className="text-lg font-bold text-brand-dark">
                    {new Date(member.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="mt-16 flex flex-wrap gap-4 justify-center">
            <button className="px-10 py-4 bg-brand-dark text-white font-black rounded-2xl hover:bg-black transition-all shadow-lg shadow-black/10">
              정보 수정하기
            </button>
            <button className="px-10 py-4 bg-white border-2 border-gray-100 text-gray-400 font-black rounded-2xl hover:bg-gray-50 transition-all">
              비밀번호 변경
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
