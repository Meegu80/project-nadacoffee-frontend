describe('Home Page E2E Test', () => {
  it('메인 페이지에 접속하여 베스트 셀러 섹션이 보이는지 확인', () => {
    cy.visit('/');
    
    // 로고가 있는지 확인
    cy.get('nav').should('exist');
    
    // 주간 베스트 셀러 텍스트가 있는지 확인
    cy.contains('주간 베스트 셀러').should('be.visible');
    
    // 메뉴 페이지로 이동 버튼 클릭 테스트
    cy.contains('전체 메뉴 보기').click();
    cy.url().should('include', '/menu');
  });
});
