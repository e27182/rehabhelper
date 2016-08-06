export class Score {
    Score: number;
    StdDev: number;
}

export class TimeInZone {
    A: number;
    B: number;
    C: number;
    D: number;
}

export class TimeInQuadrant {
    I: number;
    II: number;
    III: number;
    IV: number;
}

export class Statistics {
    Overall: Score;
    APIndex: Score;
    MLIndex: Score;
    TimeInZone: TimeInZone;
    TimeInQuadrant: TimeInQuadrant;
}