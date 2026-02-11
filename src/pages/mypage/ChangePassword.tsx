import React from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { memberApi } from '../../api/member.api';
import type { ChangePasswordInput } from '../../api/member.api';
import { Lock, ArrowLeft, ShieldCheck } from 'lucide-react';
import { AxiosError } from 'axios';
import { useAlertStore } from '../../stores/useAlertStore';

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlertStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordInput>();

  const newPassword = watch('newPassword');

  const mutation = useMutation({
    mutationFn: (data: ChangePasswordInput) => memberApi.changePassword(data),
    onSuccess: () => {
      showAlert('비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.', '성공', 'success');
      // 비밀번호 변경 후에는 보안을 위해 로그아웃 처리하거나 로그인 페이지로 이동하는 것이 일반적입니다.
      navigate('/login');
    },
    onError: (err) => {
      let message = '비밀번호 변경 중 오류가 발생했습니다.';
      if (err instanceof AxiosError) {
        message = err.response?.data?.message || message;
      }
      showAlert(message, '실패', 'error');
    },
  });

  const onSubmit = (data: ChangePasswordInput) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-brand-dark px-8 py-10 text-white flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black mb-1">CHANGE PASSWORD</h1>
            <p className="text-white/60 text-sm font-medium">계정 보안을 위해 주기적인 비밀번호 변경을 권장합니다.</p>
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

          {/* Current Password */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">현재 비밀번호</label>
            <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all ${errors.currentPassword ? 'border-red-500 bg-red-50' : 'border-gray-100 bg-white focus-within:border-brand-yellow focus-within:ring-4 focus-within:ring-brand-yellow/10'}`}>
              <Lock size={20} className={errors.currentPassword ? 'text-red-500' : 'text-gray-400'} />
              <input
                {...register('currentPassword', { required: '현재 비밀번호를 입력해주세요.' })}
                type="password"
                className="flex-1 bg-transparent outline-none font-bold text-brand-dark placeholder:text-gray-300"
                placeholder="현재 비밀번호를 입력하세요"
              />
            </div>
            {errors.currentPassword && <p className="text-xs text-red-500 font-bold ml-1">{errors.currentPassword.message}</p>}
          </div>

          <div className="h-px bg-gray-50 w-full" />

          {/* New Password */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">새 비밀번호</label>
            <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all ${errors.newPassword ? 'border-red-500 bg-red-50' : 'border-gray-100 bg-white focus-within:border-brand-yellow focus-within:ring-4 focus-within:ring-brand-yellow/10'}`}>
              <ShieldCheck size={20} className={errors.newPassword ? 'text-red-500' : 'text-gray-400'} />
              <input
                {...register('newPassword', {
                  required: '새 비밀번호를 입력해주세요.',
                  minLength: { value: 6, message: '비밀번호는 최소 6자 이상이어야 합니다.' }
                })}
                type="password"
                className="flex-1 bg-transparent outline-none font-bold text-brand-dark placeholder:text-gray-300"
                placeholder="새 비밀번호 (6자 이상)"
              />
            </div>
            {errors.newPassword && <p className="text-xs text-red-500 font-bold ml-1">{errors.newPassword.message}</p>}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">새 비밀번호 확인</label>
            <div className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all ${errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-100 bg-white focus-within:border-brand-yellow focus-within:ring-4 focus-within:ring-brand-yellow/10'}`}>
              <ShieldCheck size={20} className={errors.confirmPassword ? 'text-red-500' : 'text-gray-400'} />
              <input
                {...register('confirmPassword', {
                  required: '비밀번호 확인을 입력해주세요.',
                  validate: (value) => value === newPassword || '비밀번호가 일치하지 않습니다.'
                })}
                type="password"
                className="flex-1 bg-transparent outline-none font-bold text-brand-dark placeholder:text-gray-300"
                placeholder="새 비밀번호를 다시 입력하세요"
              />
            </div>
            {errors.confirmPassword && <p className="text-xs text-red-500 font-bold ml-1">{errors.confirmPassword.message}</p>}
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full py-5 bg-brand-dark text-white font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-black/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-brand-yellow"></div>
              ) : (
                <>
                  <Lock size={20} />
                  <span>비밀번호 변경 완료</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
