import { Component, Input, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs/Observable'
import { Statistics } from './statistics'
import { ClicksService } from './clicks.service'

@Component({
    selector: "statistics",
    templateUrl: './statistics.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatisticsComponent {
    @Input() Statistics: Statistics;

    constructor(private clicksService: ClicksService, private cd: ChangeDetectorRef) {
        clicksService.statistics.subscribe(value => {
            this.Statistics = value;
            this.cd.markForCheck();
        });
    }
}