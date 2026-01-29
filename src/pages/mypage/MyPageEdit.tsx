import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { memberApi, UpdateMemberInput } from '../../api/member.api';
import { User, Phone, ArrowLeft, Save } from 'lucide-react';

const MyPageEdit: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: member, isLoading } = useQuery({
    queryKey: ['member', 'me'],
    queryFn: memberApi.getMe,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateMemberInput>();

  useEffect(() => {
    if (member) {
      reset({
        name: member.name,
        phone: member.phone,
      });
    }
  }, [member, reset]);

  const mutation = useMutation({
    mutationFn: (data: UpdateMemberInput) => memberApi.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member', 'me'] });
      alert('회원 정보가 성공적으로 수정되었습니다.');
      navigate('/mypage');
    },
    onError: () => {
      alert('정보 수정 중 오류가 발생했습니다.');
    },
  });

  const onSubmit = (data: UpdateMemberInput) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-yellow"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-brand-dark px-8 py-10 text-white flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black mb-1">EDIT PROFILE</h1>
            <p className="text-white/60 text-sm font-medium">회원님의 소중한 정보를 안전하게 수정합니다.</p>
          </div>
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
          >
            <ArrowLeft size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 md:p-10 space-y-8">
          
          {/* Email (Read Only) */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">이메일 (수정 불가)</label>
            <div className="flex items-center gap-4 bg-gray-50 px-5 py-4 rounded-2xl border border-gray-100 text-gray-400 font-bold">
              <User size={20} />
              <span>{member?.email}</span>
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">이름</label>
            <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-100 bg-white focus-within:border-brand-yellow focus-within:ring-4 focus-within:ring-brand-yellow/10'}`}>
              <User size={20} className={errors.name ? 'text-red-500' : 'text-gray-400'} />
              <input 
                {...register('name', { required: '이름을 입력해주세요.' })}
                type="text" 
                className="flex-1 bg-transparent outline-none font-bold text-brand-dark placeholder:text-gray-300"
                placeholder="성함을 입력하세요"
              />
            </div>
            {errors.name && <p className="text-xs text-red-500 font-bold ml-1">{errors.name.message}</p>}
          </div>

          {/* Phone Input */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">연락처</label>
            <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-100 bg-white focus-within:border-brand-yellow focus-within:ring-4 focus-within:ring-brand-yellow/10'}`}>
              <Phone size={20} className={errors.phone ? 'text-red-500' : 'text-gray-400'} />
              <input 
                {...register('phone', { required: '연락처를 입력해주세요.' })}
                type="text" 
                className="flex-1 bg-transparent outline-none font-bold text-brand-dark placeholder:text-gray-300"
                placeholder="010-0000-0000"
              />
            </div>
            {errors.phone && <p className="text-xs text-red-500 font-bold ml-1">{errors.phone.message}</p>}
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button 
              type="submit"
              disabled={mutation.isPending}
              className="w-full py-5 bg-brand-yellow text-brand-dark font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-brand-yellow/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-brand-dark"></div>
              ) : (
                <>
                  <Save size={20} />
                  <span>정보 수정 완료</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default MyPageEdit;
