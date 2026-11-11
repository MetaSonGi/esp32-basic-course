// 강좌 내용. 단원(CHAPTERS)과 강의(LESSONS)만 고치면 사이트 전체가 바뀝니다.
const CHAPTERS = [
  {n: 1, title: '시작하기', sum: 'ESP32가 무엇인지 알고, 개발 환경을 만들어 첫 프로그램을 올립니다.'},
  {n: 2, title: '디지털 입출력', sum: 'LED를 켜고 버튼을 읽고, 인터럽트로 즉시 반응하는 법을 배웁니다.'},
  {n: 3, title: '아날로그와 센서', sum: 'ADC로 전압을 읽고, PWM으로 밝기를 조절하고, 터치 센서를 씁니다.'},
  {n: 4, title: '통신과 타이밍', sum: '시리얼로 대화하고, delay 없이 여러 일을 동시에 처리하고, I2C 장치를 찾습니다.'},
  {n: 5, title: 'Wi-Fi', sum: '공유기에 접속하고, 휴대폰 브라우저로 LED를 켜고, 인터넷 시간을 받아옵니다.'},
  {n: 6, title: '더 나아가기', sum: '전기를 아끼는 딥슬립, 꺼져도 남는 설정 저장, 그리고 작은 완성 프로젝트.'},
];

