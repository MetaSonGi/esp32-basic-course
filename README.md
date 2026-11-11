# ESP32 기초 교실

아두이노 IDE로 배우는 무료 한국어 ESP32 기초 강좌입니다. LED 하나 켜기부터 휴대폰으로 조종하는 Wi-Fi 기기까지 6단원 18강으로 구성했습니다.

**바로 보기:** https://metasongi.github.io/esp32-basic-course/

## 단원
1. 시작하기 — ESP32란?, 개발 환경, 첫 업로드
2. 디지털 입출력 — LED, 버튼과 디바운스, 인터럽트
3. 아날로그와 센서 — ADC, PWM(LEDC), 터치 센서
4. 통신과 타이밍 — 시리얼 명령, millis() 논블로킹, I2C 스캐너
5. Wi-Fi — 연결, 웹 서버로 LED 제어, NTP 시간
6. 더 나아가기 — 딥슬립, Preferences 저장, 미니 프로젝트(휴대폰 밝기 측정기)

예제는 esp32 보드 패키지 3.x(Arduino IDE 2) 기준입니다.

## 구조
- `index.html` — 페이지 틀
- `lessons.js` — 단원·강의·준비물 데이터. 강의를 고치거나 추가하려면 이 파일만 수정하면 됩니다
- `app.js` — 화면 그리기, 진도 저장(브라우저 localStorage)
- `style.css` — 디자인

빌드 과정이 없는 정적 사이트라 GitHub Pages에 그대로 올라갑니다.
