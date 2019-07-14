import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { DATE_FORMAT } from 'app/shared/constants/input.constants';
import { map } from 'rxjs/operators';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption } from 'app/shared';
import { IBloodPressure } from 'app/shared/model/blood-pressure.model';

type EntityResponseType = HttpResponse<IBloodPressure>;
type EntityArrayResponseType = HttpResponse<IBloodPressure[]>;

@Injectable({ providedIn: 'root' })
export class BloodPressureService {
  public resourceUrl = SERVER_API_URL + 'api/blood-pressures';
  public resourceSearchUrl = SERVER_API_URL + 'api/_search/blood-pressures';

  constructor(protected http: HttpClient) {}

  create(bloodPressure: IBloodPressure): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(bloodPressure);
    return this.http
      .post<IBloodPressure>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  update(bloodPressure: IBloodPressure): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(bloodPressure);
    return this.http
      .put<IBloodPressure>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<IBloodPressure>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IBloodPressure[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map((res: EntityArrayResponseType) => this.convertDateArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<any>> {
    return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  search(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<IBloodPressure[]>(this.resourceSearchUrl, { params: options, observe: 'response' })
      .pipe(map((res: EntityArrayResponseType) => this.convertDateArrayFromServer(res)));
  }

  protected convertDateFromClient(bloodPressure: IBloodPressure): IBloodPressure {
    const copy: IBloodPressure = Object.assign({}, bloodPressure, {
      date: bloodPressure.date != null && bloodPressure.date.isValid() ? bloodPressure.date.format(DATE_FORMAT) : null
    });
    return copy;
  }

  protected convertDateFromServer(res: EntityResponseType): EntityResponseType {
    if (res.body) {
      res.body.date = res.body.date != null ? moment(res.body.date) : null;
    }
    return res;
  }

  protected convertDateArrayFromServer(res: EntityArrayResponseType): EntityArrayResponseType {
    if (res.body) {
      res.body.forEach((bloodPressure: IBloodPressure) => {
        bloodPressure.date = bloodPressure.date != null ? moment(bloodPressure.date) : null;
      });
    }
    return res;
  }
}
