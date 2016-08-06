export class SettingsService {
    private _circlesCount: number;
    private _maxAngleDeg: number;

    constructor() {
        this.CirclesCount = 4;
        this.MaxAngleDeg = 20.0;
    }

    get CirclesCount(): number { return this._circlesCount; }
    set CirclesCount(value: number) { this._circlesCount = value; }

    get MaxAngleDeg(): number { return this._maxAngleDeg; }
    set MaxAngleDeg(value: number) { this._maxAngleDeg = value; }

    getCircleLength(): number { return 1.0 / this.CirclesCount; }
}