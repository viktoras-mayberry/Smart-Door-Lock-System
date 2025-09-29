#include <SoftwareSerial.h>
#include "VoiceRecognitionV3.h"

/* ---------------- Pin definitions ---------------- */
#define VOICE_RX_PIN 2    // Elechouse TX -> Arduino 2
#define VOICE_TX_PIN 3    // Elechouse RX <- Arduino 3
#define BUZZER_PIN   4
#define RELAY_PIN    5

/* ------------ Voice command IDs -------------------
   Train the VoiceRecognition module with:
      0 -> "close"   (lock the door)
      1 -> "open"    (unlock the door)
---------------------------------------------------- */
#define CMD_CLOSE   0   // spoken word: "close"
#define CMD_OPEN    1   // spoken word: "open"

VR myVR(VOICE_RX_PIN, VOICE_TX_PIN);   // voice module on pins 2/3
uint8_t vrBuf[64];
bool doorLocked = false;               // status flag

/* ------------ Buzzer tone patterns --------------- */
void beep(int freq,int dur){ tone(BUZZER_PIN,freq,dur); delay(dur+20); }
void lockSound(){   beep(1500,100); beep(1000,120); }
void unlockSound(){ beep(800,100);  beep(1300,120); }
void statusSound(){ beep(1000,80); }

/* ------------ Door actions ----------------------- */
void lockDoor() {
  digitalWrite(RELAY_PIN, HIGH);     // energise relay to lock
  doorLocked = true;
  Serial.println("locked");          // reply to ESP8266
  lockSound();
}
void unlockDoor() {
  digitalWrite(RELAY_PIN, LOW);      // de-energise relay to unlock
  doorLocked = false;
  Serial.println("unlocked");
  unlockSound();
}
void reportStatus() {
  Serial.println(doorLocked ? "locked" : "unlocked");
  statusSound();
}

/* ------------ Optional debug print --------------- */
void printVR(uint8_t *buf) {
  Serial.print("VR-> Group:");
  if(buf[0]==0xFF) Serial.print("NONE");
  else if(buf[0]&0x80) { Serial.print("UG "); Serial.print(buf[0]&(~0x80)); }
  else { Serial.print("SG "); Serial.print(buf[0]); }
  Serial.print("  RecNum:"); Serial.print(buf[1]);
  Serial.print("  Sig: ");
  for(int i=4;i<4+buf[3];i++){
    if(buf[i]>0x19 && buf[i]<0x7F) Serial.write(buf[i]);
    else { Serial.print("["); Serial.print(buf[i],HEX); Serial.print("]"); }
  }
  Serial.println();
}

/* ------------------------------------------------- */
void setup() {
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);     // start unlocked

  Serial.begin(9600);               // Hardware serial to ESP8266
  myVR.begin(9600);                 // Voice module serial

  if(myVR.clear() == 0) {
    Serial.println("Voice recognizer ready");
  } else {
    Serial.println("Voice module not found!");
    while(1);
  }

  // Load trained voice commands
  myVR.load((uint8_t)CMD_CLOSE);
  myVR.load((uint8_t)CMD_OPEN);
}

/* ------------------------------------------------- */
void loop() {
  /* ---- 1. Voice recognition ---- */
  if (myVR.recognize(vrBuf, 50) > 0) {
    switch (vrBuf[1]) {
      case CMD_CLOSE:  lockDoor();   break;   // "close" -> lock
      case CMD_OPEN:   unlockDoor(); break;   // "open"  -> unlock
      default: Serial.println("Unassigned voice record"); break;
    }
    printVR(vrBuf);  // optional debugging
  }

  /* ---- 2. Commands from ESP8266 ----
     The ESP8266 sends a text line:
       LOCK, UNLOCK, or STATUS
  */
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    if      (cmd.equalsIgnoreCase("LOCK"))   lockDoor();
    else if (cmd.equalsIgnoreCase("UNLOCK")) unlockDoor();
    else if (cmd.equalsIgnoreCase("STATUS")) reportStatus();
  }
}
