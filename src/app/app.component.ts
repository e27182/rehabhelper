import * as FastClick from 'fastclick';
import { Component, HostListener } from '@angular/core';
import { StatisticsComponent } from './statistics.component'
import { TargetComponent } from './target.component'

import '../../public/css/styles.css';

@Component({
    selector: "app",
    directives: [ StatisticsComponent, TargetComponent ],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    // host: {
    //     '(document:touchmove)': '_touchmove($event)'
    // }
})
export class AppComponent {
    constructor() {
        FastClick["attach"](document.body);
    }

    @HostListener('document:touchmove', [ '$event' ])
    private onTouchMove(event: TouchEvent) {
        event.preventDefault();
    }
}