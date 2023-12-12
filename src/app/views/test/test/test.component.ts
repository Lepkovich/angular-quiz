import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {TestService} from "../../../shared/services/test.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {QuizType} from "../../../../types/quiz.type";
import {ActionTestType} from "../../../../types/action-test.type";
import {UserResultType} from "../../../../types/user-result.type";
import {AuthService} from "../../../core/auth/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";

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
  chosenAnswerId: number | null = null;
  readonly userResult: UserResultType[] = [];
  actionTestType = ActionTestType;

  constructor(private activatedRoute: ActivatedRoute,
              private testService: TestService,
              private authService: AuthService,
              private router: Router,
              private _snackBar: MatSnackBar) {

  }

  ngOnInit() {
    this.activatedRoute.params
      .subscribe(param => {
        if (param['id']) {
          this.testService.getQuiz(param['id'])
            .subscribe(result => {
              if (result) {
                if ((result as DefaultResponseType).error !== undefined) {
                  this._snackBar.open('Ошибка получения вопросов теста')
                  throw new Error((result as DefaultResponseType).message);
                }
                this.quiz = result as QuizType;
                this.startQuiz();
              }
            })
        }
      })
  }

  get activeQuestion() {
    return this.quiz.questions[this.currentQuestionIndex - 1]
  }

  startQuiz(): void {

    this.interval = window.setInterval(() => {
      this.timerSeconds--;
      if (this.timerSeconds === 0) {
        clearInterval(this.interval);
        this.complete();
      }
    }, 1000);

  }

  complete(): void {
    const userInfo = this.authService.getUserInfo();
    if (userInfo) {
      this.testService.passQuiz(this.quiz.id, userInfo.userId, this.userResult)
        .subscribe(result => {
          if(result) {
            if ((result as DefaultResponseType).error !== undefined) {
              throw new Error((result as DefaultResponseType).message);
            }
            this.router.navigate(['/result'], {queryParams: {id: this.quiz.id}});
          }
        })
    }
  }

  move(action: ActionTestType): void {


    const existingResult: UserResultType | undefined = this.userResult.find(item => {
      return item.questionId === this.activeQuestion.id
    });
    if (this.chosenAnswerId) {
      if (existingResult) {
        existingResult.chosenAnswerId = this.chosenAnswerId;
      } else {
        this.userResult.push({
          questionId: this.activeQuestion.id,
          chosenAnswerId: this.chosenAnswerId
        });
      }
    }



    if (action === ActionTestType.next || action === ActionTestType.pass) {
      if (this.currentQuestionIndex === this.quiz.questions.length) {
        clearInterval(this.interval);
        this.complete();
        return;
      }
      this.currentQuestionIndex++;
    } else {
      this.currentQuestionIndex--;
    }


    const currentResult: UserResultType | undefined = this.userResult.find(item => {
      return item.questionId === this.activeQuestion.id;
    })
    if (currentResult) {
      this.chosenAnswerId = currentResult.chosenAnswerId;
    }
  }
}
