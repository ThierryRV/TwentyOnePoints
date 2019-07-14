import { Component, OnInit } from '@angular/core';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import * as moment from 'moment';
import { JhiAlertService } from 'ng-jhipster';
import { IWeight, Weight } from 'app/shared/model/weight.model';
import { WeightService } from './weight.service';
import { IUser, UserService } from 'app/core';

@Component({
  selector: 'jhi-weight-update',
  templateUrl: './weight-update.component.html'
})
export class WeightUpdateComponent implements OnInit {
  isSaving: boolean;

  users: IUser[];
  timestampDp: any;

  editForm = this.fb.group({
    id: [],
    timestamp: [null, [Validators.required]],
    weight: [],
    user: []
  });

  constructor(
    protected jhiAlertService: JhiAlertService,
    protected weightService: WeightService,
    protected userService: UserService,
    protected activatedRoute: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.isSaving = false;
    this.activatedRoute.data.subscribe(({ weight }) => {
      this.updateForm(weight);
    });
    this.userService
      .query()
      .pipe(
        filter((mayBeOk: HttpResponse<IUser[]>) => mayBeOk.ok),
        map((response: HttpResponse<IUser[]>) => response.body)
      )
      .subscribe((res: IUser[]) => (this.users = res), (res: HttpErrorResponse) => this.onError(res.message));
  }

  updateForm(weight: IWeight) {
    this.editForm.patchValue({
      id: weight.id,
      timestamp: weight.timestamp,
      weight: weight.weight,
      user: weight.user
    });
  }

  previousState() {
    window.history.back();
  }

  save() {
    this.isSaving = true;
    const weight = this.createFromForm();
    if (weight.id !== undefined) {
      this.subscribeToSaveResponse(this.weightService.update(weight));
    } else {
      this.subscribeToSaveResponse(this.weightService.create(weight));
    }
  }

  private createFromForm(): IWeight {
    return {
      ...new Weight(),
      id: this.editForm.get(['id']).value,
      timestamp: this.editForm.get(['timestamp']).value,
      weight: this.editForm.get(['weight']).value,
      user: this.editForm.get(['user']).value
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IWeight>>) {
    result.subscribe(() => this.onSaveSuccess(), () => this.onSaveError());
  }

  protected onSaveSuccess() {
    this.isSaving = false;
    this.previousState();
  }

  protected onSaveError() {
    this.isSaving = false;
  }
  protected onError(errorMessage: string) {
    this.jhiAlertService.error(errorMessage, null, null);
  }

  trackUserById(index: number, item: IUser) {
    return item.id;
  }
}
