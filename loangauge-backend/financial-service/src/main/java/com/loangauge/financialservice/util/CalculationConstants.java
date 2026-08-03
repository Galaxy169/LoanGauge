package com.loangauge.financialservice.util;

import java.math.MathContext;
import java.math.RoundingMode;

public final class CalculationConstants {

    private CalculationConstants() {}

    /** For intermediate steps high precision, rounded only at the end. */
    public static final MathContext MC = MathContext.DECIMAL64;

    /** Final scale for money values (rupees). */
    public static final int MONEY_SCALE = 2;

    /** Final scale for ratios/percentages. */
    public static final int RATIO_SCALE = 2;

    public static final RoundingMode ROUNDING = RoundingMode.HALF_UP;
}