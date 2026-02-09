// import api from "./axios";

export interface ReviewInput {
    orderId: number;
    prodId: number;
    rating: number; // 1 to 5
    content: string;
}

export const reviewApi = {
    // 리뷰 등록
    createReview: async (body: ReviewInput) => {
        // 실제 엔드포인트가 구현되기 전까지는 딜레이 후 성공 응답 반환
        console.log("Review submitted:", body);
        await new Promise(resolve => setTimeout(resolve, 800));
        return { message: "리뷰가 성공적으로 등록되었습니다." };

        // 실제 구현 시:
        // const { data } = await api.post("/reviews", body);
        // return data;
    }
};
