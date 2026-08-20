# 이용인 대기자관리 상담·기초자료 입력 페이지 검토 보고서 및 사용 매뉴얼

검토일: 2026-08-20  
검토 대상: Google Apps Script Web App URL

## 1. 검토 범위와 제한사항

제공된 URL은 `script.google.com/a/macros/yeshoua.co.kr/.../exec` 형식의 Google Workspace 도메인 전용 Apps Script 웹앱입니다. 비로그인 환경에서 접속하면 Google 계정 로그인 화면으로 리다이렉트되어 실제 입력 화면, 스프레드시트 저장 동작, 제출 결과 화면은 직접 확인할 수 없었습니다.

따라서 본 보고서는 다음 기준으로 작성했습니다.

- 공개 접속 가능 여부 확인
- Google Apps Script 상담 입력폼에서 자주 발생하는 오류 점검 항목 정리
- 실제 테스트에 사용할 구체 입력 예시 제시
- 오류 발견 시 수정해야 할 Apps Script/HTML 코드 패턴 제안
- 운영자가 현장에서 사용할 수 있는 사용자 매뉴얼 작성

## 2. 접속 점검 결과

### 2.1 확인된 현상

비로그인 환경에서 대상 URL에 접속하면 웹앱 화면이 표시되지 않고 Google 로그인/계정 선택 화면으로 이동합니다. 이는 웹앱 배포 권한이 조직 내부 사용자 또는 특정 계정으로 제한되어 있을 때 발생하는 정상적인 Google Apps Script 동작일 수 있습니다.

### 2.2 운영상 영향

- 내부 직원만 사용하는 시스템이라면 문제는 아닙니다.
- 외부 상담자, 보호자, 실습생, 타 기관 담당자가 링크로 직접 입력해야 한다면 접근 오류로 이어집니다.
- 테스트자가 조직 계정이 아닌 개인 Gmail로 접속하면 화면을 확인하지 못할 수 있습니다.

### 2.3 권장 배포 설정

Google Apps Script 편집기에서 다음을 확인하세요.

1. **배포 > 배포 관리**로 이동합니다.
2. 현재 웹앱 배포 항목을 선택합니다.
3. **실행 사용자**를 확인합니다.
   - 스프레드시트에 저장하는 구조라면 일반적으로 `나`로 설정합니다.
4. **액세스 권한**을 확인합니다.
   - 내부 직원 전용: `yeshoua.co.kr 내 모든 사용자`
   - 링크 보유 외부 사용자 포함: `모든 사용자`
5. 변경 후 반드시 새 버전으로 배포하고 최신 URL을 공유합니다.

> 개인정보를 수집하는 상담 폼이라면 무조건 공개하기보다, 조직 계정 로그인 방식 또는 별도 접근 암호/권한 정책을 권장합니다.

## 3. 웹앱 링크와 Google 스프레드시트 동일성 점검

### 3.1 점검 대상 스프레드시트

사용자가 추가로 제공한 저장 대상 후보 스프레드시트는 다음 ID를 사용합니다.

- 스프레드시트 ID: `1iLiwysd-1vf8zuAQ9SULXOv5HhuZglbz7GMtwXVqAUs`
- 시트 gid: `1064274902`

### 3.2 비로그인 환경 점검 결과

제공된 스프레드시트 URL도 비로그인 환경에서는 Google Sheets 본문이 열리지 않고 Google 계정 로그인 화면으로 이동합니다. 따라서 현재 환경에서는 웹앱이 실제로 이 스프레드시트에 저장하는지까지는 직접 확정할 수 없습니다.

다만 웹앱 링크와 스프레드시트 링크가 모두 로그인 권한을 요구한다는 점은 확인되었습니다. 운영자는 기관 계정으로 로그인한 뒤 아래 절차로 두 링크의 연결 관계를 확인해야 합니다.

### 3.3 동일성 확인 절차

