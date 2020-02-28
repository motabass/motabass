import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { RouterModule } from '@angular/router';
import { GamepadModule } from '@motabass/helper-services/gamepad';
import { VisualsModule } from '@motabass/ui-components/visuals';
import { CoverDisplayComponent } from './cover-display/cover-display.component';
import { BandPipe } from './equalizer/band.pipe';
import { EqualizerComponent } from './equalizer/equalizer.component';
import { PlayerComponent } from './player.component';
import { PlaylistComponent } from './playlist/playlist.component';
import { TimePipe } from './time.pipe';
import { VisualizerComponent } from './visualizer/visualizer.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', pathMatch: 'full', component: PlayerComponent }]),
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatSliderModule,
    FlexLayoutModule,
    VisualsModule,
    MatMenuModule,
    MatInputModule,
    MatSelectModule,
    GamepadModule
  ],
  declarations: [PlayerComponent, PlaylistComponent, TimePipe, CoverDisplayComponent, VisualizerComponent, EqualizerComponent, BandPipe]
})
export class PlayerModule {}
