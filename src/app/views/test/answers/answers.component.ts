import {Component, OnInit} from '@angular/core';
import {DefaultResponseType} from "../../../../types/default-response.type";
import {QuizResultType} from "../../../../types/quiz.type";
import {ActivatedRoute, Router} from "@angular/router";
import {TestService} from "../../../shared/services/test.service";
import {AuthService} from "../../../core/auth/auth.service";

@Component({
  selector: 'app-answers',
  templateUrl: './answers.component.html',
  styleUrls: ['./answers.component.scss']
})
export class AnswersComponent implements OnInit{

  quizResult!: QuizResultType;
  userEmail: string | null = '';
  userInfo: string | undefined = '';
  userId: number | undefined = 0;
  testName: string = '';

  constructor(private activatedRoute: ActivatedRoute,
              private testService: TestService,
              private authService: AuthService,
              private router: Router) {
  }

  ngOnInit() {
    this.userInfo = this.authService.getUserInfo()?.fullName;
    this.userId = this.authService.getUserInfo()?.userId;

    this.userEmail = this.authService.getUserEmail();

    if (this.userId)  {
      this.activatedRoute.params
        .subscribe(param => {
          if (param['id']) {
            this.testService.getQuizResults(param['id'], this.userId as number)
              .subscribe(result => {
                if(result) {
                  if ((result as DefaultResponseType).error) {
                    throw new Error((result as DefaultResponseType).message as string);
                  }
                  this.quizResult = result as QuizResultType;
                  this.testName = this.quizResult.test.name;

                  console.log(this.quizResult);
                }

              })
          }
        })
    }
  }

  get questions() {
    return this.quizResult.test.questions
  }

  backToResults() {
    window.history.back();
    // this.router.navigate(['/result'], {queryParams: {id: this.quiz.id}});
  }
}
