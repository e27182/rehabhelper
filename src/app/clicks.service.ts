import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Observable'
import { Statistics } from './statistics'
import { SettingsService } from './settings.service'

export interface IPoint2D {
    x: number;
    y: number;
}

export interface IPointPolar {
    r: number;
    phi: number;
}

export class Click implements IPoint2D, IPointPolar {
    x: number;
    y: number;
    r: number;
    phi: number;
    phiDeg: number;

    cart2pol() {
        this.r = Math.sqrt(this.x * this.x + this.y * this.y);
        this.phi = Math.atan2(this.y, this.x);
        this.phiDeg = this.phi * 180.0 / Math.PI;
    }

    pol2cart() {
        this.x = this.r * Math.cos(this.phi);
        this.y = this.r * Math.sin(this.phi);
    }
}

@Injectable()
export class ClicksService {
    constructor(private settingsService: SettingsService) {
    }

    private _clicks: BehaviorSubject<Click[]> = new BehaviorSubject([]);
    public clicks: Observable<Click[]> = this._clicks.asObservable();
    
    private _statistics: BehaviorSubject<Statistics> = new BehaviorSubject({
        Overall: { Score: 0.0, StdDev: 0.00 },
        APIndex: { Score: 0.0, StdDev: 0.00 },
        MLIndex: { Score: 0.0, StdDev: 0.00 },
        TimeInZone: { A: 0, B: 0, C: 0, D: 0 },
        TimeInQuadrant: { I: 0, II: 0, III: 0, IV: 0 }
    });
    public statistics: Observable<Statistics> = this._statistics.asObservable();

    private _statistics_internal = {
        ClicksInZone: { A: 0, B: 0, C: 0, D: 0 },
        ClicksInQuadrant: { I: 0, II: 0, III: 0, IV: 0 },
        X: { T: new Array<number>() },
        Y: { T: new Array<number>() },
        R: { T: new Array<number>() },
    };

    append (click: Click) {
        var value = this._clicks.getValue();
        value.push(click);
        this._clicks.next(value);
        
        this.updateStatistics(click);
    };

    private stddev(T: number[]): number { return Math.sqrt(T[0] * T[2] - T[1] * T[1]) / T[0]; }

    private updateStatistics(click: Click) {
        var circleLength = this.settingsService.getCircleLength();
        var maxAngleDeg = this.settingsService.MaxAngleDeg;
        var clicksLength = this._clicks.getValue().length;

        if (click.r <= 1.0 * circleLength)
            this._statistics_internal.ClicksInZone.A++;
        else if (click.r <= 2.0 * circleLength)
            this._statistics_internal.ClicksInZone.B++;
        else if (click.r <= 3.0 * circleLength)
            this._statistics_internal.ClicksInZone.C++;
        else if (click.r <= 4.0 * circleLength)
            this._statistics_internal.ClicksInZone.D++;

        if (click.phi <= -0.0 * Math.PI && click.phi > -0.5 * Math.PI)
            this._statistics_internal.ClicksInQuadrant.I++;
        else if (click.phi <= -0.5 * Math.PI && click.phi > -1.0 * Math.PI)
            this._statistics_internal.ClicksInQuadrant.II++;
        else if (click.phi >= 0.5 * Math.PI && click.phi < 1.0 * Math.PI)
            this._statistics_internal.ClicksInQuadrant.III++;
        else if (click.phi >= 0.0 * Math.PI && click.phi < 0.5 * Math.PI)
            this._statistics_internal.ClicksInQuadrant.IV++;

        var newStatistics = this._statistics.getValue();

        newStatistics.TimeInZone.A = this._statistics_internal.ClicksInZone.A / clicksLength;
        newStatistics.TimeInZone.B = this._statistics_internal.ClicksInZone.B / clicksLength;
        newStatistics.TimeInZone.C = this._statistics_internal.ClicksInZone.C / clicksLength;
        newStatistics.TimeInZone.D = this._statistics_internal.ClicksInZone.D / clicksLength;
        newStatistics.TimeInQuadrant.I = this._statistics_internal.ClicksInQuadrant.I / clicksLength;
        newStatistics.TimeInQuadrant.II = this._statistics_internal.ClicksInQuadrant.II / clicksLength;
        newStatistics.TimeInQuadrant.III = this._statistics_internal.ClicksInQuadrant.III / clicksLength;
        newStatistics.TimeInQuadrant.IV = this._statistics_internal.ClicksInQuadrant.IV / clicksLength;

        for (var i = 0; i < 3; i++) {
            this._statistics_internal.X.T[i] = (this._statistics_internal.X.T[i] || 0.0) + Math.pow(click.x, i);
            this._statistics_internal.Y.T[i] = (this._statistics_internal.Y.T[i] || 0.0) + Math.pow(click.y, i);
            this._statistics_internal.R.T[i] = (this._statistics_internal.R.T[i] || 0.0) + Math.pow(click.r, i);
        }

        newStatistics.Overall.Score = Math.sqrt((this._statistics_internal.X.T[2] + this._statistics_internal.Y.T[2]) / this._statistics_internal.X.T[0]) * maxAngleDeg;
        //newStatistics.Overall.Score = Math.sqrt(this._statistics_internal.R.T[2] / this._statistics_internal.R.T[0]) * maxAngleDeg;
        newStatistics.MLIndex.Score = Math.sqrt(this._statistics_internal.X.T[2] / this._statistics_internal.X.T[0]) * maxAngleDeg;
        newStatistics.APIndex.Score = Math.sqrt(this._statistics_internal.Y.T[2] / this._statistics_internal.Y.T[0]) * maxAngleDeg;

        newStatistics.Overall.StdDev = this.stddev(this._statistics_internal.R.T) * maxAngleDeg;
        newStatistics.MLIndex.StdDev = this.stddev(this._statistics_internal.X.T) * maxAngleDeg;
        newStatistics.APIndex.StdDev = this.stddev(this._statistics_internal.Y.T) * maxAngleDeg;

        this._statistics.next(newStatistics); // TODO: make Statistics mutable?
    };
}