import { Component, ViewChild, HostListener, ChangeDetectorRef, ChangeDetectionStrategy, AfterViewInit, ElementRef } from '@angular/core';
//import { pTouchStartDirective } from './p-touchstart.directive'
import { ClicksService, Click, IPoint2D } from './clicks.service'
import { SettingsService } from './settings.service'

@Component({
    selector: "target",
    //directives: [ pTouchStartDirective ],
    templateUrl: 'target.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TargetComponent {
    @ViewChild('target') _target: ElementRef;
    private _context: CanvasRenderingContext2D;

    private get Canvas(): HTMLCanvasElement {
        return this._target.nativeElement;
    }

    private get Context(): CanvasRenderingContext2D {
        if (this._context == null)
            this._context = this.Canvas.getContext("2d");

        return this._context;
    }

    private _radius: number;
    private _radiusMax: number;
    private _radiusInc: number;
    private _center: IPoint2D;
    private _clicks: Click[];

    constructor(private clicksService: ClicksService, private settingsService: SettingsService, private cd: ChangeDetectorRef) {
        clicksService.clicks.subscribe(value => {
            this._clicks = value;
            this.cd.markForCheck();
        });
    }

    ngAfterViewInit() {
        this.animationFrame();
    }

    private _resources: Array<Array<any>> = [
        ["A 0-5°", 10, function () { return -1.0 * this._radiusInc / 2.0 }, "left", "middle"],
        ["B 6-10°", 10, function () { return -3.0 * this._radiusInc / 2.0 }, "left", "middle"],
        ["C 11-15°", 10, function () { return -5.0 * this._radiusInc / 2.0 }, "left", "middle"],
        ["D 16-20°", 10, function () { return -7.0 * this._radiusInc / 2.0 }, "left", "middle"],
        ["I AL", function () { return +this._radius - this._radiusInc }, function () { return -this._radius + this._radiusInc }, "left", "bottom"],
        ["II AM", function () { return -this._radius + this._radiusInc }, function () { return -this._radius + this._radiusInc }, "right", "bottom"],
        ["III PM", function () { return -this._radius + this._radiusInc }, function () { return +this._radius - this._radiusInc }, "right", "top"],
        ["IV PL", function () { return +this._radius - this._radiusInc }, function () { return +this._radius - this._radiusInc }, "left", "top"],
        ["Left", function () { return -this._radius - this._radiusInc / 2.0 }, 0.0, "right", "middle"],
        ["Right", function () { return +this._radius + this._radiusInc / 2.0 }, 0.0, "left", "middle"],
        ["Anterior", 0.0, function () { return -this._radius - this._radiusInc / 2.0 }, "center", "middle"],
        ["Posterior", 0.0, function () { return +this._radius + this._radiusInc / 2.0 }, "center", "middle"],
    ];

    private getResourceValue(resource: any): any { return typeof resource === "function" ? resource.call(this) : resource; }

    @HostListener('touchstart', [ '$event' ])
    @HostListener('mousedown', [ '$event' ])
    public OnTouchStart(ev : any) : void {
        ev.preventDefault();
        ev.stopPropagation();

        var container = this.Canvas;
        var offset: any = {
            left: container.offsetLeft,
            top: container.offsetTop
        };

        var ref: HTMLElement = container.offsetParent as HTMLElement;
        while (ref) {
            offset.left += ref.offsetLeft;
            offset.top += ref.offsetTop;

            ref = ref.offsetParent as HTMLElement;
        }

        var x = !!ev.touches ? ev.touches[0].pageX : ev.pageX;
        var y = !!ev.touches ? ev.touches[0].pageY : ev.pageY;

        var click: Click = new Click();
        click.x = (x - offset.left - this._center.x) / this._radius;
        click.y = (y - offset.top - this._center.y) / this._radius;
        click.cart2pol();

        if (click.r > 1.0)
            return;

        this.clicksService.append(click);

        this.Context.save();
        this.Context.fillStyle = "red";

        this.Context.beginPath();
        this.Context.arc(click.x * this._radius, click.y * this._radius, 10, 0, 2 * Math.PI);
        this.Context.closePath();
        this.Context.fill();

        this.Context.restore();
    }

    private update() {
        this.Canvas.width = this.Canvas.parentElement.clientWidth;
        this.Canvas.height = document.documentElement.clientHeight;
        this.Context.font = "0.17in monospace";

        this._radiusMax = (this.Canvas.width > this.Canvas.height ? this.Canvas.height : this.Canvas.width) / 2.0;
        this._radiusInc = this._radiusMax / (this.settingsService.CirclesCount + 1);
        this._radius = this._radiusInc * this.settingsService.CirclesCount;
        this._center = { x: this.Canvas.width / 2.0, y: this.Canvas.height / 2.0 };

        this.Context.translate(this._center.x, this._center.y);
    };

    private draw() {
        // render graphics
        this.Context.save();
        var fillStyles = ["#ff99c8", "#fcf6bd", "#d0f4de", "#a9def9", "#e4c1f9", "#9ee493", "#b4b8ab", "#eae8ff"];
        for (var i = this.settingsService.CirclesCount; i > 0; i--) {
            this.Context.beginPath();
            this.Context.arc(0.0, 0.0, this._radiusInc * i, 0, 2 * Math.PI);
            this.Context.closePath();
            this.Context.fillStyle = fillStyles[i - 1];
            this.Context.fill();
            this.Context.stroke();
        }
        this.Context.restore();

        this.Context.beginPath();
        this.Context.moveTo(-this._radius, 0.0);
        this.Context.lineTo(+this._radius, 0.0);
        this.Context.moveTo(0.0, -this._radius);
        this.Context.lineTo(0.0, +this._radius);
        this.Context.setLineDash([1, 1]);
        this.Context.stroke();
        this.Context.setLineDash([10, 10]);

        // render all resources
        this.Context.save();
        for (var i = 0; i < this._resources.length; i++) {
            var resource = this._resources[i];
            var text = this.getResourceValue(resource[0]);
            var x = this.getResourceValue(resource[1]);
            var y = this.getResourceValue(resource[2]);
            var textAlign = this.getResourceValue(resource[3]);
            var textBaseline = this.getResourceValue(resource[4]);

            this.Context.textAlign = textAlign;
            this.Context.textBaseline = textBaseline;
            this.Context.fillText(text, x, y);
        }
        this.Context.restore();

        this.Context.save();
        this.Context.fillStyle = "red";
        for (var i = 0; i < this._clicks.length; i++) {
            var click = this._clicks[i];
            this.Context.beginPath();
            this.Context.arc(click.x * this._radius, click.y * this._radius, 10, 0, 2 * Math.PI);
            this.Context.closePath();
            this.Context.fill();
        }
        this.Context.restore();
    };

    private animationFrame() {
        this.Context.save();
        this.Context.clearRect(0, 0, this.Canvas.width, this.Canvas.height);

        this.update();
        this.draw();

        this.Context.restore();
    };
}