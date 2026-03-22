#ifndef SECRETS_H
#define SECRETS_H

#include <Arduino.h>

// ===== WiFi =====
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// ===== Firebase =====
#define DATABASE_URL "YOUR_PROJECT-default-rtdb.firebaseio.com"
#define DATABASE_SECRET "YOUR_FIREBASE_DATABASE_SECRET"

// ===== Signal API =====
String apiKey = "YOUR_CALLMEBOT_API_KEY";              
String phone_number = "+1234567890"; 

#endif
