void updateLCD() {
    lcdLocked = true;
    lcd.clear();
    
    // Tampilkan status Pompa 1
    lcd.setCursor(0, 0);
    lcd.print("Pompa1: ");
    if (manualPump1) {
        lcd.print("Manual");
    } else if (pump1Active) {
        lcd.print("Otomatis");
    } else {
        lcd.print("OFF");
    }

    // Tampilkan status Pompa 2
    lcd.setCursor(0, 1);
    lcd.print("Pompa2: ");
    if (manualPump2) {
        lcd.print("Manual");
    } else if (pump2Active) {
        lcd.print("Otomatis");
    } else {
        lcd.print("OFF");
    }
    lcdLocked = false;
}
