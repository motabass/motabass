import { Injectable } from '@angular/core';
import { LocalStorage, LocalStorageService } from 'ngx-webstorage';
import { MetadataService } from './metadata.service';
import { NativeFileLoaderService } from './native-file-loader.service';
import { Song, SongMetadata } from './player.types';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private audioCtx: AudioContext;
  private gainNode: GainNode;
  private analyserNode: AnalyserNode;
  private audioSrcNode: MediaElementAudioSourceNode;

  private _songs: Song[] = [];
  get songs(): Song[] {
    return this._songs;
  }
  set songs(songs: Song[]) {
    this._songs = songs;
  }

  private _playingSong: Song;
  get playingSong(): Song {
    return this._playingSong;
  }
  set playingSong(song: Song) {
    this.audioElement.src = song.url;
    this._playingSong = song;

    this.setBrowserMetadata(song.metadata);

    this.audioSrcNode.connect(this.analyserNode);
  }

  audioElement: HTMLAudioElement;

  selectedSong: Song;

  @LocalStorage('repeat', false)
  repeat;
  @LocalStorage('shuffle', false)
  shuffle;

  constructor(private fileLoaderService: NativeFileLoaderService, private metadataService: MetadataService, private storageService: LocalStorageService) {
    this.initialzeAudioNodes();

    this.gainNode.gain.value = storageService.retrieve('volume');

    if ('mediaSession' in navigator) {
      // @ts-ignore
      navigator.mediaSession.setActionHandler('play', this.playPause.bind(this));
      // @ts-ignore
      navigator.mediaSession.setActionHandler('pause', this.playPause.bind(this));
      // @ts-ignore
      navigator.mediaSession.setActionHandler('nexttrack', this.next.bind(this));
      // @ts-ignore
      navigator.mediaSession.setActionHandler('previoustrack', this.previous.bind(this));
    }
  }

  initialzeAudioNodes() {
    const audio = new Audio();
    audio.loop = false;
    audio.autoplay = false;
    audio.controls = false;
    audio.preload = 'metadata';
    audio.onended = () => {
      console.log('ended');
      this.next();
    };
    audio.onerror = (e) => {
      console.error(e);
    };

    this.audioCtx = new AudioContext();

    const analyser = this.audioCtx.createAnalyser();
    const gainNode = this.audioCtx.createGain();

    analyser.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);

    this.analyserNode = analyser;
    this.gainNode = gainNode;
    this.audioElement = audio;
    this.audioSrcNode = this.audioCtx.createMediaElementSource(this.audioElement);
  }

  async loadFolder() {
    const newFolder: boolean = await this.fileLoaderService.openFolder();
    if (newFolder) {
      const fileHandles = this.fileLoaderService.currentFolderFileHandles;
      const songs: Song[] = [];
      for (const fileHandle of fileHandles) {
        const song = await this.createSongFromFileHandle(fileHandle);
        songs.push(song);
      }
      this.songs = songs;
    }
  }

  private async createSongFromFileHandle(fileHandle: any): Promise<Song> {
    const file = await fileHandle.getFile();
    const metadata: SongMetadata = await this.metadataService.extractMetadata(file);
    const url = URL.createObjectURL(file);
    return {
      // howl: this.howlerService.createHowlFromFile(file),
      url: url,
      fileHandle: fileHandle,
      metadata: metadata
    };
  }

  set volume(value: number) {
    this.storageService.store('volume', value);
    this.gainNode.gain.value = value;
  }

  get volume() {
    return this.gainNode.gain.value;
  }

  get analyser(): AnalyserNode {
    return this.analyserNode;
  }

  setSeekPosition(sliderValue) {
    // this.currentSong.howl.seek(sliderValue);
    this.audioElement.currentTime = sliderValue;
  }

  get durationSeconds(): number {
    // return this.currentSong ? Math.round(this.currentSong.howl.duration()) : 0;
    return this.playingSong ? Math.round(this.audioElement.duration) : 0;
  }

  get currentTime(): number {
    if (!this.playingSong) {
      return 0;
    }
    const pos = this.audioElement.currentTime;
    if (pos !== null && pos !== undefined) {
      return Math.floor(pos);
    } else {
      return 0;
    }
  }

  async playPauseSong(song: Song): Promise<void> {
    if (this.playingSong && song === this.playingSong) {
      this.playPause();
      return;
    }

    this.stop();

    this.playingSong = song;

    return this.audioElement.play();
  }

  playPause() {
    if (!this.playingSong) {
      return;
    }
    if (this.audioElement.paused) {
      this.audioElement.play();
    } else {
      this.audioElement.pause();
    }
  }

  stop() {
    if (!this.playingSong) {
      return;
    }
    if (this.playing) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    } else {
      this.audioElement.currentTime = 0;
    }
  }

  next() {
    if (!this.playingSong) {
      return;
    }
    const currPo = this.playingSong.playlistPosition;
    if (currPo < this._songs.length) {
      this.playPauseSong(this._songs[currPo]);
    }
  }

  previous() {
    if (!this.playingSong) {
      return;
    }
    const currPo = this.playingSong.playlistPosition;
    if (currPo > 1 && this.playing) {
      this.playPauseSong(this._songs[currPo - 2]);
    }
  }

  get playing(): boolean {
    return this.playingSong && !this.audioElement.paused;
  }

  toggleRepeat() {
    if (!this.repeat) {
      this.audioElement.loop = true;
      this.repeat = true;
    } else {
      this.audioElement.loop = false;
      this.repeat = false;
    }
  }

  toggleShuffle() {
    this.shuffle = !this.shuffle;
  }

  // startPositionReporter(song: Song) {
  //   if ('mediaSession' in navigator) {
  //     const positionInterval = setInterval(() => {
  //       if (song.howl.playing()) {
  //         // @ts-ignore
  //         navigator.mediaSession.setPositionState({
  //           duration: song.howl.duration(),
  //           playbackRate: 1,
  //           position: song.howl.seek() as number
  //         });
  //       } else {
  //         window.clearInterval(positionInterval);
  //       }
  //     }, 1000);
  //   }
  // }

  setBrowserMetadata(metadata: SongMetadata) {
    if ('mediaSession' in navigator) {
      // @ts-ignore
      navigator.mediaSession.metadata = new MediaMetadata({
        title: metadata.title,
        artist: metadata.artist,
        album: metadata.album,
        artwork: [{ src: metadata.coverUrl, sizes: '512x512' }]
      });
    }
  }
}