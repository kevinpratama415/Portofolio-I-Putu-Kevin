void setupFuzzy(){
  // Fuzzy sets for soil moisture
  FuzzySet *soil_Kering = new FuzzySet(-1, 0, 20, 25);
  FuzzySet *soil_Lembab = new FuzzySet(20, 35, 40, 50);
  FuzzySet *soil_Basah = new FuzzySet(45, 55, 75, 110);

  // Fuzzy sets for pH value
  FuzzySet *pHValue_Asam = new FuzzySet(-1, 0, 4, 6);
  FuzzySet *pHValue_Normal = new FuzzySet(5.5, 6, 6.5, 7.5);
  FuzzySet *pHValue_Basa = new FuzzySet(7.45, 9, 11, 14);

  // Fuzzy sets for water pump (Pompa1)
  FuzzySet *Pompa1_Off      = new FuzzySet(0, 0, 0, 1000);    // Mati
  FuzzySet *Pompa1_Sebentar = new FuzzySet(1000, 3000, 5000, 7000); // 1–7 detik
  FuzzySet *Pompa1_Lama     = new FuzzySet(6000, 8000, 10000, 12000); // 6–12 detik

  // Fuzzy sets for fertilizer pump (Pompa2)
  FuzzySet *Pompa2_Off      = new FuzzySet(0, 0, 0, 1000);    // Mati
  FuzzySet *Pompa2_Sebentar = new FuzzySet(1000, 3000, 5000, 7000); // 1–7 detik
  FuzzySet *Pompa2_Lama     = new FuzzySet(6000, 8000, 10000, 12000); // 6–12 detik

  FuzzyInput *soilMoistureInput = new FuzzyInput(1);
  soilMoistureInput->addFuzzySet(soil_Kering);
  soilMoistureInput->addFuzzySet(soil_Lembab);
  soilMoistureInput->addFuzzySet(soil_Basah);
  fuzzy->addFuzzyInput(soilMoistureInput);

  FuzzyInput *pHInput = new FuzzyInput(2);
  pHInput->addFuzzySet(pHValue_Asam);
  pHInput->addFuzzySet(pHValue_Normal);
  pHInput->addFuzzySet(pHValue_Basa);
  fuzzy->addFuzzyInput(pHInput);

  FuzzyOutput *pompaAir = new FuzzyOutput(1);
  pompaAir->addFuzzySet(Pompa1_Off);
  pompaAir->addFuzzySet(Pompa1_Sebentar);
  pompaAir->addFuzzySet(Pompa1_Lama);
  fuzzy->addFuzzyOutput(pompaAir);

  FuzzyOutput *pompaPupuk = new FuzzyOutput(2);
  pompaPupuk->addFuzzySet(Pompa2_Off);
  pompaPupuk->addFuzzySet(Pompa2_Sebentar);
  pompaPupuk->addFuzzySet(Pompa2_Lama);
  fuzzy->addFuzzyOutput(pompaPupuk);

  /// Rule 1: Kering & Asam → Air Lama, Pupuk Sebentar
  FuzzyRuleAntecedent *ifKeringAndAsam = new FuzzyRuleAntecedent();
  ifKeringAndAsam->joinWithAND(soil_Kering, pHValue_Asam);
  FuzzyRuleConsequent *thenAirLamaPupukSebentar = new FuzzyRuleConsequent();
  thenAirLamaPupukSebentar->addOutput(Pompa1_Lama);
  thenAirLamaPupukSebentar->addOutput(Pompa2_Sebentar);
  fuzzy->addFuzzyRule(new FuzzyRule(1, ifKeringAndAsam, thenAirLamaPupukSebentar));

  // Rule 2: Kering & Normal → Air Lama, Pupuk Off
  FuzzyRuleAntecedent *ifKeringAndNormal = new FuzzyRuleAntecedent();
  ifKeringAndNormal->joinWithAND(soil_Kering, pHValue_Normal);
  FuzzyRuleConsequent *thenAirLamaPupukOff = new FuzzyRuleConsequent();
  thenAirLamaPupukOff->addOutput(Pompa1_Lama);
  thenAirLamaPupukOff->addOutput(Pompa2_Off);
  fuzzy->addFuzzyRule(new FuzzyRule(2, ifKeringAndNormal, thenAirLamaPupukOff));

  // Rule 3: Kering & Basa → Air Lama, Pupuk Lama
  FuzzyRuleAntecedent *ifKeringAndBasa = new FuzzyRuleAntecedent();
  ifKeringAndBasa->joinWithAND(soil_Kering, pHValue_Basa);
  FuzzyRuleConsequent *thenAirLamaPupukLama = new FuzzyRuleConsequent();
  thenAirLamaPupukLama->addOutput(Pompa1_Lama);
  thenAirLamaPupukLama->addOutput(Pompa2_Lama);
  fuzzy->addFuzzyRule(new FuzzyRule(3, ifKeringAndBasa, thenAirLamaPupukLama));

  // Rule 4: Lembab & Asam → Air Sebentar, Pupuk Sebentar
  FuzzyRuleAntecedent *ifLembabAndAsam = new FuzzyRuleAntecedent();
  ifLembabAndAsam->joinWithAND(soil_Lembab, pHValue_Asam);
  FuzzyRuleConsequent *thenAirSebentarPupukSebentar = new FuzzyRuleConsequent();
  thenAirSebentarPupukSebentar->addOutput(Pompa1_Sebentar);
  thenAirSebentarPupukSebentar->addOutput(Pompa2_Sebentar);
  fuzzy->addFuzzyRule(new FuzzyRule(4, ifLembabAndAsam, thenAirSebentarPupukSebentar));

  // Rule 5: Lembab & Normal → Air Sebentar, Pupuk Off
  FuzzyRuleAntecedent *ifLembabAndNormal = new FuzzyRuleAntecedent();
  ifLembabAndNormal->joinWithAND(soil_Lembab, pHValue_Normal);
  FuzzyRuleConsequent *thenAirSebentarPupukOff = new FuzzyRuleConsequent();
  thenAirSebentarPupukOff->addOutput(Pompa1_Sebentar);
  thenAirSebentarPupukOff->addOutput(Pompa2_Off);
  fuzzy->addFuzzyRule(new FuzzyRule(5, ifLembabAndNormal, thenAirSebentarPupukOff));

  // Rule 6: Lembab & Basa → Air Sebentar, Pupuk Lama
  FuzzyRuleAntecedent *ifLembabAndBasa = new FuzzyRuleAntecedent();
  ifLembabAndBasa->joinWithAND(soil_Lembab, pHValue_Basa);
  FuzzyRuleConsequent *thenAirSebentarPupukLama = new FuzzyRuleConsequent();
  thenAirSebentarPupukLama->addOutput(Pompa1_Sebentar);
  thenAirSebentarPupukLama->addOutput(Pompa2_Lama);
  fuzzy->addFuzzyRule(new FuzzyRule(6, ifLembabAndBasa, thenAirSebentarPupukLama));

  // Rule 7: Basah & Asam → Air Off, Pupuk Sebentar
  FuzzyRuleAntecedent *ifBasahAndAsam = new FuzzyRuleAntecedent();
  ifBasahAndAsam->joinWithAND(soil_Basah, pHValue_Asam);
  FuzzyRuleConsequent *thenAirOffPupukSebentar = new FuzzyRuleConsequent();
  thenAirOffPupukSebentar->addOutput(Pompa1_Off);
  thenAirOffPupukSebentar->addOutput(Pompa2_Sebentar);
  fuzzy->addFuzzyRule(new FuzzyRule(7, ifBasahAndAsam, thenAirOffPupukSebentar));

  // Rule 8: Basah & Normal → Air Off, Pupuk Off
  FuzzyRuleAntecedent *ifBasahAndNormal = new FuzzyRuleAntecedent();
  ifBasahAndNormal->joinWithAND(soil_Basah, pHValue_Normal);
  FuzzyRuleConsequent *thenAirOffPupukOff = new FuzzyRuleConsequent();
  thenAirOffPupukOff->addOutput(Pompa1_Off);
  thenAirOffPupukOff->addOutput(Pompa2_Off);
  fuzzy->addFuzzyRule(new FuzzyRule(8, ifBasahAndNormal, thenAirOffPupukOff));

  // Rule 9: Basah & Basa → Air Off, Pupuk Lama
  FuzzyRuleAntecedent *ifBasahAndBasa = new FuzzyRuleAntecedent();
  ifBasahAndBasa->joinWithAND(soil_Basah, pHValue_Basa);
  FuzzyRuleConsequent *thenAirOffPupukLama = new FuzzyRuleConsequent();
  thenAirOffPupukLama->addOutput(Pompa1_Off);
  thenAirOffPupukLama->addOutput(Pompa2_Lama);
  fuzzy->addFuzzyRule(new FuzzyRule(9, ifBasahAndBasa, thenAirOffPupukLama));

}