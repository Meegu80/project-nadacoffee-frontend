import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuthStore } from '../../stores/useAuthStore';
import SEO from '../../components/common/SEO';
import { useForm } from 'react-hook-form'; // [추가]
import { zodResolver } from '@hookform/resolvers/zod'; // [추가]
import * as z from 'zod'; // [추가]
import { Loader2, LogIn } from 'lucide-react';
import { twMerge } from 'tailwind-merge'; // [추가]

// [추가] Zod를 이용한 유효성 검사 스키마 정의
const loginSchema = z.object({
  email: z.string()
    .min(1, '이메일을 입력해주세요.')
    .email('올바른 이메일 형식이 아닙니다.'),
  password: z.string()
    .min(6, '비밀번호는 최소 6자 이상이어야 합니다.')
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const [serverError, setServerError] = useState('');

  const from = (location.state as { from?: Location })?.from?.pathname ?? '/';

  // [추가] React Hook Form 초기화
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  // [수정] 제출 핸들러
  const onSubmit = async (data: LoginFormValues) => {
    setServerError('');
    const success = await login({ email: data.email, password: data.password });
    
    if (success) {
      navigate(from, { replace: true });
    } else {
      setServerError('이메일 또는 비밀번호가 일치하지 않습니다.');
    }
  };

  return (
    <div className="min-h-screen pt-10 pb-20 flex flex-col items-center bg-gray-50 px-4">
      <SEO
        title="로그인"
        description="나다커피에 로그인하고 나만의 커피를 즐기세요. 포인트 적립, 주문 내역, 회원만의 혜택을 누려보세요."
      />
      
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100">
        <div className="h-40 bg-brand-dark flex flex-col items-center justify-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          <h1 className="text-3xl font-black italic tracking-tighter z-10">NADA <span className="text-brand-yellow">COFFEE</span></h1>
          <p className="text-[10px] font-bold text-white/40 tracking-[0.3em] mt-2 z-10 uppercase">Premium Coffee Experience</p>
        </div>

        <div className="p-10 md:p-12">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-brand-yellow rounded-2xl flex items-center justify-center shadow-lg shadow-brand-yellow/20">
              <LogIn size={20} className="text-brand-dark" />
            </div>
            <h2 className="text-2xl font-black text-brand-dark tracking-tight">LOGIN</h2>
          </div>

          {serverError && (
            <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-600 rounded-r-xl text-xs font-bold animate-in fade-in slide-in-from-left-2">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 이메일 필드 */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <input
                {...register('email')}
                type="email"
                placeholder="example@email.com"
                className={twMerge([
                  "w-full p-5 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:bg-white transition-all font-bold text-sm",
                  errors.email ? "border-red-200 focus:border-red-500" : "focus:border-brand-yellow"
                ])}
              />
              {errors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.email.message}</p>}
            </div>

            {/* 비밀번호 필드 */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className={twMerge([
                  "w-full p-5 bg-gray-50 border-2 border-transparent rounded-2xl focus:outline-none focus:bg-white transition-all font-bold text-sm",
                  errors.password ? "border-red-200 focus:border-red-500" : "focus:border-brand-yellow"
                ])}
              />
              {errors.password && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 bg-brand-dark text-white font-black rounded-[20px] shadow-xl hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "로그인하기"}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-gray-50 text-center">
            <p className="text-gray-400 text-xs font-bold mb-4">아직 나다커피 회원이 아니신가요?</p>
            <button
              onClick={() => navigate('/signup')}
              className="text-brand-dark font-black text-sm hover:text-brand-yellow transition-colors underline underline-offset-4"
            >
              회원가입 하러가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
