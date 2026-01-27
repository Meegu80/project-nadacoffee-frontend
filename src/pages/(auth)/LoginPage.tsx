import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../../stores/useAuthStore';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '' // pass에서 password로 변경
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    const success = await login({ email: formData.email, password: formData.password });
    if (success) {
      navigate('/');
    } else {
      setError('로그인에 실패했습니다. 이메일 또는 비밀번호를 확인해주세요.');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 flex flex-col items-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="h-36 bg-brand-dark flex items-center justify-center text-white/40 text-lg font-bold uppercase tracking-widest">
          Nerda Coffee
        </div>
        <div className="p-8 md:p-10">
          <h2 className="text-center text-brand-dark mb-8 text-2xl font-black">LOGIN</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2 ml-1">이메일</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="example@email.com"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-yellow transition-all"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2 ml-1">비밀번호</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="비밀번호를 입력하세요"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-yellow transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-brand-yellow text-brand-dark font-black rounded-xl shadow-lg hover:bg-yellow-400 transition-all duration-200 mt-4"
            >
              로그인하기
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm mb-4">아직 회원이 아니신가요?</p>
            <button
              onClick={() => navigate('/signup')}
              className="text-brand-dark font-bold hover:underline"
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
