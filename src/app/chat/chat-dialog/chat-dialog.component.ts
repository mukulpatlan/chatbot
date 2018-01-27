import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Message, ChatService } from '../../chat.service';
import { SpeechRecognitionService } from '../../speech-recognition.service';

@Component({
  selector: 'chat-dialog',
  templateUrl: './chat-dialog.component.html',
  styleUrls: ['./chat-dialog.component.css']
})
export class ChatDialogComponent implements OnInit {

  messages: Observable<Message[]>;
  loading = false;
  formValue: string = '';
  showSearchButton: boolean = true;
  online$: Observable<boolean>;
  constructor(public chat: ChatService, public speechRecognitionService: SpeechRecognitionService) { }
  ngOnInit() {
    this.online$ = Observable.merge(
      Observable.of(navigator.onLine),
      Observable.fromEvent(window, 'online').mapTo(true),
      Observable.fromEvent(window, 'offline').mapTo(false)
    )
    // appends to array after each new message is added to feedSource
    this.messages = this.chat.conversation.asObservable()
      .scan((acc, val) => acc.concat(val));
  }
  sendMessage() {
    if (this.formValue != '' || this.loading) {
      this.loading = true;
      this.chat.converse(this.formValue).then(
        success => {
          this.loading = false;
        }
      )
    }
    this.formValue = '';
  }

  activateSpeechSearchMovie(): void {
    this.showSearchButton = false;

    this.speechRecognitionService.record()
      .subscribe(
      //listener
      (value) => {
        this.showSearchButton = true;
        this.formValue = value;
        this.sendMessage();
        console.log(value);
      },
      //errror
      (err) => {
        console.log(err);
        if (err.error == "no-speech") {
          this.showSearchButton = true;
          console.log("--restatring service--");
          // this.activateSpeechSearchMovie();
        }
      },
      //completion
      () => {
        this.showSearchButton = true;
        console.log("--complete--");
        // this.activateSpeechSearchMovie();
      });
  }
}
