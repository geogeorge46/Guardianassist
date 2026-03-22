#include <WiFi.h>
#include <Wire.h>
#include <MPU6050.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <Firebase_ESP_Client.h>

// ===== WiFi =====
const char* ssid = "laptop";
const char* password = "123456789";

// ===== Firebase =====
#define DATABASE_URL "guardianassist-e4e62-default-rtdb.firebaseio.com"
#define DATABASE_SECRET "1BtnboyhUVO0I7S5aJLTXJZBj569CpnKOPEfxxVR"

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// ===== Signal API =====
String apiKey = "825517";              
String phone_number = "+919446543476"; 

// ===== PINS =====
#define TRIG_PIN 17
#define ECHO_PIN 18
#define BUZZER_PIN 23
#define VIBRATION_PIN 25
#define LDR_PIN 34
#define LED_PIN 2
#define HELP_BUTTON_PIN 4

// ===== ULTRASONIC =====
float distance;

// ===== LDR =====
int ldrValue = 0;
int darkThreshold = 2000;

// ===== MPU =====
MPU6050 mpu;
int16_t ax_raw, ay_raw, az_raw;
float ax, ay, az, magnitude;

// ===== FALL DETECTION =====
float freeFallThreshold = 5.0;
float impactThreshold = 10.0;
bool freeFallDetected = false;
unsigned long fallTime = 0;

// ===== STEP COUNTER =====
int stepCount = 0;
bool stepDetected = false;
float filteredZ = 0;
float stepThreshold = 11.0;
float minThreshold = 9.5;
unsigned long lastStepTime = 0;
int stepDelay = 250;

// ===== IDLE =====
const long idleTime = 240000; // 4 minutes

// ===== WIFI & SYNC =====
unsigned long previousWiFiAttempt = 0;
const long wifiInterval = 10000;
unsigned long lastSyncTime = 0;

// ===== HELP BUTTON =====
bool lastButtonState = HIGH;
bool manualAlert = false;

// ===== DISTANCE ALERTS (PULSING LOGIC TO PREVENT BUZZER CRASH) =====
unsigned long lastDistanceBeep = 0;
bool buzzerToggle = false;

