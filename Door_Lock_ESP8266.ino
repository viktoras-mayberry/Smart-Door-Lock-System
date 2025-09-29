#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <WiFiManager.h>

const char* AUTH_KEY = "CHANGE_THIS_KEY";  // <-- change this
ESP8266WebServer server(80);
const unsigned long UNO_SERIAL_TIMEOUT = 1200; // ms
WiFiManager wm;

String sendToUnoAndWait(const String &cmd, unsigned long timeout = UNO_SERIAL_TIMEOUT) {
  // clear buffer
  while (Serial.available()) Serial.read();

  // send command
  Serial.println(cmd);

  unsigned long start = millis();
  String buf = "";
  while (millis() - start < timeout) {
    while (Serial.available()) {
      char c = (char)Serial.read();
      if (c == '\r') continue;
      if (c == '\n') {
        buf.trim();
        if (buf.length() > 0) return buf;
        // else keep waiting for a non-empty line
      } else {
        buf += c;
      }
    }
    yield();
  }
  return ""; // timeout
}

bool checkKey() {
  if (server.hasArg("key") && server.arg("key") == AUTH_KEY) return true;
  server.send(403, "application/json", "{\"error\":\"invalid or missing key\"}");
  return false;
}

void handleLock() {
  if (!checkKey()) return;
  String reply = sendToUnoAndWait("LOCK");
  if (reply.length() == 0) server.send(504, "application/json", "{\"error\":\"no response from controller\"}");
  else server.send(200, "application/json", "{\"door\":\"" + reply + "\"}");
}

void handleUnlock() {
  if (!checkKey()) return;
  String reply = sendToUnoAndWait("UNLOCK");
  if (reply.length() == 0) server.send(504, "application/json", "{\"error\":\"no response from controller\"}");
  else server.send(200, "application/json", "{\"door\":\"" + reply + "\"}");
}

void handleStatus() {
  if (!checkKey()) return;
  String reply = sendToUnoAndWait("STATUS");
  if (reply.length() == 0) server.send(504, "application/json", "{\"error\":\"no response from controller\"}");
  else server.send(200, "application/json", "{\"door\":\"" + reply + "\"}");
}

void handleNotFound() {
  server.send(404, "text/plain", "Not found");
}

void setup() {
  Serial.begin(9600); // must match Uno
  delay(100);

  
  // Uncomment to force portal every boot while testing
  // wm.resetSettings();
  if (!wm.autoConnect("ESP_Lock_Setup", "12345678")) {
    ESP.restart();
    return;
  }

  server.on("/lock",   HTTP_GET, handleLock);
  server.on("/unlock", HTTP_GET, handleUnlock);
  server.on("/status", HTTP_GET, handleStatus);
  server.onNotFound(handleNotFound);
  server.begin();

  Serial.println();
  Serial.print("Connected. IP: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  server.handleClient();
  // debug: print any unsolicited lines from Uno
  if (Serial.available()) {
    String s = Serial.readStringUntil('\n');
    s.trim();
    if (s.length()) Serial.printf("UNO -> %s\n", s.c_str());
  }
}
