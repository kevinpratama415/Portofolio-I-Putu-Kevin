void checkNotification(float pH, int moisture) {
  String soilStatus;
  if (moisture < 30) {
    soilStatus = "Tanah Kering";
  } else if (moisture > 50) {
    soilStatus = "Tanah Basah";
  } else {
    soilStatus = "Tanah Lembab";
  }

  String phStatus;
  if (pH < 6.0) {
    phStatus = "Tanah Asam";
  } else if (pH > 7.5) {
    phStatus = "Tanah Basa";
  } else {
    phStatus = "Tanah Normal";
  }

  // ✅ Tandai bahwa sensor soil pernah memberikan nilai valid
  if (moisture > 1) {
    soilSensorReady = true;
  }

  // 🔴 Notifikasi kritis hanya jika sensor sudah ready sebelumnya
  if (soilSensorReady && moisture <= 1 && !notifSentKritis) {
    String msg = "‼️ Sensor Kelembaban Tanah 0% - Periksa Koneksi atau Sensor!";
    Blynk.logEvent("sensor_kritis", msg);
    Serial.println("‼️ Notifikasi Kritis: " + msg);
    notifSentKritis = true;
  } else if (moisture > 1) {
    notifSentKritis = false;
  }

  // 🔄 Pompa1 ON
  if (pump1Active && !notifSentPompa1) {
    String msg = "Pompa Air Menyala - pH: " + phStatus + ", Kelembaban: " + soilStatus;
    Blynk.logEvent("pompa1_menyala", msg);
    Blynk.logEvent("status_tanaman", msg);
    Serial.println("Notifikasi Pompa1 + Status: " + msg);
    notifSentPompa1 = true;
  } else if (!pump1Active) {
    notifSentPompa1 = false;
  }

  // 🔄 Pompa2 ON
  if (pump2Active && !notifSentPompa2) {
    String msg = "Pompa Pupuk Menyala - pH: " + phStatus + ", Kelembaban: " + soilStatus;
    Blynk.logEvent("pompa2_menyala", msg);
    Blynk.logEvent("status_tanaman", msg);
    Serial.println("Notifikasi Pompa2 + Status: " + msg);
    notifSentPompa2 = true;
  } else if (!pump2Active) {
    notifSentPompa2 = false;
  }

  // 🔄 Kedua Pompa ON bersamaan
  static bool notifSentKeduaPompa = false;
  if (pump1Active && pump2Active && !notifSentKeduaPompa) {
    String msg = "Pompa Air & Pupuk Aktif Bersamaan - pH: " + phStatus + ", Kelembaban: " + soilStatus;
    Blynk.logEvent("kedua_pompa_menyala", msg);
    Blynk.logEvent("status_tanaman", msg);
    Serial.println("Notifikasi Kedua Pompa Aktif: " + msg);
    notifSentKeduaPompa = true;
  } else if (!pump1Active || !pump2Active) {
    notifSentKeduaPompa = false;
  }
}
