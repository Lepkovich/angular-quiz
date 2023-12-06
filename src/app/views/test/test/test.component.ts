import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {TestService} from "../../../shared/services/test.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {QuizType} from "../../../../types/quiz.type";

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {

  quiz!: QuizType; // не стали делать | null, чтобы облегчить следующие взаимодействия с quiz. Сделали защиту в шаблоне *ngIf="quiz"
  timerSeconds: number = 59;
  private interval = 0;
  currentQuestionIndex: number = 1;
  constructor(private activatedRoute: ActivatedRoute,
              private testService: TestService) {

  }

  ngOnInit() {
    this.activatedRoute.params
      .subscribe(param => {
        if (param['id']) {
          this.testService.getQuiz(param['id'])
            .subscribe(result => {
              if (result) {
                if ((result as DefaultResponseType).error !== undefined) {
                  throw new Error((result as DefaultResponseType).message); //реализовать snackbar с ошибкой
                }
                this.quiz = result as QuizType;
                this.startQuiz();
              }
            })
        }
      })
  }

  startQuiz(): void {
    // progress bar

    //show question

    //timer

    this.interval = window.setInterval(() => {
      this.timerSeconds--;
      if (this.timerSeconds === 0) {
        clearInterval(this.interval);
        this.complete();
      }
    }, 1000);
  }

  complete(): void {

  }


}
