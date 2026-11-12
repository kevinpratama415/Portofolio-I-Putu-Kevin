//digunakan untuk menyaring dan menstabilkan nilai pH yang diukur oleh sensor
float kalmanFilter(float newValue) {
    static float estimate = 7.0;
    static float errorEstimate = 1.0;
    static float errorMeasure = 1.0;
    static float q = 0.01;

    float kalmanGain = errorEstimate / (errorEstimate + errorMeasure);
    estimate = estimate + kalmanGain * (newValue - estimate);
    errorEstimate = (1.0 - kalmanGain) * errorEstimate + fabs(estimate - newValue) * q;

    return estimate;
}