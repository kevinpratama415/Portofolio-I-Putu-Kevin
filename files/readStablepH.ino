float readStablepH() {
    const int numSamples = 10;
    float total = 0;

    digitalWrite(indikator, HIGH);
    digitalWrite(DMSpin, HIGH);
    delay(2000);

    for (int i = 0; i < numSamples; i++) {
        int ADC = analogRead(adcPin);
        float pH  = (-0.0333 * ADC) + 6.954;  // RUMUS BARU
        pH = constrain(pH, 0.0, 14.0);
        total += pH;
        delay(5);
    }

    digitalWrite(indikator, LOW);
    delay(1000);

    return kalmanFilter(total / numSamples);
}
