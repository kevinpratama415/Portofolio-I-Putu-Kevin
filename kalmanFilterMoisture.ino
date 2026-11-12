float kalmanFilterMoisture(float measurement) {
  static float estimate = 50.0;     // perkiraan awal (misalnya 50% kelembaban)
  static float errorEst = 1.0;      // error estimasi awal
  const float errorMeasure = 4.0;   // error pengukuran (noise sensor)
  const float q = 0.01;             // faktor adaptasi (semakin besar → lebih cepat ikut perubahan)

  // Hitung Kalman Gain
  float gain = errorEst / (errorEst + errorMeasure);

  // Update estimasi dengan data sensor
  estimate = estimate + gain * (measurement - estimate);

  // Update error estimasi (dengan tambahan faktor q agar lebih adaptif)
  errorEst = (1.0 - gain) * errorEst + fabs(estimate - measurement) * q;

  return estimate;
}