1. Google Apps Script 편집기에서 웹앱 프로젝트를 엽니다.
2. `Code.gs`, `appsscript.json`, 환경설정 파일에서 `SpreadsheetApp.openById`, `openByUrl`, `getActiveSpreadsheet`를 검색합니다.
3. 코드 안의 스프레드시트 ID가 `1iLiwysd-1vf8zuAQ9SULXOv5HhuZglbz7GMtwXVqAUs`와 같은지 확인합니다.
4. 저장 함수에서 사용하는 시트 이름 또는 `gid`에 해당하는 탭이 실제 스프레드시트의 입력 저장 탭과 같은지 확인합니다.
5. 웹앱에 테스트 데이터를 1건 제출합니다.
6. 스프레드시트의 `gid=1064274902` 탭에 같은 데이터가 새 행으로 추가되는지 확인합니다.
7. 새 행의 제출 시각, 이용인명, 연락처, 상담 내용이 테스트 입력값과 같은지 대조합니다.

### 3.4 Apps Script에 추가할 동일성 점검 함수

아래 함수를 Apps Script에 임시로 추가한 뒤 실행하면 현재 웹앱 코드가 어느 스프레드시트를 대상으로 하는지 로그로 확인할 수 있습니다.

```javascript
const SPREADSHEET_ID = '1iLiwysd-1vf8zuAQ9SULXOv5HhuZglbz7GMtwXVqAUs';

function debugSpreadsheetTarget() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  Logger.log('Spreadsheet ID: ' + spreadsheet.getId());
  Logger.log('Spreadsheet name: ' + spreadsheet.getName());

  spreadsheet.getSheets().forEach(function(sheet) {
    Logger.log('Sheet name: ' + sheet.getName() + ', gid: ' + sheet.getSheetId());
  });
}
```

실행 로그에서 `Spreadsheet ID`가 위 ID와 같고, 저장 대상 탭의 `gid`가 `1064274902`로 표시되면 제공된 스프레드시트와 연결된 것으로 볼 수 있습니다.

### 3.5 저장 함수에 권장하는 안전장치

웹앱 코드에 대상 스프레드시트 ID를 명시해 두면 다른 스프레드시트에 잘못 저장되는 사고를 줄일 수 있습니다.

```javascript
const SPREADSHEET_ID = '1iLiwysd-1vf8zuAQ9SULXOv5HhuZglbz7GMtwXVqAUs';
const TARGET_SHEET_GID = 1064274902;

function getTargetSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet
    .getSheets()
    .find(function(candidate) {
      return candidate.getSheetId() === TARGET_SHEET_GID;
    });

  if (!sheet) {
    throw new Error('저장 대상 시트를 찾을 수 없습니다. gid=' + TARGET_SHEET_GID);
  }

  return sheet;
}
```

기존 저장 함수에서 `SpreadsheetApp.getActiveSpreadsheet()`를 사용하고 있다면, 웹앱 배포/복사 과정에서 의도하지 않은 파일에 저장될 수 있으므로 위처럼 `openById`와 `gid` 확인 방식으로 바꾸는 것을 권장합니다.

## 4. 디자인 개선 제안

현재 화면을 직접 확인하지 못했기 때문에, 상담·기초자료 입력폼에 적합한 정보 구조 기준으로 제안합니다.

### 4.1 한눈에 들어오는 화면 구조

상담 입력폼은 한 화면에 모든 항목을 길게 나열하기보다 단계별 카드 구조가 좋습니다.

1. **기본 정보**
   - 접수일, 상담자, 접수 경로, 이용 희망 서비스
2. **이용인 정보**
   - 성명, 생년월일, 성별, 연락처, 주소
3. **보호자/연락처 정보**
   - 보호자명, 관계, 연락처, 비상연락처
4. **상담 내용**
   - 장애/질환 정보, 현재 어려움, 요청사항, 특이사항
5. **대기자 관리 정보**
   - 우선순위, 상태, 다음 연락 예정일, 담당자 메모
6. **제출 전 확인**
   - 필수값 누락 여부, 개인정보 수집 동의 체크

### 4.2 시각 디자인 원칙

