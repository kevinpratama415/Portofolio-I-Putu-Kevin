#define BLYNK_TEMPLATE_ID "TMPL6oVUOuiGx"
#define BLYNK_TEMPLATE_NAME "Fuzzy"
#define BLYNK_AUTH_TOKEN "YOUR_BLYNK_AUTH_TOKEN"

#include <Fuzzy.h>
#include <SPI.h>
#include <LiquidCrystal_I2C.h>
#include <BlynkSimpleEsp32.h>
#include <Wire.h>
#include "esp_log.h"
#include <WiFiManager.h>

#define DMSpin  32
#define indikator  2
#define adcPin 35
#define Pompa1 16
#define Pompa2 17
#define SDA 21
#define SCL 22
#define moistureSensor 34
#define digitalPin 33 
#define SAMPLE_COUNT 10

//char ssid[] = "YOUR_WIFI_SSID";
//char pass[] = "YOUR_WIFI_PASSWORD";

LiquidCrystal_I2C lcd(0x27, 16, 2);
Fuzzy *fuzzy = new Fuzzy();

WiFiManager wm;
bool pump1Active = false, pump2Active = false;
bool manualPump1 = false, manualPump2 = false;
bool lcdLocked = false;
bool notifSentPompa1 = false;
bool notifSentPompa2 = false;
bool soilSensorReady = false;
static bool notifSentKritis = false;

// **Variabel Sensor Global**
int soilMoisture = 0;
float pHValue = 0.0;

String lastPHStatus = "";
String lastSoilStatus = "";

BlynkTimer timer;

void connectWiFiWithLCD() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Init WiFi...");
  lcd.setCursor(0, 1);
  lcd.print("Please wait");

  WiFi.mode(WIFI_STA);

  // Optional tapi sangat disarankan
  wm.setConfigPortalTimeout(180);

  // Callback saat masuk AP Mode
  wm.setAPCallback([](WiFiManager *myWiFiManager) {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi Config");
    lcd.setCursor(0, 1);
    lcd.print("ESP32-Fuzzy");
    Serial.println("Masuk WiFi Config Portal");
  });

  // Callback saat mencoba connect
  wm.setSaveConfigCallback([]() {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Connecting...");
    lcd.setCursor(0, 1);
    lcd.print("Please wait");
    Serial.println("Menyimpan WiFi config");
  });

  wm.resetSettings();
  bool res = wm.autoConnect("ESP32-Fuzzy", "12345678");

  if (!res) {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi Failed");
    lcd.setCursor(0, 1);
    lcd.print("Restarting");
    Serial.println("Gagal konek WiFi");
    delay(2000);
    ESP.restart();
  } else {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi Connected");
    lcd.setCursor(0, 1);
    lcd.print(WiFi.localIP());
    Serial.println("WiFi Connected");
    delay(2000);
  }
}

void setup() {
  WiFi.mode(WIFI_STA);
  Serial.begin(115200);
  analogSetPinAttenuation(34, ADC_11db);
  analogSetPinAttenuation(35, ADC_11db);
  analogReadResolution(10);

  pinMode(Pompa1, OUTPUT);
  pinMode(Pompa2, OUTPUT);
  pinMode(DMSpin, OUTPUT);
  pinMode(indikator, OUTPUT);
  pinMode(digitalPin, INPUT);
  pinMode(adcPin, INPUT);
  pinMode(moistureSensor, INPUT);

  digitalWrite(Pompa1, HIGH);
  digitalWrite(Pompa2, HIGH);
  digitalWrite(DMSpin, LOW);

  Wire.begin(SDA, SCL);
  lcd.begin();
  lcd.backlight();
  lcd.setCursor(0, 0);
  
  
lcd.clear();
lcd.setCursor(0, 0);
lcd.print("ESP32 Fuzzy");
lcd.setCursor(0, 1);
lcd.print("Starting...");

delay(1500);

// 🔥 Panggil fungsi WiFi + LCD
connectWiFiWithLCD();

  Blynk.config(BLYNK_AUTH_TOKEN);
  setupFuzzy();
  timer.setInterval(2000L, bacaSensor);       // Baca sensor tiap 2 detik
  timer.setInterval(1000L, kirimDataBlynk); // kirim setiap 1 detik

}
  // **Fungsi membaca sensor ADC dengan stabilisasi**
  int readStableADC(int pin, int sampleCount = 20) {
      if (sampleCount < 1) sampleCount = 1;
      uint32_t sum = 0;
      for (int i = 0; i < sampleCount; i++) {
          sum += analogRead(pin);
          delay(2);
      }
      return sum / sampleCount;
}

