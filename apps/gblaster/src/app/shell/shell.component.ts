import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { TitleService } from '@motabass/helper-services/title';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'mtb-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent {
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  @ViewChild('drawer') sidenav?: MatSidenav;

  constructor(private breakpointObserver: BreakpointObserver, private titleService: TitleService) {}

  get title(): Observable<string> {
    return this.titleService.title;
  }

  closeSidenav() {
    this.sidenav?.close();
  }
}