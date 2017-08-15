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

  interval1 = 500;
  interval2 = 500;

  recordEnabled = false;

  private subs = {};

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
    this.subs['Color1'] = Observable.timer(0, 2000).subscribe(() => {
      this.balls.genBall('Color1');
    });

    this.subs['Color2'] = Observable.timer(1000, 2000).subscribe(() => {
      this.balls.genBall('Color2');
    });
  }

  private initTimers(id: string, value: number) {
    this.subs[id].unsubscribe();
    this.subs[id] = Observable.timer(value / 2, value).subscribe(() => {
      this.balls.genBall(id);
    });
  }

  private enableAudioCapture = () => {
    let audio = document.querySelector('audio');

    if (this.recordEnabled) {
      navigator.getUserMedia(
        {
          audio: true
        },
        (stream) => {
          audio.src = URL.createObjectURL(stream);
          audio.play();

          this.audioStream = stream;

          let source = this.audioContext.createMediaStreamSource(stream);
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
    this.analyser.minDecibels = -50;
    this.analyser.maxDecibels = 0;

    let bufferLength = this.analyser.frequencyBinCount;
    let dataArray = new Uint8Array(bufferLength);
    // let dataArray = new Float32Array(bufferLength);

    this.analyser.getByteFrequencyData(dataArray);
    // this.analyser.getFloatFrequencyData(dataArray);

    let getAverage = (data: Uint8Array) => {
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        sum += data[i];
        return sum / data.length;
      }
    };

    let avg = getAverage(dataArray);
    if (avg > 0 && avg < 6.5) {
      // console.log(avg);
      this.balls.genBall('Color1');
    } else if (avg > 6.5) {
      this.balls.genBall('Color2');
    }
  }

  sliderChanged(e: any) {
    this.initTimers(e.target.id, e.target.value);
  }

  recordModeChanged() {
    if (this.recordEnabled) {
      // Clear ball timers
      Object.keys(this.subs).forEach(key => {
        this.subs[key].unsubscribe();
      });
    }

    this.enableAudioCapture();
  }

  ngOnDestroy() {
    console.log('Destroy timer');
    // this.sub1.unsubscribe();
    // this.sub2.unsubscribe();
  }
}