void bacaSensor() {
  // **Baca sensor jika tidak dalam mode manual**
  if (!manualPump1 && !manualPump2) {
    pHValue = readStablepH();
    int soilADC = readStableADC(moistureSensor, 20);
    soilMoisture = map(soilADC, 365, 260, 0, 100);
    soilMoisture = constrain(soilMoisture, 0, 100);
    
    // Masukkan ke Fuzzy Logic
    fuzzy->setInput(1, soilMoisture);
    fuzzy->setInput(2, pHValue);
    fuzzy->fuzzify();

    float Pompa1Output = fuzzy->defuzzify(1);
    float Pompa2Output = fuzzy->defuzzify(2);

    Serial.print("ADC Soil: "); Serial.println(soilADC);
    Serial.print("ADC PH: "); Serial.println(analogRead(adcPin));
    Serial.print("Soil Moisture: "); Serial.print(soilMoisture); Serial.println("%");
    Serial.print("pH Value: "); Serial.println(pHValue);
    Serial.print("Pompa1 Output: "); Serial.println(Pompa1Output);
    Serial.print("Pompa2 Output: "); Serial.println(Pompa2Output);

    // Pompa1 kontrol otomatis
    if (!manualPump1) {
      if (Pompa1Output > 500) {
        digitalWrite(Pompa1, LOW);
        pump1Active = true;
        Blynk.virtualWrite(V3, 1);
        Serial.println("Pompa1 NYALA (Otomatis)");
        updateLCD();
        checkNotification(pHValue, soilMoisture); // Notifikasi di sini
        delay(Pompa1Output);
        digitalWrite(Pompa1, HIGH);
        pump1Active = false;
        Blynk.virtualWrite(V3, 0);
        Serial.println("Pompa1 MATI");
        updateLCD();
      }
    }

    // Jeda sebelum Pompa2
    delay(1000);

    // Pompa2 kontrol otomatis
    if (!manualPump2) {
      if (Pompa2Output > 500) {
        digitalWrite(Pompa2, LOW);
        pump2Active = true;
        Blynk.virtualWrite(V4, 1);
        Serial.println("Pompa2 NYALA (Otomatis)");
        updateLCD();
         checkNotification(pHValue, soilMoisture); // Notifikasi di sini
        delay(Pompa2Output);
        digitalWrite(Pompa2, HIGH);
        pump2Active = false;
        Blynk.virtualWrite(V4, 0);
        Serial.println("Pompa2 MATI");
        updateLCD();
      }
    }

    if (!lcdLocked) {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Moist: ");
    lcd.print(soilMoisture);
    lcd.setCursor(0, 1);
    lcd.print("pH: ");
    lcd.print(pHValue, 2);
    }
  }
  delay(1000);
}

void controlPompa1(bool status) {
  digitalWrite(16, status);
  pump1Active = status;
  if (status) checkNotification(pHValue, soilMoisture);
}

void controlPompa2(bool status) {
  digitalWrite(17, status);
  pump2Active = status;
  if (status) checkNotification(pHValue, soilMoisture);
}

// Fungsi kirim ke Blynk
void kirimDataBlynk() {
  Blynk.virtualWrite(V1, soilMoisture);
  Blynk.virtualWrite(V2, pHValue);
  Blynk.virtualWrite(V3, pump1Active ? 1 : 0);
  Blynk.virtualWrite(V4, pump2Active ? 1 : 0);
}

// Tombol Pompa1 (Manual)
BLYNK_WRITE(V3) {
  int buttonState = param.asInt();
  manualPump1 = (buttonState == 1);
  if (manualPump1) {
    digitalWrite(Pompa1, LOW);
    pump1Active = true;
    Blynk.virtualWrite(V3, 1);
    Serial.println("Pompa1 NYALA (Manual)");
  } else {
    digitalWrite(Pompa1, HIGH);
    pump1Active = false;
    Blynk.virtualWrite(V3, 0);
    Serial.println("Pompa1 MATI (Manual)");
  }
}

// Tombol Pompa2 (Manual)
BLYNK_WRITE(V4) {
  int buttonState = param.asInt();
  manualPump2 = (buttonState == 1);
  if (manualPump2) {
    digitalWrite(Pompa2, LOW);
    pump2Active = true;
    Blynk.virtualWrite(V4, 1);
    Serial.println("Pompa2 NYALA (Manual)");
  } else {
    digitalWrite(Pompa2, HIGH);
    pump2Active = false;
    Blynk.virtualWrite(V4, 0);
    Serial.println("Pompa2 MATI (Manual)");
  }
}

void loop() {
  Blynk.run();
  timer.run();
  wm.process();
  
  Serial.print("Pump1: ");
  Serial.print(pump1Active);
  Serial.print(" | Pump2: ");
  Serial.println(pump2Active);

  checkNotification(pHValue, soilMoisture); // Pastikan nilai pH dan moisture valid
}