import { useAlertStore } from "../stores/useAlertStore";
import { adminMemberApi } from "../api/admin.member.api";
import type { CreateMemberInput } from "../types/admin.member";

/**
 * 1,000명의 더미 회원을 생성하여 등록하는 스크립트입니다.
 * 브라우저 콘솔이나 특정 관리자 페이지 버튼에 연결하여 사용할 수 있습니다.
 */
export const generateDummyMembers = async (count: number = 1000) => {
    const firstNames = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임", "한", "오", "서", "신", "권", "황", "안", "송", "전", "홍"];
    const lastNames = ["민준", "서준", "도윤", "예준", "시우", "하준", "주원", "지호", "지후", "준우", "서연", "서윤", "지우", "서현", "하은", "하윤", "민서", "지유", "윤서", "채원"];
    const grades: ("SILVER" | "GOLD" | "VIP")[] = ["SILVER", "GOLD", "VIP"];

    console.log(`🚀 ${count}명의 더미 데이터 생성을 시작합니다...`);

    for (let i = 1; i <= count; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const name = `${firstName}${lastName}`;

        // 중복 방지를 위해 타임스탬프와 인덱스 활용
        const email = `user${Date.now()}${i}@nada.com`;
        const phone = `010-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
        const grade = grades[Math.floor(Math.random() * grades.length)];

        const dummyData: CreateMemberInput = {
            email,
            password: "password123!",
            name,
            phone,
            grade,
            status: "ACTIVE",
            role: "USER"
        };

        try {
            await adminMemberApi.createMember(dummyData);
            if (i % 10 === 0) {
                console.log(`✅ 진행 중: ${i}/${count} 완료 (${name})`);
            }
        } catch (error) {
            console.error(`❌ 등록 실패 (${i}번째):`, error);
            // 서버 부하 방지 및 에러 발생 시 잠시 대기
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // 너무 빠른 요청으로 인한 차단 방지를 위해 약간의 지연 (선택 사항)
        // await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log(`✨ ${count}명의 더미 데이터 생성이 모두 완료되었습니다!`);
    useAlertStore.getState().showAlert(`${count}명의 더미 데이터 생성이 완료되었습니다.`, "성공", "success");
};
