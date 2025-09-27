## 프로젝트 설계: 휴가/재택근무 결재 시스템

### 1. 요구사항 분석 (Requirements Discovery)

**1.1. 사용자 요구사항 분석 (Socratic Questioning):**

*   **Why?**
    *   **"왜 이 시스템이 필요한가?"**: 기존 수기 또는 오프라인 결재 방식의 비효율성을 개선하고, 휴가/재택근무 신청 및 관리 프로세스를 자동화하여 업무 효율성을 높이기 위함.
    *   **"왜 외부 인터넷이 안되는 환경인가?"**: 보안 정책상 내부망에서만 운영되어야 하는 중요 시스템이기 때문.
    *   **"왜 앱보다 웹을 선호하는가?"**: 별도의 설치가 필요 없고, PC 및 모바일 등 다양한 디바이스에서 접근이 용이하기 때문.
*   **Who?**
    *   **"주요 사용자는 누구인가?"**: 철강형강시스템팀 소속 직원 (팀원, 파트장, 팀장).
    *   **"각 사용자의 역할과 책임은 무엇인가?"**:
        *   **팀원**: 휴가/재택근무 신청, 본인 신청 내역 및 연차 정보 확인.
        *   **파트장**: 파트원의 휴가 신청 1차 결재, 본인 휴가 신청.
        *   **팀장**: 파트장 결재 완료 건 최종 결재, 본인 휴가 신청.
        *   **관리자**: 사용자 계정 관리 (추가, 삭제, 비밀번호 초기화).
*   **What?**
    *   **"시스템의 핵심 기능은 무엇인가?"**:
        *   로그인/로그아웃
        *   휴가/재택근무 신청 (휴가 종류, 기간, 대체근무자, 사유 입력)
        *   결재 (파트장 1차, 팀장 2차)
        *   휴가 신청 내역 및 상태 조회
        *   연차 정보 (총 개수, 사용 개수, 잔여 개수) 확인
        *   알림 기능 (결재 요청, 승인/반려 결과)
        *   관리자 기능 (사용자 관리)
    *   **"어떤 종류의 휴가를 지원해야 하는가?"**: 연차, 오전/오후 반차, 재택근무, 경조휴가, 병가, 교육, 출장, 대체휴가, 기타.
*   **Where?**
    *   **"시스템은 어디에 배포되는가?"**: 외부 인터넷이 차단된 내부망 서버.
*   **When?**
    *   **"언제 시스템이 사용되는가?"**: 휴가/재택근무 신청 및 결재가 필요한 모든 업무 시간.

**1.2. 사용자 여정 지도 (User Journey Mapping):**

*   **시나리오 1: 팀원의 휴가 신청**
    1.  로그인 페이지 접속 -> 사번/비밀번호 입력 -> 로그인 성공
    2.  메인 화면 -> '휴가 신청' 버튼 클릭
    3.  신청 화면 -> 휴가 종류, 기간, 대체근무자, 사유 입력 -> '신청' 버튼 클릭
    4.  신청 완료 확인 -> 메인 화면에서 '신청 내역' 상태 '승인 대기'로 변경 확인
    5.  (파트장/팀장 결재 후) 알림 확인 -> 메인 화면에서 '신청 내역' 상태 '승인' 또는 '반려'로 변경 확인
*   **시나리오 2: 파트장의 결재**
    1.  로그인 -> 메인 화면 '승인 대기 목록' 확인
    2.  결재 화면 이동 -> 파트원 신청 내역 확인
    3.  '승인' 또는 '반려' 버튼 클릭 -> (필요시) 반려 사유 입력
    4.  결재 완료 -> 해당 신청 건이 목록에서 사라짐
*   **시나리오 3: 관리자의 사용자 추가**
    1.  관리자 계정으로 로그인 -> 관리자 화면 이동
    2.  '사용자 추가' 버튼 클릭 -> 신규 사용자 정보 (사번, 이름, 팀, 부서, 직급, 직책) 입력
    3.  '저장' 버튼 클릭 -> 사용자 목록에서 신규 사용자 확인

**1.3. 성공 기준 (Success Criteria):**

*   휴가 신청부터 최종 결재까지 걸리는 시간이 기존 대비 50% 이상 단축된다.
*   사용자 만족도 조사에서 80% 이상이 '만족' 또는 '매우 만족'으로 응답한다.
*   시스템 장애 발생률이 월 1회 미만으로 유지된다.

