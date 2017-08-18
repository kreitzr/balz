import { BallsModule } from './b4w-balls-module';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { Blend4WebService } from './b4w.service';
import { Blend4WebModule } from './b4w-module';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ],
  providers: [Blend4WebService]
})

export class AppComponent implements OnInit, OnDestroy {
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  audioStream: MediaStream;

  name = 'Blend4Web Test';
  modules: Blend4WebModule[];

  interval1 = 1000; interval2 = 1000;

  recordEnabled = false;

  // private subs = {};
  private ballTimers = {};

  private balls: BallsModule = new BallsModule();

  constructor(private b4w: Blend4WebService) {
    this.balls.onLoadCallback$.subscribe(this.initScene);
  }

  ngOnInit() {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.b4w.InitModule(this.balls);
  }

  private initScene = () => {
    this.setBallTimer('Color1', this.interval1);
    this.setBallTimer('Color2', this.interval2);

    // this.subs['Color1'] = Observable.timer(0, 2000).subscribe(() => {
    //   this.balls.genBall('Color1');
    // });

    // this.subs['Color2'] = Observable.timer(1000, 2000).subscribe(() => {
    //   this.balls.genBall('Color2');
    // });
  }

  // private initTimers(id: string, value: number) {
  //   this.subs[id].unsubscribe();
  //   this.subs[id] = Observable.timer(value / 2, value).subscribe(() => {
  //     this.balls.genBall(id);
  //   });
  // }

  private setBallTimer(id: string, value: number) {
    clearInterval(this.ballTimers[id]);
    this.ballTimers[id] = setInterval(this.balls.genBall, value, id);
  }

  private enableAudioCapture = () => {
    // let audio = document.querySelector('audio');

    if (this.recordEnabled) {
      navigator.getUserMedia(
        {
          audio: true
        },
        (stream) => {
          // audio.src = URL.createObjectURL(stream);
          // audio.play();

          this.audioStream = stream;

          const source = this.audioContext.createMediaStreamSource(stream);
          source.connect(this.analyser);
          // analyser.connect(this.audioContext.destination);

          this.visualize();
        },
        (err) => {
          console.log('Error!');
        });
    } else {
      this.audioStream.getAudioTracks().forEach((track) => {
        track.stop();
      });
    }
  }

  private visualize = () => {
    if (this.recordEnabled) {
      requestAnimationFrame(this.visualize);
    }

    this.analyser.fftSize = 32;
    // this.analyser.minDecibels = -70;
    // this.analyser.maxDecibels = 0;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    // let dataArray = new Float32Array(bufferLength);

    this.analyser.getByteFrequencyData(dataArray);
    // this.analyser.getFloatFrequencyData(dataArray);

    const avg = () => {
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
        return sum / dataArray.length;
      };
    }

    // if (avg > 0 && avg < 6.5) {
    //   // console.log(avg);
    //   this.balls.genBall('Color1');
    // } else if (avg > 6.5) {
    //   this.balls.genBall('Color2');
    // }

    this.setBallTimer('Color1', avg());
  }

  sliderChanged(e: any) {
    // this.initTimers(e.target.id, e.target.value);
    this.setBallTimer(e.target.id, e.target.value);
  }

  recordModeChanged() {
    if (this.recordEnabled) {
      // Clear ball timers
      Object.keys(this.ballTimers).forEach(key => {
        clearInterval(this.ballTimers[key]);
      });
    } else {
      this.initScene();
    }

    this.enableAudioCapture();
  }

  ngOnDestroy() {
    console.log('Destroy timer');
    // this.sub1.unsubscribe();
    // this.sub2.unsubscribe();
  }
}