// ====================== SETUP ======================
void setup() {
  Serial.begin(115200);
  Wire.begin();

  // Pins
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(VIBRATION_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  pinMode(HELP_BUTTON_PIN, INPUT_PULLUP);
  
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(VIBRATION_PIN, LOW);
  digitalWrite(LED_PIN, LOW);

  // MPU
  mpu.initialize();

  // WiFi
  WiFi.begin(ssid, password);
  Serial.println("Connecting to WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi");

  // Firebase
  config.database_url = DATABASE_URL;
  config.signer.tokens.legacy_token = DATABASE_SECRET;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

// ====================== SIGNAL MESSAGE ======================
String urlencode(String str){
  String encodedString="";
  char c;
  for(int i=0;i<str.length();i++){
    c=str.charAt(i);
    if(c==' ') encodedString+='+'; 
    else if(isalnum(c)) encodedString+=c;
    else {
      char code1=(c&0xf)+'0';
      char code0=((c>>4)&0xf)+'0';
      encodedString+='%'; encodedString+=code0; encodedString+=code1;
    }
  }
  return encodedString;
}

void sendSignalMessage(String message){
  if(WiFi.status()==WL_CONNECTED){
    WiFiClientSecure client;
    client.setInsecure(); // Ignore SSL certificate warnings
    HTTPClient http;
    
    // CRITICAL FIX: The phone number MUST be url-encoded so the "+" isn't seen as a space by the server!
    String url = "https://api.callmebot.com/signal/send.php?phone=" + urlencode(phone_number) + 
                 "&apikey=" + apiKey + 
                 "&text=" + urlencode(message);
                 
    Serial.println("Attempting to send Signal message...");
    if(http.begin(client, url)){
      int httpCode = http.GET();
      if (httpCode > 0) {
        Serial.printf("[Signal] Message sent. HTTP Response code: %d\n", httpCode);
        String payload = http.getString();
        Serial.println("[Signal] Server Reply: " + payload);
      } else {
        Serial.printf("[Signal] HTTP GET failed, error: %s\n", http.errorToString(httpCode).c_str());
      }
      http.end();
    } else {
      Serial.println("[Signal] Unable to connect to CallMeBot API.");
    }
  } else {
    Serial.println("[Signal] Cannot send message, WiFi disconnected.");
  }
}

// ====================== BUZZER & VIBRATION ======================
void triggerBuzzerAndVibration() {
  for(int i=0; i<5; i++){
    tone(BUZZER_PIN, 2000);
    digitalWrite(VIBRATION_PIN, HIGH);
    digitalWrite(LED_PIN, HIGH);
    delay(200);
    noTone(BUZZER_PIN);
    digitalWrite(VIBRATION_PIN, LOW);
    digitalWrite(LED_PIN, LOW);
    delay(200);
  }
}

// ====================== ULTRASONIC ======================
float readDistance(){
  digitalWrite(TRIG_PIN,LOW); delayMicroseconds(2);
  digitalWrite(TRIG_PIN,HIGH); delayMicroseconds(10);
  digitalWrite(TRIG_PIN,LOW);
  long dur = pulseIn(ECHO_PIN,HIGH,30000);
  distance = (dur==0)?999:dur*0.034/2;
  return distance;
}

// ====================== LDR ======================
void readLDR(){
  ldrValue = analogRead(LDR_PIN);
  digitalWrite(LED_PIN, ldrValue < darkThreshold ? HIGH : LOW);
}

// ====================== MPU & FALL ======================
void readMPUAndCheckFall(){
  mpu.getAcceleration(&ax_raw,&ay_raw,&az_raw);
  ax=ax_raw/16384.0*9.81;
  ay=ay_raw/16384.0*9.81;
  az=az_raw/16384.0*9.81;
  magnitude=sqrt(ax*ax+ay*ay+az*az);

  // Step Counter
  filteredZ=0.7*filteredZ+0.3*az;
  if(!stepDetected && filteredZ>stepThreshold && (millis()-lastStepTime>stepDelay)){
    stepDetected=true;
    stepCount++;
    lastStepTime=millis();
  }
  if(filteredZ<minThreshold) stepDetected=false;

  // Fall detection
  if(magnitude<freeFallThreshold){
    freeFallDetected=true;
    fallTime=millis();
  }
}

// ====================== HELP BUTTON ======================
void checkHelpButton(){
  int currentButtonState=digitalRead(HELP_BUTTON_PIN);
  if(currentButtonState==LOW && lastButtonState==HIGH){
    manualAlert=true;
  }
  lastButtonState=currentButtonState;
}

// ====================== ALERT HANDLERS ======================
void handleDistanceAlert() {
  // CRITICAL FIX: You MUST pulse the buzzer instead of leaving tone() running infinitely every loop.
  // Spamming tone() without a delay breaks the ESP32 PWM timer, causing complete silence.
  int beepInterval = 0;
  if(distance < 20) beepInterval = 100;      // very close, fast beep
  else if(distance < 40) beepInterval = 300; // medium beep
  else if(distance < 60) beepInterval = 600; // slow beep

  if(beepInterval > 0) {
    if (millis() - lastDistanceBeep > beepInterval) {
      lastDistanceBeep = millis();
      buzzerToggle = !buzzerToggle; 
      
      if (buzzerToggle) {
        tone(BUZZER_PIN, 2500);
        digitalWrite(VIBRATION_PIN, HIGH);
      } else {
        noTone(BUZZER_PIN);
        digitalWrite(VIBRATION_PIN, LOW);
      }
    }
  } else {
    noTone(BUZZER_PIN);
    digitalWrite(VIBRATION_PIN, LOW);
  }
}

void handleIdleAlert() {
  static unsigned long idleStartTime = millis();
  if(magnitude > 9.0 && magnitude < 10.5){  
    if(millis() - idleStartTime > idleTime){
      Serial.println("⚠️ Idle Alert triggered!");
      sendSignalMessage("⚠️ Idle alert detected! Please move or check status.");
      triggerBuzzerAndVibration();
      logAlertToFirebase("Idle Alert");
      idleStartTime = millis(); 
    }
  } else {
    idleStartTime = millis(); 
  }
}

void handleFallAlert() {
  static bool fallAlreadyReported = false;

  if(freeFallDetected && magnitude > impactThreshold && !fallAlreadyReported){
    Serial.println("💥 FALL DETECTED!");
    sendSignalMessage("💥 Fall detected! Immediate assistance needed!");
    triggerBuzzerAndVibration();
    logAlertToFirebase("Fall Detected");

    // Push the flag to the website so push notifications work!
    if (Firebase.ready()) Firebase.RTDB.setBool(&fbdo, "/stick/fall", true);

    freeFallDetected = false;
    fallAlreadyReported = true;
  }

  if(fallAlreadyReported && millis() - fallTime > 3000){
    fallAlreadyReported = false;
  }
}

void handleManualAlert() {
  if(manualAlert){
    Serial.println("⚠️ Manual Help Button Pressed!");
    sendSignalMessage("⚠️ Emergency! Help button triggered!");
    triggerBuzzerAndVibration();
    logAlertToFirebase("Manual SOS Pressed");
    
    // Push the flag to the website so push notifications work!
    if (Firebase.ready()) Firebase.RTDB.setBool(&fbdo, "/stick/manualAlert", true);

    manualAlert = false;
  }
}

// ====================== FIREBASE SYNC ======================
void syncWithDashboard() {
  if (Firebase.ready()) {
    // 1. UPDATE SENSORS TO WEBSITE
    if (millis() - lastSyncTime > 800) {
      lastSyncTime = millis();
      FirebaseJson json;
      json.set("heartbeat", (double)millis()); // Continuously changing number so website knows it's alive
      json.set("distance", distance);
      json.set("light", ldrValue);
      json.set("steps", stepCount);
      json.set("accel/x", ax);
      json.set("accel/y", ay);
      json.set("accel/z", az);
      Firebase.RTDB.updateNode(&fbdo, "/stick", &json);
    }
    
    // 2. CHECK REMOTE COMMANDS FROM WEBSITE (Find Me & Force LED)
    // IMPORTANT: You deleted these lines in your last version, which is why it stopped working!
    if (Firebase.RTDB.getBool(&fbdo, "/stick/findMe")) {
      if (fbdo.boolData() == true) {
        Serial.println("FIND MY STICK TRIGGERED!");
        triggerBuzzerAndVibration();
        // Turn it off so it doesn't vibrate forever
        Firebase.RTDB.setBool(&fbdo, "/stick/findMe", false);
      }
    }
    
    if (Firebase.RTDB.getBool(&fbdo, "/stick/led_manual")) {
        if (fbdo.boolData() == true) {
            digitalWrite(LED_PIN, HIGH);
        }
    }
  }
}

void logAlertToFirebase(String alert){
  if(Firebase.ready()){
    String timestamp=String(millis());
    String path="/guardianAssist/alerts/"+timestamp;
    FirebaseJson json;
    json.set("message",alert);
    json.set("distance",distance);
    Firebase.RTDB.updateNode(&fbdo,path,&json);
    Firebase.RTDB.setString(&fbdo,"/stick/lastAlert",alert);
  }
}

// ====================== MAIN LOOP ======================
void loop() {
  // WiFi reconnect
  if(WiFi.status() != WL_CONNECTED && millis() - previousWiFiAttempt > wifiInterval){
    previousWiFiAttempt = millis();
    WiFi.begin(ssid,password);
  }

  readDistance();
  readLDR();
  readMPUAndCheckFall();
  checkHelpButton();

  handleDistanceAlert();
  handleIdleAlert();
  handleFallAlert();
  handleManualAlert();

  syncWithDashboard();

  delay(50);
}