**1.4. 제약 조건 (Constraints):**

*   **기술**: 외부 인터넷 불가, 웹 기반, 간단하고 빠른 성능.
*   **보안**: 내부망에서만 운영, 사용자 인증 필수.
*   **조직**: 철강형강시스템팀의 조직 구조 (팀, 파트, 직급, 직책) 및 결재 라인 준수.

### 2. 아키텍처 계획 (Architecture Planning)

**2.1. 시스템 구성 요소 (Component Diagrams):**

'''
+-----------------+      +-----------------+      +-----------------+
|   Web Browser   | ---- |  Web Server     | ---- |  Database       |
| (Frontend)      |      | (Backend)       |      | (PostgreSQL)    |
+-----------------+      +-----------------+      +-----------------+
        |                      |
        | (HTTP/S)             | (DB Connection)
        |                      |
+-----------------+      +-----------------+
|   - UI/UX       |      | - API Server    |
|   - State Mgmt  |      | - Business Logic|
|   - API Client  |      | - Auth Service  |
+-----------------+      +-----------------+
'''

*   **Frontend**: React 또는 Vue.js 사용. 반응형 UI, 상태 관리 (Redux/Vuex), API 연동.
*   **Backend**: Python (FastAPI/Django) 또는 Node.js (Express) 사용. RESTful API, 비즈니스 로직 (휴가/결재 처리), 인증 (JWT), 데이터베이스 연동.
*   **Database**: PostgreSQL 또는 MySQL 사용. 사용자 정보, 휴가 신청 내역, 결재 정보 등 저장.
*   **Web Server**: Nginx 또는 Apache 사용. 정적 파일 서빙, 리버스 프록시.

**2.2. 확장성 계획 (Scalability Plans):**

*   **초기**: 단일 서버에 Frontend, Backend, Database 모두 배포 (Monolithic).
*   **성장 (10x)**:
    *   **Backend**: Stateless하게 설계하여 수평 확장 (Scale-out) 가능하도록 구성.
    *   **Database**: Read Replica를 두어 읽기 성능 향상, 필요시 Sharding 고려.
    *   **Frontend**: CDN 도입하여 정적 파일 로딩 속도 개선 (내부망 환경이므로 사내 CDN 또는 캐시 서버 활용).
    *   **Load Balancer**: 여러 대의 웹 서버로 트래픽 분산.

**2.3. 기술 스택 (Technology Decisions):**

| 구분 | 기술 | 선정 이유 |
| :--- | :--- | :--- |
| **Frontend** | **React** | 풍부한 생태계, 컴포넌트 기반 아키텍처, 높은 개발 생산성. |
| **Backend** | **FastAPI (Python)** | 빠른 성능, 쉬운 사용법, 자동 API 문서 생성, Python의 다양한 라이브러리 활용 가능. |
| **Database** | **PostgreSQL** | 안정성, ACID 준수, 다양한 데이터 타입 지원, 풍부한 기능. |
| **Web Server** | **Nginx** | 높은 성능, 낮은 메모리 사용량, 리버스 프록시 및 로드 밸런싱 기능 지원. |
| **Authentication** | **JWT (JSON Web Token)** | Stateless 인증, 확장성 용이, 다양한 플랫폼에서 사용 가능. |

**2.4. 통합 패턴 (Integration Patterns):**

*   **알림**: 초기에는 시스템 내 알림 기능만 구현. 향후 사내 메신저 또는 이메일 시스템과 연동하여 알림을 보낼 수 있도록 확장성을 고려하여 설계 (Webhook 또는 Message Queue 방식).

### 3. 인터페이스 디자인 (Interface Design)

**3.1. API 명세 (Endpoint Specifications - RESTful):**

*   **`POST /api/auth/login`**: 로그인
*   **`GET /api/users/me`**: 내 정보 조회
*   **`GET /api/users`**: 전체 사용자 목록 조회 (관리자)
*   **`POST /api/users`**: 신규 사용자 추가 (관리자)
*   **`DELETE /api/users/{user_id}`**: 사용자 삭제 (관리자)
*   **`POST /api/users/{user_id}/reset-password`**: 비밀번호 초기화 (관리자)
*   **`GET /api/leaves`**: 내 휴가 신청 목록 조회
*   **`POST /api/leaves`**: 휴가 신청
*   **`GET /api/leaves/approvals`**: 결재 대기 목록 조회 (파트장/팀장)
*   **`PUT /api/leaves/{leave_id}/approve`**: 휴가 승인 (파트장/팀장)
*   **`PUT /api/leaves/{leave_id}/reject`**: 휴가 반려 (파트장/팀장)