- 상단에 제목과 설명을 명확히 배치합니다.
- 필수 항목에는 빨간 별표와 안내 문구를 함께 표시합니다.
- 항목 그룹은 흰색 카드, 연한 회색 배경, 충분한 여백으로 구분합니다.
- 제출 버튼은 화면 하단에 크게 고정하거나 마지막 섹션에서 강조합니다.
- 저장 성공/실패 메시지는 알림창뿐 아니라 화면 내 안내 영역에도 표시합니다.
- 모바일에서는 1열, PC에서는 2열 그리드를 적용합니다.

## 5. 오류 점검용 테스트 시나리오

아래 예시는 실제 상담 폼에 입력하여 Google 스프레드시트에 저장되는지 검증하기 위한 테스트 데이터입니다. 실제 개인정보가 아닌 테스트 값입니다.

### 5.1 정상 저장 테스트

| 항목 | 입력 예시 |
|---|---|
| 접수일 | 2026-08-20 |
| 상담자 | 홍길동 |
| 접수 경로 | 전화 |
| 이용인 성명 | 테스트이용인01 |
| 생년월일 | 1990-05-15 |
| 성별 | 여성 |
| 연락처 | 010-1234-5678 |
| 주소 | 서울특별시 중구 세종대로 110 |
| 보호자명 | 테스트보호자 |
| 보호자 관계 | 모 |
| 보호자 연락처 | 010-9876-5432 |
| 희망 서비스 | 주간활동서비스 |
| 상담 내용 | 이동 지원과 낮 시간 돌봄 연계가 필요합니다. |
| 개인정보 동의 | 동의 |

기대 결과:

- 제출 후 성공 메시지가 표시됩니다.
- 스프레드시트에 새 행이 1개 추가됩니다.
- 날짜, 전화번호, 긴 문장이 잘리지 않고 저장됩니다.
- 제출 시각 또는 접수번호가 자동 생성된다면 중복 없이 기록됩니다.

### 5.2 필수값 누락 테스트

| 항목 | 입력 예시 |
|---|---|
| 이용인 성명 | 공란 |
| 연락처 | 010-1234-5678 |
| 상담 내용 | 테스트 |

기대 결과:

- 제출이 차단됩니다.
- `이용인 성명을 입력해주세요.`처럼 어떤 항목이 누락됐는지 안내합니다.
- 스프레드시트에는 빈 행이 추가되지 않습니다.

### 5.3 전화번호 형식 테스트

| 항목 | 입력 예시 |
|---|---|
| 이용인 성명 | 전화번호오류테스트 |
| 연락처 | abc-defg |

기대 결과:

- 제출이 차단됩니다.
- 숫자와 하이픈만 입력하라는 메시지가 표시됩니다.

### 5.4 중복 제출 테스트

정상 저장 테스트 데이터를 입력한 뒤 제출 버튼을 빠르게 2번 누릅니다.

기대 결과:

- 스프레드시트에 같은 내용이 2개 행으로 중복 저장되지 않습니다.
- 제출 중에는 버튼이 비활성화되고 `저장 중...` 상태가 표시됩니다.

## 6. 발견 가능성이 높은 오류와 수정 코드

아래 코드는 일반적인 Google Apps Script HTML Service 구조 기준의 수정 예시입니다. 실제 프로젝트의 변수명과 시트 헤더명에 맞게 조정해야 합니다.

### 6.1 필수값 검증 누락

#### 문제

HTML에서 `required`만 사용하면 브라우저 환경이나 우회 호출에서 누락 데이터가 저장될 수 있습니다.

#### 서버 코드 수정 예시

```javascript
function validatePayload_(data) {
  const required = [
    ['clientName', '이용인 성명'],
    ['phone', '연락처'],
    ['serviceType', '희망 서비스'],
    ['privacyConsent', '개인정보 수집 동의'],
  ];

  const missing = required
    .filter(([key]) => !String(data[key] || '').trim())
    .map(([, label]) => label);

  if (missing.length > 0) {
    throw new Error('필수 항목 누락: ' + missing.join(', '));
  }
}
```