const LESSONS = [
// ---------------------------------------------------------------- 1단원
{id: '1-1', ch: 1, title: 'ESP32란?', min: 10,
 body: `<p>ESP32는 Wi-Fi와 블루투스가 들어 있는 마이크로컨트롤러입니다. 아두이노 우노와 같은 방식으로 프로그래밍할 수 있지만 훨씬 빠르고 기능이 많습니다.</p>
<table><tr><th></th><th>아두이노 우노</th><th>ESP32</th></tr>
<tr><td>CPU</td><td>8비트 16 MHz</td><td>32비트 듀얼코어 240 MHz</td></tr>
<tr><td>RAM</td><td>2 KB</td><td>520 KB</td></tr>
<tr><td>무선</td><td>없음</td><td>Wi-Fi, 블루투스</td></tr>
<tr><td>동작 전압</td><td>5 V</td><td><b>3.3 V</b></td></tr>
<tr><td>ADC</td><td>10비트</td><td>12비트 (0~4095)</td></tr></table>
<p>이 강좌는 가장 흔한 <b>ESP32 DevKit (ESP32-WROOM-32, 30핀 또는 38핀)</b> 보드를 기준으로 합니다. 보드마다 핀 배치가 조금씩 다르니, 갖고 있는 보드의 핀 그림(pinout)을 검색해 옆에 두고 따라오세요.</p>
<h3>꼭 알아둘 핀 규칙</h3>
<ul>
<li><b>3.3 V 전용</b>: 핀에 5 V를 넣으면 칩이 망가질 수 있습니다.</li>
<li><b>GPIO 34~39는 입력 전용</b>입니다. 출력도 안 되고 내부 풀업도 없습니다.</li>
<li><b>GPIO 6~11</b>은 내부 플래시 메모리가 쓰므로 절대 사용하지 마세요.</li>
<li><b>GPIO 0, 2, 12, 15</b>는 부팅 방식을 정하는 핀이라, 여기에 부품을 달면 업로드가 안 될 때가 있습니다.</li>
<li>Wi-Fi를 켜면 <b>ADC2 핀(GPIO 0, 2, 4, 12~15, 25~27)</b>으로는 아날로그 값을 읽을 수 없습니다. ADC1(GPIO 32~39)을 쓰세요.</li>
</ul>`,
 task: '갖고 있는 보드의 핀 그림을 찾아 위 다섯 가지 규칙에 해당하는 핀에 표시해 보세요.'},

{id: '1-2', ch: 1, title: '개발 환경 만들기', min: 15,
 body: `<ol>
<li><a href="https://www.arduino.cc/en/software" target="_blank" rel="noopener">Arduino IDE 2</a>를 설치합니다.</li>
<li><b>파일 → 기본 설정</b>의 "추가 보드 관리자 URL"에 아래 주소를 넣습니다.<pre class="inline">https://espressif.github.io/arduino-esp32/package_esp32_index.json</pre></li>
<li>왼쪽 <b>보드 매니저</b>에서 <code>esp32</code>를 검색해 <b>esp32 by Espressif Systems</b>(3.x 버전)를 설치합니다.</li>
<li><b>도구 → 보드</b>에서 <code>ESP32 Dev Module</code>을 고릅니다.</li>
<li>USB 케이블을 꽂고 <b>도구 → 포트</b>에서 새로 생긴 포트를 고릅니다.</li>
</ol>
<h3>포트가 안 보일 때</h3>
<ul>
<li>충전 전용 케이블이 아닌지 확인하세요. 데이터선이 있는 케이블이어야 합니다.</li>
<li>보드의 USB 칩 드라이버가 필요할 수 있습니다. 칩 이름(CP2102 또는 CH340)으로 드라이버를 검색해 설치하세요.</li>
</ul>
<p class="note">이 강좌의 예제는 esp32 보드 패키지 <b>3.x</b> 기준입니다. 2.x에서는 PWM 함수 이름이 다릅니다(3단원에서 설명).</p>`,
 task: '보드와 포트를 고른 뒤 <b>도구 → 보드 정보 가져오기</b>를 눌러 보드가 응답하는지 확인하세요.'},

{id: '1-3', ch: 1, title: '첫 업로드: LED 깜빡이기', min: 10,
 body: `<p>대부분의 DevKit에는 GPIO 2에 파란 LED가 달려 있습니다. 1초마다 켜고 끄는 프로그램을 올려 봅시다.</p>
<p>아두이노 프로그램은 두 함수로 이루어집니다. <code>setup()</code>은 전원이 켜질 때 한 번, <code>loop()</code>는 그 뒤로 계속 반복해서 실행됩니다.</p>
<p>업로드 버튼(→)을 누르고 아래 창에 <code>Connecting....</code>이 보일 때 업로드가 멈추면, 보드의 <b>BOOT</b> 버튼을 1~2초 누르고 있으면 됩니다.</p>`,
 code: `const int LED = 2;   // 보드에 내장된 LED (보드에 따라 다를 수 있음)

void setup() {
  pinMode(LED, OUTPUT);
}

void loop() {
  digitalWrite(LED, HIGH);  // 켜기
  delay(1000);              // 1000 ms 기다리기
  digitalWrite(LED, LOW);   // 끄기
  delay(1000);
}`,
 task: '켜져 있는 시간은 0.2초, 꺼져 있는 시간은 0.8초가 되도록 바꿔 보세요.'},

// ---------------------------------------------------------------- 2단원
{id: '2-1', ch: 2, title: 'LED 여러 개 다루기', min: 15,
 body: `<p>외부 LED는 반드시 <b>저항(220~330 Ω)</b>과 함께 연결합니다. LED의 긴 다리(+)가 GPIO 쪽, 짧은 다리(−)가 GND 쪽입니다.</p>
<p>핀 번호를 배열에 넣으면 LED가 몇 개든 같은 코드로 다룰 수 있습니다.</p>`,
 wiring: [['GPIO 25', '저항 → LED1 → GND'], ['GPIO 26', '저항 → LED2 → GND'], ['GPIO 27', '저항 → LED3 → GND']],
 code: `const int LEDS[] = {25, 26, 27};
const int N = sizeof(LEDS) / sizeof(LEDS[0]);

void setup() {
  for (int i = 0; i < N; i++) pinMode(LEDS[i], OUTPUT);
}

void loop() {
  // 하나씩 차례로 켜기
  for (int i = 0; i < N; i++) {
    digitalWrite(LEDS[i], HIGH);
    delay(200);
    digitalWrite(LEDS[i], LOW);
  }
}`,
 task: '왼쪽→오른쪽→왼쪽으로 왕복하는 "자동차 불빛" 패턴을 만들어 보세요.'},

{id: '2-2', ch: 2, title: '버튼 읽기', min: 15,
 body: `<p>버튼을 GPIO와 GND 사이에 연결하고 <code>INPUT_PULLUP</code>으로 설정하면 별도 저항이 필요 없습니다. 이때 <b>누르면 LOW, 떼면 HIGH</b>가 됩니다.</p>
<p>버튼은 누르는 순간 접점이 여러 번 떨려서(채터링) 한 번 누른 것이 여러 번으로 읽힐 수 있습니다. 상태가 바뀐 뒤 일정 시간(여기서는 30 ms) 같은 값이 유지될 때만 인정하는 것을 <b>디바운스</b>라고 합니다.</p>`,
 wiring: [['GPIO 18', '버튼 → GND'], ['GPIO 2', '내장 LED']],
 code: `const int BTN = 18, LED = 2;
bool ledOn = false;
int lastRead = HIGH, stable = HIGH;
unsigned long changedAt = 0;

void setup() {
  pinMode(BTN, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
}

void loop() {
  int now = digitalRead(BTN);
  if (now != lastRead) { changedAt = millis(); lastRead = now; }

  if (millis() - changedAt > 30 && now != stable) {
    stable = now;
    if (stable == LOW) {          // 눌린 순간에만
      ledOn = !ledOn;
      digitalWrite(LED, ledOn);
    }
  }
}`,
 task: '버튼을 누를 때마다 2-1강의 LED 세 개가 하나씩 차례로 켜지도록 합쳐 보세요.'},

{id: '2-3', ch: 2, title: '인터럽트', min: 15,
 body: `<p><code>loop()</code> 안에서 버튼을 계속 확인하는 대신, 핀의 값이 바뀌는 순간 하드웨어가 지정한 함수를 바로 불러 주게 할 수 있습니다. 이것이 <b>인터럽트</b>입니다.</p>
<ul>
<li>인터럽트 함수(ISR)는 <b>짧게</b> 작성합니다. 안에서 <code>delay()</code>나 <code>Serial.print()</code>를 쓰지 마세요.</li>
<li>ISR 앞에 <code>IRAM_ATTR</code>을 붙이면 함수가 빠른 메모리에 올라갑니다.</li>
<li>ISR과 <code>loop()</code>가 함께 쓰는 변수에는 <code>volatile</code>을 붙입니다.</li>
</ul>`,
 wiring: [['GPIO 18', '버튼 → GND']],
 code: `const int BTN = 18;
volatile unsigned long count = 0;
volatile unsigned long lastIsr = 0;

void IRAM_ATTR onPress() {
  unsigned long t = millis();
  if (t - lastIsr > 50) {   // 간단한 디바운스
    count++;
    lastIsr = t;
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(BTN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(BTN), onPress, FALLING);
}

void loop() {
  static unsigned long shown = 0;
  if (count != shown) {
    shown = count;
    Serial.printf("눌린 횟수: %lu\\n", shown);
  }
}`,
 task: '<code>loop()</code>에 <code>delay(3000)</code>을 넣어도 횟수가 빠짐없이 세어지는지 확인해 보세요. 2-2강 방식과 무엇이 다른가요?'},

// ---------------------------------------------------------------- 3단원
{id: '3-1', ch: 3, title: '아날로그 입력 (ADC)', min: 15,
 body: `<p>ESP32의 ADC는 12비트라서 <code>analogRead()</code>가 <b>0~4095</b>를 돌려줍니다. 기본 설정에서는 약 0~3.1 V 범위를 읽습니다.</p>
<p><code>analogReadMilliVolts()</code>를 쓰면 칩마다 저장된 보정값을 적용한 밀리볼트 값을 바로 얻을 수 있어 더 정확합니다.</p>
<p class="note">ESP32 ADC는 0 V와 3.3 V 근처에서 값이 휘는 특성이 있습니다. 정밀 측정이 필요하면 범위 가운데를 쓰거나 외부 ADC를 쓰세요.</p>`,
 wiring: [['가변저항 양 끝', '3.3V, GND'], ['가변저항 가운데', 'GPIO 34']],
 code: `const int POT = 34;   // ADC1 핀 (Wi-Fi와 함께 써도 됨)

void setup() {
  Serial.begin(115200);
}

void loop() {
  int raw = analogRead(POT);              // 0 ~ 4095
  int mv  = analogReadMilliVolts(POT);    // 보정된 mV
  Serial.printf("raw=%4d  %4d mV\\n", raw, mv);
  delay(200);
}`,
 task: '도구 → 시리얼 플로터를 열고 가변저항을 돌려 보세요. 값이 0과 4095 끝에서 어떻게 변하나요?'},

{id: '3-2', ch: 3, title: 'PWM으로 밝기 조절', min: 15,
 body: `<p>디지털 핀은 켜짐/꺼짐만 낼 수 있지만, 아주 빠르게 켰다 껐다 하면서 켜진 시간의 비율(듀티)을 바꾸면 밝기가 달라 보입니다. 이것이 <b>PWM</b>입니다. ESP32는 이를 <b>LEDC</b>라는 하드웨어로 만듭니다.</p>
<ul>
<li><code>ledcAttach(핀, 주파수, 해상도)</code>로 핀을 PWM 출력으로 설정합니다.</li>
<li><code>ledcWrite(핀, 듀티)</code>로 밝기를 정합니다. 해상도가 8비트면 0~255입니다.</li>
</ul>
<p class="note">보드 패키지 2.x에서는 <code>ledcSetup(채널, 주파수, 해상도)</code>와 <code>ledcAttachPin(핀, 채널)</code>을 쓰고, <code>ledcWrite</code>에 핀 대신 채널 번호를 넣었습니다. 인터넷 예제가 컴파일되지 않으면 이 차이 때문인 경우가 많습니다.</p>`,
 wiring: [['GPIO 25', '저항 → LED → GND'], ['가변저항 가운데', 'GPIO 34']],
 code: `const int LED = 25, POT = 34;

void setup() {
  ledcAttach(LED, 5000, 8);   // 5 kHz, 8비트 (0~255)
}

void loop() {
  int raw = analogRead(POT);              // 0 ~ 4095
  int duty = map(raw, 0, 4095, 0, 255);   // 0 ~ 255
  ledcWrite(LED, duty);
  delay(10);
}`,
 task: '가변저항 없이 LED가 숨 쉬듯 천천히 밝아졌다 어두워지기를 반복하게 만들어 보세요.'},

{id: '3-3', ch: 3, title: '터치 센서', min: 10,
 body: `<p>ESP32에는 손가락이 닿으면 값이 바뀌는 정전식 터치 핀이 10개 있습니다(GPIO 0, 2, 4, 12~15, 27, 32, 33). 핀에 전선이나 알루미늄 호일만 연결하면 버튼처럼 쓸 수 있습니다.</p>
<p>원래 ESP32에서는 <code>touchRead()</code> 값이 <b>손을 대면 작아집니다</b>. 먼저 손을 뗐을 때와 댔을 때 값을 확인해서 그 사이에 기준값을 정하세요.</p>`,
 wiring: [['GPIO 4 (T0)', '전선 끝 또는 호일 조각']],
 code: `const int TOUCH = 4, LED = 2;
int threshold = 0;

void setup() {
  Serial.begin(115200);
  pinMode(LED, OUTPUT);
  delay(500);
  int idle = touchRead(TOUCH);     // 손 대지 않은 상태의 값
  threshold = idle * 0.7;          // 30% 이상 떨어지면 터치로 판단
  Serial.printf("기준값: %d\\n", threshold);
}

void loop() {
  int v = touchRead(TOUCH);
  digitalWrite(LED, v < threshold);
  Serial.println(v);
  delay(50);
}`,
 task: '호일 두 장으로 "터치 버튼 두 개"를 만들어, 하나는 LED를 켜고 하나는 끄도록 해 보세요.'},

// ---------------------------------------------------------------- 4단원
{id: '4-1', ch: 4, title: '시리얼로 대화하기', min: 15,
 body: `<p>지금까지는 보드가 컴퓨터로 글자를 보내기만 했습니다. 이번에는 시리얼 모니터에서 명령을 입력해 보드를 조종합니다.</p>
<p>시리얼 모니터의 줄 끝 설정을 <b>새 줄(Newline)</b>로 두면, 입력한 한 줄을 <code>readStringUntil('\\n')</code>으로 받을 수 있습니다.</p>`,
 code: `const int LED = 2;

void setup() {
  Serial.begin(115200);
  pinMode(LED, OUTPUT);
  Serial.println("명령: on, off, blink 숫자");
}

void loop() {
  if (!Serial.available()) return;
  String cmd = Serial.readStringUntil('\\n');
  cmd.trim();

  if (cmd == "on")       digitalWrite(LED, HIGH);
  else if (cmd == "off") digitalWrite(LED, LOW);
  else if (cmd.startsWith("blink ")) {
    int n = cmd.substring(6).toInt();
    for (int i = 0; i < n; i++) {
      digitalWrite(LED, HIGH); delay(150);
      digitalWrite(LED, LOW);  delay(150);
    }
  } else {
    Serial.println("모르는 명령: " + cmd);
    return;
  }
  Serial.println("OK " + cmd);
}`,
 task: '<code>pwm 숫자</code> 명령을 추가해서 3-2강처럼 LED 밝기를 0~255로 정할 수 있게 해 보세요.'},

{id: '4-2', ch: 4, title: 'delay 없이 여러 일 하기', min: 15,
 body: `<p><code>delay()</code>가 실행되는 동안 보드는 아무것도 하지 못합니다. LED 두 개를 서로 다른 속도로 깜빡이려면 <code>delay()</code> 대신 <b>시간을 확인</b>하는 방식을 씁니다.</p>
<p><code>millis()</code>는 전원이 켜진 뒤 지난 시간을 ms로 돌려줍니다. "마지막으로 바꾼 시각에서 정해진 간격이 지났으면 바꾼다"를 반복하면 됩니다.</p>`,
 wiring: [['GPIO 25', '저항 → LED1 → GND'], ['GPIO 26', '저항 → LED2 → GND']],
 code: `struct Blinker {
  int pin;
  unsigned long interval, last;
  bool on;
};

Blinker leds[] = {
  {25, 500, 0, false},   // 0.5초마다
  {26, 130, 0, false},   // 0.13초마다
};

void setup() {
  for (auto &b : leds) pinMode(b.pin, OUTPUT);
}

void loop() {
  unsigned long now = millis();
  for (auto &b : leds) {
    if (now - b.last >= b.interval) {
      b.last = now;
      b.on = !b.on;
      digitalWrite(b.pin, b.on);
    }
  }
  // 여기서 버튼 읽기, 센서 읽기 등을 함께 해도 막히지 않습니다
}`,
 task: '2-2강의 버튼을 추가해서, 버튼을 누르면 두 LED의 속도가 서로 바뀌게 해 보세요.'},

{id: '4-3', ch: 4, title: 'I2C 장치 찾기', min: 15,
 body: `<p>I2C는 선 두 개(SDA, SCL)로 여러 장치를 연결하는 통신 방식입니다. 각 장치는 고유한 <b>주소</b>를 가집니다. ESP32 DevKit의 기본 I2C 핀은 <b>SDA = GPIO 21, SCL = GPIO 22</b>입니다.</p>
<p>OLED 화면, 온습도 센서(SHT31, BME280 등), 가속도 센서 같은 모듈을 연결했다면 아래 스캐너로 주소부터 확인하세요. 아무것도 안 나오면 배선이나 전원을 먼저 의심하면 됩니다.</p>`,
 wiring: [['모듈 VCC', '3.3V'], ['모듈 GND', 'GND'], ['모듈 SDA', 'GPIO 21'], ['모듈 SCL', 'GPIO 22']],
 code: `#include <Wire.h>

void setup() {
  Serial.begin(115200);
  Wire.begin();   // SDA 21, SCL 22
  delay(500);

  Serial.println("I2C 스캔 시작");
  int found = 0;
  for (uint8_t addr = 1; addr < 127; addr++) {
    Wire.beginTransmission(addr);
    if (Wire.endTransmission() == 0) {
      Serial.printf("  장치 발견: 0x%02X\\n", addr);
      found++;
    }
  }
  Serial.printf("모두 %d개\\n", found);
}

void loop() {}`,
 task: '흔한 OLED(SSD1306)는 0x3C, BME280은 0x76 또는 0x77입니다. 가진 모듈의 주소를 확인하고 데이터시트의 값과 비교해 보세요.'},

// ---------------------------------------------------------------- 5단원
{id: '5-1', ch: 5, title: 'Wi-Fi 연결', min: 10,
 body: `<p>ESP32는 <b>2.4 GHz</b> Wi-Fi만 지원합니다. 공유기가 5 GHz만 켜져 있으면 연결되지 않습니다.</p>
<p>연결에 성공하면 공유기가 나눠준 IP 주소를 시리얼 모니터에 출력합니다. 다음 강의에서 이 주소로 보드에 접속합니다.</p>`,
 code: `#include <WiFi.h>

const char* SSID = "공유기이름";
const char* PASS = "비밀번호";

void setup() {
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  WiFi.begin(SSID, PASS);

  Serial.print("연결 중");
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED) {
    if (millis() - start > 15000) {
      Serial.println("\\n실패: 이름, 비밀번호, 2.4 GHz 여부를 확인하세요");
      return;
    }
    delay(300);
    Serial.print(".");
  }
  Serial.print("\\n연결됨! IP: ");
  Serial.println(WiFi.localIP());
  Serial.printf("신호 세기: %d dBm\\n", WiFi.RSSI());
}

void loop() {}`,
 task: '<code>WiFi.scanNetworks()</code>로 주변 Wi-Fi 이름과 신호 세기를 모두 출력해 보세요.'},

{id: '5-2', ch: 5, title: '웹 서버로 LED 켜기', min: 20,
 body: `<p>ESP32를 작은 웹 서버로 만들면, 같은 공유기에 연결된 휴대폰 브라우저에서 보드를 조종할 수 있습니다.</p>
<p>업로드 후 시리얼 모니터에 나온 IP 주소(예: <code>192.168.0.23</code>)를 휴대폰 브라우저 주소창에 입력하세요.</p>
<p><code>server.on("/주소", 함수)</code>로 주소마다 할 일을 정하고, <code>loop()</code>에서 <code>server.handleClient()</code>를 계속 불러야 요청을 처리합니다.</p>`,
 code: `#include <WiFi.h>
#include <WebServer.h>

const char* SSID = "공유기이름";
const char* PASS = "비밀번호";
const int LED = 2;

WebServer server(80);
bool ledOn = false;

String page() {
  String s = "<!doctype html><meta name=viewport content='width=device-width'>";
  s += "<h1>LED: " + String(ledOn ? "켜짐" : "꺼짐") + "</h1>";
  s += "<p><a href='/on'><button>켜기</button></a> ";
  s += "<a href='/off'><button>끄기</button></a></p>";
  return s;
}

void setup() {
  Serial.begin(115200);
  pinMode(LED, OUTPUT);
  WiFi.begin(SSID, PASS);
  while (WiFi.status() != WL_CONNECTED) delay(300);
  Serial.println(WiFi.localIP());

  server.on("/", [] { server.send(200, "text/html; charset=utf-8", page()); });
  server.on("/on", [] {
    ledOn = true;  digitalWrite(LED, HIGH);
    server.sendHeader("Location", "/"); server.send(303);
  });
  server.on("/off", [] {
    ledOn = false; digitalWrite(LED, LOW);
    server.sendHeader("Location", "/"); server.send(303);
  });
  server.begin();
}

void loop() {
  server.handleClient();
}`,
 task: '3-1강의 가변저항 값을 보여주는 <code>/adc</code> 주소를 추가해 보세요.'},

{id: '5-3', ch: 5, title: '인터넷 시간 받기 (NTP)', min: 10,
 body: `<p>ESP32에는 시계 배터리가 없어서 전원을 켤 때마다 시간을 모릅니다. Wi-Fi에 연결되어 있으면 인터넷의 시간 서버(NTP)에서 정확한 시각을 받아올 수 있습니다.</p>
<p><code>configTime(시차초, 서머타임초, 서버)</code>에 한국 표준시(UTC+9)를 넣으면 <code>getLocalTime()</code>이 한국 시각을 돌려줍니다.</p>`,
 code: `#include <WiFi.h>
#include <time.h>

const char* SSID = "공유기이름";
const char* PASS = "비밀번호";

void setup() {
  Serial.begin(115200);
  WiFi.begin(SSID, PASS);
  while (WiFi.status() != WL_CONNECTED) delay(300);

  configTime(9 * 3600, 0, "pool.ntp.org", "time.google.com");
}

void loop() {
  struct tm t;
  if (getLocalTime(&t)) {
    Serial.printf("%04d-%02d-%02d %02d:%02d:%02d\\n",
      t.tm_year + 1900, t.tm_mon + 1, t.tm_mday,
      t.tm_hour, t.tm_min, t.tm_sec);
  } else {
    Serial.println("시간 받는 중...");
  }
  delay(1000);
}`,
 task: '매 정각(분과 초가 0일 때)에 LED가 세 번 깜빡이는 "시보"를 만들어 보세요.'},

// ---------------------------------------------------------------- 6단원
{id: '6-1', ch: 6, title: '딥슬립으로 전기 아끼기', min: 15,
 body: `<p>배터리로 오래 쓰려면 일하지 않을 때 잠들어야 합니다. <b>딥슬립</b> 중에는 CPU와 Wi-Fi가 꺼지고 수 µA~수십 µA만 씁니다(개발 보드는 USB 칩과 전원 LED 때문에 이보다 많이 씁니다).</p>
<ul>
<li>딥슬립에서 깨어나면 <b>처음부터 다시 부팅</b>합니다. <code>loop()</code>로 돌아가지 않습니다.</li>
<li>일반 변수는 지워지지만, <code>RTC_DATA_ATTR</code>을 붙인 변수는 잠든 동안에도 남아 있습니다.</li>
</ul>`,
 code: `#define SLEEP_SEC 10

RTC_DATA_ATTR int bootCount = 0;   // 딥슬립을 거쳐도 유지됨

void setup() {
  Serial.begin(115200);
  delay(500);
  bootCount++;
  Serial.printf("%d번째 깨어남\\n", bootCount);

  // 여기서 센서를 읽고, 데이터를 보내는 등 할 일을 합니다

  esp_sleep_enable_timer_wakeup((uint64_t)SLEEP_SEC * 1000000ULL);
  Serial.println("10초 동안 잠듭니다");
  Serial.flush();
  esp_deep_sleep_start();
}

void loop() {}   // 실행되지 않음`,
 task: '<code>esp_sleep_get_wakeup_cause()</code>를 출력해서 첫 부팅과 타이머로 깬 경우를 구분해 보세요.'},

{id: '6-2', ch: 6, title: '꺼져도 남는 설정 저장', min: 10,
 body: `<p>전원을 꺼도 값을 기억하려면 플래시 메모리에 저장해야 합니다. ESP32에서는 <code>Preferences</code> 라이브러리로 이름(키)과 값을 쌍으로 쉽게 저장할 수 있습니다.</p>
<p>플래시는 쓰기 횟수에 한계가 있으니 <code>loop()</code>에서 계속 저장하지 말고, <b>값이 바뀔 때만</b> 저장하세요.</p>`,
 wiring: [['GPIO 18', '버튼 → GND']],
 code: `#include <Preferences.h>

Preferences prefs;
const int BTN = 18;
int count;

void setup() {
  Serial.begin(115200);
  pinMode(BTN, INPUT_PULLUP);
  prefs.begin("myapp", false);          // 저장 공간 이름
  count = prefs.getInt("count", 0);     // 없으면 0
  Serial.printf("지난번까지 누른 횟수: %d\\n", count);
}

void loop() {
  if (digitalRead(BTN) == LOW) {
    count++;
    prefs.putInt("count", count);       // 바뀔 때만 저장
    Serial.printf("저장됨: %d\\n", count);
    while (digitalRead(BTN) == LOW) delay(10);   // 뗄 때까지 기다림
    delay(30);
  }
}`,
 task: '5-1강의 Wi-Fi 이름과 비밀번호를 시리얼로 입력받아 저장하고, 다음 부팅부터 그 값으로 연결하게 만들어 보세요.'},

{id: '6-3', ch: 6, title: '미니 프로젝트: 휴대폰 밝기 측정기', min: 30,
 body: `<p>지금까지 배운 것을 모아 봅시다. 조도 센서(CdS)로 방의 밝기를 재고, 휴대폰 브라우저에서 실시간 그래프로 봅니다.</p>
<ul>
<li>3-1강: ADC로 전압 읽기</li>
<li>4-2강: <code>millis()</code>로 1초마다 측정</li>
<li>5-2강: 웹 서버</li>
</ul>
<p>웹 페이지는 1초마다 <code>/data</code>에 요청해서 JSON으로 값을 받고, 직접 그린 막대그래프에 이어 붙입니다.</p>`,
 wiring: [['CdS 한쪽', '3.3V'], ['CdS 다른 쪽', 'GPIO 34, 그리고 10 kΩ 저항 → GND']],
 code: `#include <WiFi.h>
#include <WebServer.h>

const char* SSID = "공유기이름";
const char* PASS = "비밀번호";
const int LDR = 34;

WebServer server(80);
int light = 0;
unsigned long lastRead = 0;

const char PAGE[] PROGMEM = R"HTML(
<!doctype html><meta charset=utf-8>
<meta name=viewport content="width=device-width">
<h2>밝기 <span id=v>-</span>%</h2>
<canvas id=c width=320 height=120 style="border:1px solid #ccc"></canvas>
<script>
const c = document.getElementById('c').getContext('2d'), h = [];
setInterval(async () => {
  const d = await (await fetch('/data')).json();
  document.getElementById('v').textContent = d.light;
  h.push(d.light); if (h.length > 64) h.shift();
  c.clearRect(0, 0, 320, 120);
  h.forEach((x, i) => c.fillRect(i * 5, 120 - x * 1.2, 4, x * 1.2));
}, 1000);
</script>
)HTML";

void setup() {
  Serial.begin(115200);
  WiFi.begin(SSID, PASS);
  while (WiFi.status() != WL_CONNECTED) delay(300);
  Serial.println(WiFi.localIP());

  server.on("/", [] { server.send_P(200, "text/html", PAGE); });
  server.on("/data", [] {
    server.send(200, "application/json", "{\\"light\\":" + String(light) + "}");
  });
  server.begin();
}

void loop() {
  server.handleClient();
  if (millis() - lastRead >= 1000) {
    lastRead = millis();
    light = map(analogRead(LDR), 0, 4095, 0, 100);
  }
}`,
 task: '밝기가 20% 아래로 떨어지면 LED가 켜지는 "자동 야간등" 기능을 더해 보세요. 기준값은 6-2강처럼 저장해 두면 더 좋습니다.'},
];

const PARTS = [
  ['ESP32 DevKit 보드', '30핀 또는 38핀 ESP32-WROOM-32', 1],
  ['USB 케이블', '데이터 전송이 되는 것 (보드 단자에 맞게 Micro-B 또는 C)', 1],
  ['브레드보드', '830홀 크기면 넉넉합니다', 1],
  ['LED', '빨강·노랑·초록 등', 3],
  ['저항 220~330 Ω', 'LED용', 3],
  ['택트 스위치', '버튼', 2],
  ['가변저항 10 kΩ', '아날로그 입력용', 1],
  ['조도 센서(CdS) + 10 kΩ 저항', '6-3강 미니 프로젝트', 1],
  ['점퍼선', '수-수 여러 개', 20],
  ['I2C 모듈 (선택)', 'OLED SSD1306, BME280 등 무엇이든', 1],
];