**3.2. 데이터 모델 (Data Models):**

*   **User**: `id`, `employee_id`, `password`, `name`, `team`, `part`, `rank`, `position`, `hire_date`, `created_at`
*   **Leave**: `id`, `user_id`, `leave_type`, `start_date`, `end_date`, `reason`, `substitute_id`, `status` (`PENDING`, `APPROVED_BY_PART_LEADER`, `APPROVED`, `REJECTED`), `created_at`
*   **Approval**: `id`, `leave_id`, `approver_id`, `status` (`APPROVED`, `REJECTED`), `comment`, `created_at`

**3.3. 인증 설계 (Authentication Design):**

1.  사용자가 사번/비밀번호로 로그인 요청.
2.  서버는 사용자 정보를 확인하고, 유효하면 JWT (Access Token, Refresh Token)를 생성하여 반환.
3.  클라이언트는 Access Token을 API 요청 시 `Authorization` 헤더에 담아 전송.
4.  서버는 매 요청마다 Access Token의 유효성을 검증.
5.  Access Token 만료 시, Refresh Token을 사용하여 새로운 Access Token을 발급받음.

**3.4. 오류 처리 (Error Handling):**

*   HTTP 상태 코드와 명확한 에러 메시지를 포함하는 일관된 JSON 형식으로 오류 응답.
    '''json
    {
      "error": {
        "code": "INVALID_REQUEST",
        "message": "Invalid date range specified."
      }
    }
    '''

### 4. 구현 전략 (Implementation Strategy)

**4.1. 개발 로드맵 (Development Roadmap):**

*   **Phase 1: 핵심 기능 개발 (MVP)**
    *   사용자 인증 (로그인/로그아웃)
    *   휴가 신청 및 내역 조회
    *   기본적인 결재 기능 (승인/반려)
    *   데이터베이스 모델링 및 구축
*   **Phase 2: 고급 기능 및 UI 개선**
    *   알림 기능 구현
    *   관리자 기능 (사용자 관리)
    *   반응형 UI 디자인 적용
    *   연차 계산 로직 고도화
*   **Phase 3: 테스트 및 안정화**
    *   단위/통합 테스트 코드 작성
    *   사용자 테스트 (UAT) 및 피드백 반영
    *   성능 테스트 및 최적화
*   **Phase 4: 배포 및 운영**
    *   내부망 서버에 배포
    *   운영 및 유지보수

**4.2. 품질 게이트 (Quality Gates):**

*   **Code Review**: 모든 코드는 동료 리뷰를 거쳐야 merge 가능.
*   **Unit/Integration Testing**: 주요 비즈니스 로직에 대한 테스트 코드 작성, CI/CD 파이프라인에서 자동 실행.
*   **E2E Testing**: 주요 사용자 시나리오에 대한 End-to-End 테스트 자동화.
*   **Static Code Analysis**: Linter, SonarQube 등을 활용하여 코드 품질 및 잠재적 버그 검사.

**4.3. 위험 완화 (Risk Mitigation):**

| 위험 요소 | 완화 전략 |
| :--- | :--- |
| **요구사항 변경** | Agile 방법론 도입, 주기적인 스프린트 및 회고를 통해 변경사항에 유연하게 대응. |
| **내부망 배포 환경의 복잡성** | 개발 초기 단계부터 Staging 환경을 실제 운영 환경과 최대한 유사하게 구축하여 테스트. |
| **개발자 이탈** | 코드 및 아키텍처에 대한 상세한 문서를 작성하고, 지식 공유 세션을 통해 팀 전체의 이해도를 높임. |

**4.4. 성공 지표 (Success Metrics):**

*   **Lead Time**: 아이디어 구상부터 배포까지 걸리는 시간.
*   **Cycle Time**: 코드 commit부터 배포까지 걸리는 시간.
*   **Mean Time to Recovery (MTTR)**: 장애 발생 시 복구까지 걸리는 평균 시간.
*   **User Adoption Rate**: 전체 직원 중 실제 시스템을 사용하는 비율.