### 6.2 전화번호 저장 형식 깨짐

#### 문제

스프레드시트가 전화번호를 숫자로 인식하면 앞자리 0이 사라질 수 있습니다.

#### 서버 코드 수정 예시

```javascript
function normalizePhone_(value) {
  const phone = String(value || '').trim();
  if (!/^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(phone)) {
    throw new Error('전화번호 형식을 확인해주세요. 예: 010-1234-5678');
  }
  return "'" + phone;
}
```

### 6.3 중복 클릭으로 인한 중복 저장

#### 문제

제출 버튼을 빠르게 여러 번 누르면 같은 상담 기록이 여러 행으로 저장될 수 있습니다.

#### 클라이언트 코드 수정 예시

```html
<script>
  let isSubmitting = false;

  function submitForm() {
    if (isSubmitting) return;
    isSubmitting = true;

    const submitButton = document.getElementById('submitButton');
    submitButton.disabled = true;
    submitButton.textContent = '저장 중...';

    google.script.run
      .withSuccessHandler(function(result) {
        alert('저장되었습니다. 접수번호: ' + result.receiptNo);
        document.getElementById('consultationForm').reset();
        submitButton.disabled = false;
        submitButton.textContent = '저장하기';
        isSubmitting = false;
      })
      .withFailureHandler(function(error) {
        alert(error.message || '저장 중 오류가 발생했습니다.');
        submitButton.disabled = false;
        submitButton.textContent = '저장하기';
        isSubmitting = false;
      })
      .saveConsultation(getFormData());
  }
</script>
```

### 6.4 스프레드시트 열 순서 불일치

#### 문제

HTML 필드 순서와 스프레드시트 열 순서가 달라지면 이름, 전화번호, 상담 내용이 잘못된 열에 저장될 수 있습니다.

#### 서버 코드 수정 예시

```javascript
function saveConsultation(data) {
  validatePayload_(data);

  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('상담접수');
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const receiptNo = createReceiptNo_(sheet);
    sheet.appendRow([
      new Date(),
      receiptNo,
      String(data.counselor || '').trim(),
      String(data.route || '').trim(),
      String(data.clientName || '').trim(),
      String(data.birthDate || '').trim(),
      String(data.gender || '').trim(),
      normalizePhone_(data.phone),
      String(data.address || '').trim(),
      String(data.guardianName || '').trim(),
      String(data.guardianRelation || '').trim(),
      normalizePhone_(data.guardianPhone || data.phone),
      String(data.serviceType || '').trim(),
      String(data.consultationMemo || '').trim(),
      String(data.waitingStatus || '대기').trim(),
      String(data.nextContactDate || '').trim(),
      data.privacyConsent === true || data.privacyConsent === '동의' ? '동의' : '미동의'
    ]);
    return { ok: true, receiptNo };
  } finally {
    lock.releaseLock();
  }
}
```

### 6.5 접수번호 중복

#### 문제

동시에 두 명이 제출하면 마지막 행 기준 번호 생성 방식에서 접수번호가 중복될 수 있습니다.

#### 서버 코드 수정 예시

```javascript
function createReceiptNo_(sheet) {
  const today = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyyMMdd');
  const lastRow = sheet.getLastRow();
  const sequence = Math.max(lastRow, 1);
  return 'WAIT-' + today + '-' + String(sequence).padStart(4, '0');
}
```

`LockService`와 함께 사용하면 동시 제출 중복 가능성을 줄일 수 있습니다.

## 7. 이용인 대기자관리 입력 매뉴얼

### 7.1 목적

본 입력 페이지는 이용 희망자의 상담 및 기초자료를 표준화된 항목으로 입력하고, Google 스프레드시트에 자동 저장하여 대기자 현황을 체계적으로 관리하기 위한 도구입니다.

### 7.2 사용 대상

- 상담 담당자
- 서비스 접수 담당자
- 대기자 관리 담당자
- 기관 관리자

### 7.3 접속 방법

1. 기관에서 공유한 웹앱 링크를 엽니다.
2. 로그인 화면이 표시되면 기관 Google Workspace 계정으로 로그인합니다.
3. 입력 화면이 표시되는지 확인합니다.
4. 화면이 열리지 않으면 관리자에게 접근 권한을 요청합니다.

### 7.4 입력 절차

1. **기본 정보 입력**
   - 접수일은 실제 상담일을 입력합니다.
   - 상담자명은 기록 책임자를 입력합니다.
   - 접수 경로는 전화, 방문, 기관 의뢰, 온라인 등으로 선택합니다.

2. **이용인 정보 입력**
   - 성명, 생년월일, 연락처, 주소를 정확히 입력합니다.
   - 연락처는 `010-0000-0000` 형식으로 입력합니다.

3. **보호자 정보 입력**
   - 보호자명, 관계, 연락처를 입력합니다.
   - 이용인 본인 연락이 어려운 경우 비상연락처를 반드시 입력합니다.

4. **희망 서비스 및 상담 내용 입력**
   - 희망 서비스 유형을 선택합니다.
   - 상담 내용에는 현재 상황, 욕구, 긴급도, 특이사항을 요약합니다.

5. **개인정보 동의 확인**
   - 개인정보 수집 및 이용 동의 여부를 확인합니다.
   - 동의가 없으면 저장 또는 서비스 연계가 제한될 수 있습니다.

6. **제출**
   - 입력 내용을 다시 확인합니다.
   - `저장하기` 또는 `제출` 버튼을 누릅니다.
   - 성공 메시지가 표시될 때까지 창을 닫지 않습니다.

### 7.5 제출 후 확인

1. Google 스프레드시트를 엽니다.
2. 가장 마지막 행에 입력 내용이 추가되었는지 확인합니다.
3. 접수번호, 접수일, 이용인명, 연락처, 담당자, 대기상태가 올바른지 확인합니다.
4. 오류가 있으면 직접 수정하되, 수정자와 수정 사유를 메모로 남기는 것을 권장합니다.

### 7.6 운영 규칙 권장안

- 매일 업무 종료 전 신규 입력 건을 확인합니다.
- 주 1회 대기 상태, 우선순위, 다음 연락일을 업데이트합니다.
- 개인정보가 포함된 스프레드시트 공유 권한은 최소 인원으로 제한합니다.
- 퇴사자 또는 업무 변경자의 접근 권한은 즉시 회수합니다.
- 월 1회 백업 파일을 별도 보관합니다.

## 8. 관리자 점검 체크리스트

| 점검 항목 | 권장 주기 | 확인 방법 |
|---|---:|---|
| 웹앱 접속 가능 여부 | 매월 | 기관 계정/외부 계정 각각 접속 테스트 |
| 제출 후 저장 여부 | 매월 | 테스트 데이터 입력 후 스프레드시트 확인 |
| 필수값 검증 | 분기별 | 빈 값 제출 테스트 |
| 전화번호 형식 | 분기별 | `010-1234-5678`, `abc` 각각 테스트 |
| 중복 제출 방지 | 분기별 | 제출 버튼 연속 클릭 테스트 |
| 스프레드시트 권한 | 월 1회 | 공유 사용자 목록 확인 |
| 개인정보 백업/보관 | 월 1회 | 백업 파일 생성 및 접근 권한 확인 |

## 9. 결론

현재 제공된 웹앱 링크와 스프레드시트 링크는 모두 로그인 장벽 때문에 외부 비로그인 환경에서는 실제 폼과 저장 데이터를 확인할 수 없습니다. 우선 배포 권한 설정을 확인한 뒤, 위 테스트 시나리오로 저장 오류를 점검하는 것을 권장합니다. 디자인 측면에서는 항목을 단계별 카드로 나누고, 필수값 검증, 중복 제출 방지, 성공/실패 안내를 강화하면 상담 담당자가 더 빠르고 안정적으로 사용할 수 있습니다.
